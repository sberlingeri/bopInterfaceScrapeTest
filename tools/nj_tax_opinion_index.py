#!/usr/bin/env python3
"""Build a comprehensive New Jersey Tax Court opinion index.

Sources:
- CourtListener public search API (structured metadata and opinion links)
- Justia New Jersey Tax Court archive (coverage cross-check and page metadata)
- NJ Courts current opinion pages (official-source cross-check where available)

The script produces CSV/JSON/README artifacts. It intentionally does not include
complete opinion text; it extracts metadata and compact snippets so that full text
can be pulled in a later stage from the preserved source/PDF URLs.
"""

from __future__ import annotations

import csv
import hashlib
import html
import json
import logging
import os
import random
import re
import sys
import time
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date, datetime
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Iterable, Iterator
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

LOG = logging.getLogger("nj_tax_index")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

OUT_DIR = Path(os.getenv("NJ_TAX_OUT_DIR", "output/nj_tax_opinion_index"))
OUT_DIR.mkdir(parents=True, exist_ok=True)

CURRENT_YEAR = date.today().year
FIRST_YEAR = 1980
USER_AGENT = (
    "Mozilla/5.0 (compatible; NJTaxOpinionIndex/1.0; "
    "+https://github.com/sberlingeri/bopInterfaceScrapeTest)"
)
COURTLISTENER_SEARCH = "https://www.courtlistener.com/api/rest/v4/search/"
COURTLISTENER_STORAGE = "https://storage.courtlistener.com/"
JUSTIA_ROOT = "https://law.justia.com"
JUSTIA_TAX_ROOT = f"{JUSTIA_ROOT}/cases/new-jersey/tax-court/"
NJ_PUBLISHED_TAX = "https://www.njcourts.gov/attorneys/opinions/published-tax"
NJ_UNPUBLISHED_TAX = "https://www.njcourts.gov/attorneys/opinions/unpublished-tax"


@dataclass
class FetchFailure:
    source: str
    url: str
    error: str
    context: str = ""


FAILURES: list[FetchFailure] = []


def make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        status=5,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET", "HEAD"}),
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=20, pool_maxsize=20)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        }
    )
    return session


SESSION = make_session()


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    value = html.unescape(str(value))
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()


def normalize_name(value: str) -> str:
    value = clean_text(value).lower()
    value = value.replace("&", " and ")
    value = re.sub(r"\b(et\.?\s+al\.?|etc\.?|c/o|t/a|a/k/a)\b", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def normalize_docket(value: str) -> str:
    value = clean_text(value).upper()
    value = value.replace("DOCKET", "").replace("NO.", "").replace("NOS.", "")
    return re.sub(r"[^A-Z0-9]", "", value)


def split_dockets(value: str) -> list[str]:
    raw = clean_text(value)
    if not raw:
        return []
    # Capture the common Tax Court and appellate forms first.
    patterns = [
        r"\b\d{4,6}\s*-\s*\d{2,4}\b",
        r"\bA\s*-\s*\d{3,5}\s*-\s*\d{2,4}\b",
        r"\bD\s*-\s*\d{3,5}\s*-\s*\d{2,4}\b",
    ]
    found: list[str] = []
    for pattern in patterns:
        for match in re.findall(pattern, raw, flags=re.I):
            docket = re.sub(r"\s+", "", match).upper()
            if docket not in found:
                found.append(docket)
    if found:
        return found
    # Fall back to comma/semicolon-separated tokens, avoiding obvious noise.
    for token in re.split(r"[,;|/]", raw):
        token = clean_text(token).strip(" .")
        if re.search(r"\d", token) and len(token) <= 40:
            if token not in found:
                found.append(token)
    return found


def parse_date(value: str) -> str:
    value = clean_text(value).strip(" .")
    if not value:
        return ""
    for fmt in (
        "%B %d, %Y",
        "%b. %d, %Y",
        "%b %d, %Y",
        "%Y-%m-%d",
        "%m/%d/%Y",
    ):
        try:
            return datetime.strptime(value, fmt).date().isoformat()
        except ValueError:
            pass
    # Normalize occasional double spaces or missing punctuation.
    value2 = value.replace("Sept.", "Sep").replace("June", "Jun").replace("July", "Jul")
    for fmt in ("%b %d, %Y", "%B %d %Y"):
        try:
            return datetime.strptime(value2.replace(".", ""), fmt).date().isoformat()
        except ValueError:
            pass
    return value


def first_nonempty(*values: Any) -> str:
    for value in values:
        text = clean_text(value)
        if text:
            return text
    return ""


def get_json(url: str, params: dict[str, Any] | None = None, *, context: str = "") -> dict[str, Any]:
    try:
        response = SESSION.get(url, params=params, timeout=90)
        response.raise_for_status()
        return response.json()
    except Exception as exc:  # noqa: BLE001
        FAILURES.append(FetchFailure("json", response.url if 'response' in locals() else url, repr(exc), context))
        LOG.warning("JSON fetch failed: %s (%s)", url, exc)
        return {}


def get_html(url: str, *, context: str = "", allow_failure: bool = True) -> str:
    try:
        response = SESSION.get(url, timeout=90)
        response.raise_for_status()
        return response.text
    except Exception as exc:  # noqa: BLE001
        if allow_failure:
            FAILURES.append(FetchFailure("html", response.url if 'response' in locals() else url, repr(exc), context))
        LOG.warning("HTML fetch failed: %s (%s)", url, exc)
        return ""


def courtlistener_file_url(opinions: list[dict[str, Any]]) -> str:
    for opinion in opinions or []:
        local_path = clean_text(opinion.get("local_path"))
        if local_path:
            return urljoin(COURTLISTENER_STORAGE, local_path.lstrip("/"))
        download_url = clean_text(opinion.get("download_url"))
        if download_url:
            return download_url
    return ""


def fetch_courtlistener_results(
    *,
    courts: str,
    query: str | None = None,
    max_results: int | None = None,
    order_by: str = "dateFiled asc",
) -> list[dict[str, Any]]:
    """Paginate CourtListener's public search endpoint."""
    params: dict[str, Any] = {
        "format": "json",
        "type": "o",
        "court": courts,
        "page_size": 20,
        "order_by": order_by,
    }
    if query:
        params["q"] = query
    url: str | None = COURTLISTENER_SEARCH
    rows: list[dict[str, Any]] = []
    page = 0
    while url:
        page += 1
        data = get_json(url, params=params if page == 1 else None, context=f"CourtListener {courts} {query or 'all'} page {page}")
        if not data:
            # v4 occasionally changes access behavior; try v3 once.
            if page == 1 and "/v4/" in url:
                url = url.replace("/v4/", "/v3/")
                continue
            break
        results = data.get("results") or []
        if not isinstance(results, list):
            break
        for result in results:
            if isinstance(result, dict):
                rows.append(result)
                if max_results and len(rows) >= max_results:
                    LOG.info("CourtListener cap reached (%s; query=%r)", max_results, query)
                    return rows
        url = data.get("next")
        params = None
        if page % 20 == 0:
            LOG.info("CourtListener %s %r: %d records", courts, query, len(rows))
        time.sleep(0.10 + random.random() * 0.08)
    LOG.info("CourtListener %s %r complete: %d records", courts, query, len(rows))
    return rows


def simplify_cl_result(result: dict[str, Any]) -> dict[str, Any]:
    citations = result.get("citation") or result.get("citations") or []
    if isinstance(citations, str):
        citations = [citations]
    opinions = result.get("opinions") or []
    if not isinstance(opinions, list):
        opinions = []
    absolute = clean_text(result.get("absolute_url"))
    return {
        "courtlistener_cluster_id": result.get("cluster_id") or result.get("id") or "",
        "case_name": first_nonempty(result.get("caseName"), result.get("case_name"), result.get("caseNameFull")),
        "case_name_full": first_nonempty(result.get("caseNameFull"), result.get("caseName"), result.get("case_name")),
        "docket_numbers_raw": first_nonempty(result.get("docketNumber"), result.get("docket_number")),
        "docket_numbers": " | ".join(split_dockets(first_nonempty(result.get("docketNumber"), result.get("docket_number")))),
        "decision_date": parse_date(first_nonempty(result.get("dateFiled"), result.get("date_filed"))),
        "court_id": clean_text(result.get("court_id")),
        "court_name": clean_text(result.get("court")),
        "reported_citations": " | ".join(clean_text(c) for c in citations if clean_text(c)),
        "precedential_status": first_nonempty(result.get("status"), result.get("precedential_status")),
        "courtlistener_url": urljoin("https://www.courtlistener.com", absolute) if absolute else "",
        "courtlistener_pdf_url": courtlistener_file_url(opinions),
        "courtlistener_snippet": clean_text(result.get("snippet")),
        "judges_raw": first_nonempty(result.get("judge"), result.get("judges")),
        "attorneys_raw": first_nonempty(result.get("attorney"), result.get("attorneys")),
        "procedural_history": clean_text(result.get("proceduralHistory")),
        "nature_of_suit": clean_text(result.get("suitNature")),
        "courtlistener_raw_source": COURTLISTENER_SEARCH,
    }


def scrape_justia_year_links() -> tuple[list[dict[str, Any]], dict[int, int]]:
    links: list[dict[str, Any]] = []
    counts: dict[int, int] = {}
    landing_html = get_html(JUSTIA_TAX_ROOT, context="Justia tax landing")
    if landing_html:
        soup = BeautifulSoup(landing_html, "lxml")
        for anchor in soup.select("a[href]"):
            href = anchor.get("href") or ""
            match = re.fullmatch(r"/cases/new-jersey/tax-court/(\d{4})/?", href)
            text = clean_text(anchor.get_text(" ", strip=True))
            if match:
                year = int(match.group(1))
                count_match = re.search(r"\((\d+)\)", anchor.parent.get_text(" ", strip=True) if anchor.parent else text)
                if count_match:
                    counts[year] = int(count_match.group(1))
    years = sorted(set(range(FIRST_YEAR, CURRENT_YEAR + 1)) | set(counts))
    for year in years:
        year_url = f"{JUSTIA_TAX_ROOT}{year}/"
        page_html = get_html(year_url, context=f"Justia tax year {year}")
        if not page_html:
            continue
        soup = BeautifulSoup(page_html, "lxml")
        seen: set[str] = set()
        for anchor in soup.select("a[href]"):
            href = anchor.get("href") or ""
            if not re.match(rf"^/cases/new-jersey/tax-court/{year}/[^/]+\.html$", href):
                continue
            url = urljoin(JUSTIA_ROOT, href)
            if url in seen:
                continue
            seen.add(url)
            links.append(
                {
                    "year": year,
                    "justia_url": url,
                    "year_page_url": year_url,
                    "year_page_case_name": clean_text(anchor.get_text(" ", strip=True)),
                }
            )
        LOG.info("Justia %d: %d links (advertised %s)", year, len(seen), counts.get(year, "n/a"))
        time.sleep(0.05 + random.random() * 0.05)
    return links, counts


def regex_unique(pattern: str, text: str, flags: int = 0, limit: int = 30) -> list[str]:
    output: list[str] = []
    for match in re.findall(pattern, text, flags):
        if isinstance(match, tuple):
            match = next((part for part in match if part), "")
        value = clean_text(match).strip(" ,.;:()[]")
        if value and value not in output:
            output.append(value)
        if len(output) >= limit:
            break
    return output


def extract_legal_citations(text: str) -> dict[str, str]:
    statutes = regex_unique(
        r"\bN\.J\.S\.A\.\s*[0-9A-Za-z:.\-]+(?:\s+to\s+[0-9A-Za-z:.\-]+)?",
        text,
        flags=re.I,
        limit=40,
    )
    regulations = regex_unique(
        r"\bN\.J\.A\.C\.\s*[0-9A-Za-z:.\-]+",
        text,
        flags=re.I,
        limit=30,
    )
    nj_tax = regex_unique(r"\b\d{1,3}\s+N\.J\.\s+Tax\s+\d{1,4}\b", text, flags=re.I, limit=30)
    nj_reports = regex_unique(
        r"\b\d{1,3}\s+N\.J\.(?:\s+Super\.)?\s+\d{1,4}\b",
        text,
        flags=re.I,
        limit=30,
    )
    atlantic = regex_unique(r"\b\d{1,4}\s+A\.(?:2d|3d)\s+\d{1,4}\b", text, flags=re.I, limit=20)
    return {
        "statutes_cited": " | ".join(statutes),
        "regulations_cited": " | ".join(regulations),
        "nj_tax_citations_in_text": " | ".join(nj_tax),
        "nj_reporter_citations_in_text": " | ".join(nj_reports),
        "atlantic_citations_in_text": " | ".join(atlantic),
    }


def classify_tax_type(text: str, case_name: str) -> tuple[str, str]:
    hay = f"{case_name} {text}".lower()
    categories: list[tuple[str, list[str]]] = [
        ("Local Property Tax – Valuation/Assessment", ["true value", "valuation", "assessment", "chapter 123", "equalization ratio", "comparable sales", "income capitalization"]),
        ("Local Property Tax – Exemption", ["tax exemption", "exempt from taxation", "religious exemption", "charitable exemption", "nonprofit", "n.j.s.a. 54:4-3.6"]),
        ("Local Property Tax – Farmland", ["farmland assessment", "farmland preservation", "agricultural use", "horticultural use", "n.j.s.a. 54:4-23"]),
        ("Local Property Tax – Chapter 91", ["chapter 91", "n.j.s.a. 54:4-34", "income and expense request"]),
        ("Local Property Tax – Freeze Act", ["freeze act", "n.j.s.a. 54:51a-8"]),
        ("Local Property Tax – Added/Omitted Assessment", ["added assessment", "omitted assessment", "n.j.s.a. 54:4-63"]),
        ("Corporate Business Tax", ["corporation business tax", "corporate business tax", "cbt", "n.j.s.a. 54:10a"]),
        ("Gross Income Tax", ["gross income tax", "earned income tax credit", "eitc", "n.j.s.a. 54a"]),
        ("Sales and Use Tax", ["sales and use tax", "sales tax", "use tax", "n.j.s.a. 54:32b"]),
        ("Transfer Inheritance / Estate Tax", ["transfer inheritance tax", "inheritance tax", "estate tax", "n.j.s.a. 54:34", "n.j.s.a. 54:38"]),
        ("Realty Transfer Fee / Mansion Tax", ["realty transfer fee", "mansion tax", "n.j.s.a. 46:15"]),
        ("Motor Fuels / Petroleum Tax", ["motor fuels tax", "petroleum products gross receipts tax", "ppgrt"]),
        ("Tobacco / Cigarette Tax", ["cigarette tax", "tobacco products tax"]),
        ("Casino / Gaming Tax", ["casino revenue tax", "casino control"]),
        ("Unclaimed Property", ["unclaimed property", "uniform unclaimed property"]),
    ]
    matched: list[str] = []
    for category, keywords in categories:
        if any(keyword in hay for keyword in keywords):
            matched.append(category)
    if not matched:
        if re.search(r"\b(township|borough|city|municipality|county)\b", case_name, flags=re.I):
            matched.append("Local Property Tax – Other")
        elif "director" in case_name.lower() and "taxation" in case_name.lower():
            matched.append("State Tax – Other")
        else:
            matched.append("Tax – Other/Unclassified")
    primary = matched[0]
    return primary, " | ".join(matched)


def detect_publication_status(text: str, citations: str = "") -> str:
    upper = text[:25000].upper()
    if "NOT FOR PUBLICATION WITHOUT APPROVAL" in upper or "NOT FOR PUBLICATION" in upper:
        return "Unpublished / Not for publication"
    if "APPROVED FOR PUBLICATION" in upper or "FOR PUBLICATION" in upper:
        return "Published"
    if re.search(r"\b\d{1,3}\s+N\.J\.\s+TAX\s+\d{1,4}\b", f"{citations} {upper}"):
        return "Published / Reported"
    return "Unknown"


def extract_judges(text: str) -> str:
    head = text[:20000]
    candidates: list[str] = []
    patterns = [
        r"Opinion\s+by\s+([A-Z][A-Za-z.'\- ]{2,60}),\s*(?:P\.J\.T\.C\.|J\.T\.C\.)",
        r"([A-Z][A-Za-z.'\- ]{2,60}),\s*(?:P\.J\.T\.C\.|J\.T\.C\.)",
        r"/s/\s*([A-Z][A-Za-z.'\- ]{2,60})",
        r"TAX COURT OF NEW JERSEY\s+([A-Z][A-Z.'\- ]{2,60})\s+(?:PRESIDING )?JUDGE",
    ]
    for pattern in patterns:
        for value in re.findall(pattern, head, flags=re.I):
            value = clean_text(value).title()
            value = re.sub(r"\b(Presiding|Judge|Honorable|Hon\.)\b", "", value, flags=re.I).strip(" ,")
            if 2 <= len(value.split()) <= 6 and not any(noise in value.lower() for noise in ("tax court", "new jersey", "plaintiff", "defendant")):
                if value not in candidates:
                    candidates.append(value)
    return " | ".join(candidates[:8])


def extract_attorney_snippet(text: str) -> str:
    head = text[:18000]
    snippets = regex_unique(
        r"(?:For|Attorney(?:s)?\s+for)\s+(?:the\s+)?(?:plaintiff|defendant|taxpayer|municipality|respondent|appellant|appellee)[^\n]{0,250}",
        head,
        flags=re.I,
        limit=10,
    )
    return " | ".join(snippets)


def extract_disposition(text: str) -> str:
    plain = clean_text(text)
    if not plain:
        return ""
    tail = plain[-12000:]
    # Prefer a conclusion/held segment.
    match = re.search(r"(?:CONCLUSION|HELD:|Held:)\s*(.{40,1200})", tail, flags=re.I)
    if match:
        snippet = match.group(1)
        snippet = re.split(r"(?:Very truly yours|Some case metadata|Free Daily)", snippet, maxsplit=1, flags=re.I)[0]
        return clean_text(snippet)[:1200]
    sentences = re.split(r"(?<=[.!?])\s+", tail)
    selected = [
        sentence
        for sentence in sentences
        if re.search(r"\b(affirm|reverse|remand|grant|deny|dismiss|vacat|judgment|motion)\w*\b", sentence, flags=re.I)
    ]
    return clean_text(" ".join(selected[-3:]))[:1200]


def parse_justia_case(link: dict[str, Any]) -> dict[str, Any]:
    url = link["justia_url"]
    page_html = get_html(url, context=f"Justia case {url}")
    if not page_html:
        return {**link, "fetch_ok": False}
    soup = BeautifulSoup(page_html, "lxml")
    h1 = soup.find("h1")
    title = clean_text(h1.get_text(" ", strip=True) if h1 else link.get("year_page_case_name"))
    page_text = soup.get_text("\n", strip=True)

    full_name_match = re.search(r"Full Name:\s*(.+?)(?:\n|Docket Number)", page_text, flags=re.I)
    docket_match = re.search(r"Docket Number(?:s)?:\s*(.+?)(?:\n|Date:)", page_text, flags=re.I)
    date_match = re.search(r"Date:\s*([^\n]+)", page_text, flags=re.I)
    full_name = clean_text(full_name_match.group(1)) if full_name_match else title
    dockets_raw = clean_text(docket_match.group(1)) if docket_match else ""
    decision_date = parse_date(date_match.group(1)) if date_match else ""

    pdf_url = ""
    for anchor in soup.select("a[href]"):
        label = clean_text(anchor.get_text(" ", strip=True)).lower()
        href = anchor.get("href") or ""
        if "download pdf" in label or href.lower().endswith(".pdf"):
            pdf_url = urljoin(url, href)
            break

    # Trim navigational text when possible.
    opinion_text = page_text
    marker = re.search(r"Download PDF\s*(.+)", page_text, flags=re.S | re.I)
    if marker:
        opinion_text = marker.group(1)
    opinion_text = re.split(r"Some case metadata and case summaries", opinion_text, maxsplit=1, flags=re.I)[0]
    opinion_text = clean_text(opinion_text)

    citations = extract_legal_citations(opinion_text)
    reported = citations["nj_tax_citations_in_text"]
    publication_status = detect_publication_status(opinion_text, reported)
    tax_type, tax_topics = classify_tax_type(opinion_text[:50000], full_name)

    return {
        **link,
        "fetch_ok": True,
        "case_name": title,
        "case_name_full": full_name,
        "docket_numbers_raw": dockets_raw,
        "docket_numbers": " | ".join(split_dockets(dockets_raw)),
        "decision_date": decision_date,
        "justia_pdf_url": pdf_url,
        "justia_publication_status": publication_status,
        "judges_extracted": extract_judges(opinion_text),
        "attorney_snippet": extract_attorney_snippet(opinion_text),
        "reported_citations_extracted": reported,
        "tax_type_primary": tax_type,
        "tax_topics": tax_topics,
        "disposition_snippet": extract_disposition(opinion_text),
        "opinion_text_lead": opinion_text[:2500],
        "opinion_text_tail": opinion_text[-1800:],
        **citations,
    }


def scrape_justia_cases(links: list[dict[str, Any]]) -> list[dict[str, Any]]:
    workers = max(1, int(os.getenv("NJ_TAX_WORKERS", "6")))
    output: list[dict[str, Any]] = []
    LOG.info("Fetching %d Justia case pages with %d workers", len(links), workers)
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(parse_justia_case, link): link for link in links}
        for index, future in enumerate(as_completed(futures), start=1):
            link = futures[future]
            try:
                output.append(future.result())
            except Exception as exc:  # noqa: BLE001
                FAILURES.append(FetchFailure("justia-case", link["justia_url"], repr(exc), "worker"))
                output.append({**link, "fetch_ok": False})
            if index % 100 == 0:
                LOG.info("Justia case pages: %d/%d", index, len(links))
    output.sort(key=lambda row: (row.get("decision_date", ""), row.get("justia_url", "")))
    return output


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()


def row_docket_keys(row: dict[str, Any]) -> set[str]:
    values = split_dockets(first_nonempty(row.get("docket_numbers"), row.get("docket_numbers_raw")))
    return {normalize_docket(value) for value in values if normalize_docket(value)}


def match_and_merge(cl_rows: list[dict[str, Any]], justia_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_docket: dict[str, list[int]] = defaultdict(list)
    for idx, row in enumerate(justia_rows):
        for docket in row_docket_keys(row):
            by_docket[docket].append(idx)
    unused = set(range(len(justia_rows)))
    merged: list[dict[str, Any]] = []

    for cl in cl_rows:
        candidate_ids: set[int] = set()
        for docket in row_docket_keys(cl):
            candidate_ids.update(by_docket.get(docket, []))
        best_idx: int | None = None
        best_score = -1.0
        for idx in candidate_ids:
            justia = justia_rows[idx]
            score = similarity(cl.get("case_name", ""), justia.get("case_name", ""))
            if cl.get("decision_date") and justia.get("decision_date"):
                score += 0.35 if cl["decision_date"] == justia["decision_date"] else 0.0
            if idx in unused:
                score += 0.05
            if score > best_score:
                best_score = score
                best_idx = idx
        if best_idx is not None and best_score >= 0.40:
            justia = justia_rows[best_idx]
            unused.discard(best_idx)
            row = merge_one(cl, justia, "CourtListener + Justia")
            row["match_score"] = round(best_score, 4)
        else:
            row = merge_one(cl, {}, "CourtListener only")
            row["match_score"] = ""
        merged.append(row)

    for idx in sorted(unused):
        merged.append(merge_one({}, justia_rows[idx], "Justia only"))

    # Deduplicate exact source pairs/URLs while preserving multiple opinions on one docket.
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for row in sorted(merged, key=lambda r: (r.get("decision_date", ""), r.get("case_name", ""), r.get("justia_url", ""))):
        key = first_nonempty(
            str(row.get("courtlistener_cluster_id", "")),
            row.get("justia_url", ""),
            hashlib.sha1(
                f"{row.get('case_name')}|{row.get('decision_date')}|{row.get('docket_numbers')}".encode("utf-8")
            ).hexdigest(),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(row)

    # Opinion sequence within each docket family will be assigned after union-find.
    return deduped


def merge_one(cl: dict[str, Any], ju: dict[str, Any], coverage: str) -> dict[str, Any]:
    case_name = first_nonempty(ju.get("case_name"), cl.get("case_name"))
    case_name_full = first_nonempty(ju.get("case_name_full"), cl.get("case_name_full"), case_name)
    dockets_raw = first_nonempty(ju.get("docket_numbers_raw"), cl.get("docket_numbers_raw"))
    dockets = first_nonempty(ju.get("docket_numbers"), cl.get("docket_numbers"))
    decision_date = first_nonempty(ju.get("decision_date"), cl.get("decision_date"))
    reported = first_nonempty(cl.get("reported_citations"), ju.get("reported_citations_extracted"))
    status = first_nonempty(cl.get("precedential_status"), ju.get("justia_publication_status"))
    tax_type = first_nonempty(ju.get("tax_type_primary"), classify_tax_type("", case_name)[0])
    opinion_id_seed = first_nonempty(
        str(cl.get("courtlistener_cluster_id", "")),
        ju.get("justia_url", ""),
        f"{case_name}|{decision_date}|{dockets}",
    )
    opinion_id = "NJTC-OP-" + hashlib.sha1(opinion_id_seed.encode("utf-8")).hexdigest()[:12].upper()
    return {
        "opinion_id": opinion_id,
        "case_family_id": "",
        "opinion_sequence": "",
        "case_name": case_name,
        "case_name_full": case_name_full,
        "decision_date": decision_date,
        "decision_year": decision_date[:4] if re.match(r"^\d{4}", decision_date) else ju.get("year", ""),
        "docket_numbers": dockets,
        "docket_numbers_raw": dockets_raw,
        "primary_docket": split_dockets(dockets_raw)[0] if split_dockets(dockets_raw) else "",
        "court_level": "New Jersey Tax Court",
        "reported_citations": reported,
        "publication_status": status,
        "justia_publication_status": ju.get("justia_publication_status", ""),
        "judges": first_nonempty(ju.get("judges_extracted"), cl.get("judges_raw")),
        "attorneys": first_nonempty(ju.get("attorney_snippet"), cl.get("attorneys_raw")),
        "tax_type_primary": tax_type,
        "tax_topics": ju.get("tax_topics", ""),
        "procedural_history": cl.get("procedural_history", ""),
        "nature_of_suit": cl.get("nature_of_suit", ""),
        "disposition_snippet": ju.get("disposition_snippet", ""),
        "statutes_cited": ju.get("statutes_cited", ""),
        "regulations_cited": ju.get("regulations_cited", ""),
        "nj_tax_citations_in_text": ju.get("nj_tax_citations_in_text", ""),
        "nj_reporter_citations_in_text": ju.get("nj_reporter_citations_in_text", ""),
        "atlantic_citations_in_text": ju.get("atlantic_citations_in_text", ""),
        "courtlistener_cluster_id": cl.get("courtlistener_cluster_id", ""),
        "courtlistener_url": cl.get("courtlistener_url", ""),
        "courtlistener_pdf_url": cl.get("courtlistener_pdf_url", ""),
        "justia_url": ju.get("justia_url", ""),
        "justia_pdf_url": ju.get("justia_pdf_url", ""),
        "official_nj_courts_url": "",
        "year_page_url": ju.get("year_page_url", ""),
        "source_coverage": coverage,
        "match_score": "",
        "validation_tier": "Tier 2 – two public legal repositories" if coverage == "CourtListener + Justia" else "Tier 3 – one public legal repository",
        "opinion_text_lead": ju.get("opinion_text_lead", ""),
        "opinion_text_tail": ju.get("opinion_text_tail", ""),
    }


class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1


def assign_case_families(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    uf = UnionFind(len(rows))
    docket_owner: dict[str, int] = {}
    for idx, row in enumerate(rows):
        for docket in row_docket_keys(row):
            if docket in docket_owner:
                uf.union(idx, docket_owner[docket])
            else:
                docket_owner[docket] = idx
    groups: dict[int, list[int]] = defaultdict(list)
    for idx in range(len(rows)):
        groups[uf.find(idx)].append(idx)

    families: list[dict[str, Any]] = []
    for indices in groups.values():
        group_rows = sorted((rows[i] for i in indices), key=lambda row: (row.get("decision_date", ""), row.get("opinion_id", "")))
        all_dockets: list[str] = []
        all_names: list[str] = []
        all_citations: list[str] = []
        all_statuses: list[str] = []
        all_judges: list[str] = []
        source_urls: list[str] = []
        for seq, row in enumerate(group_rows, start=1):
            for docket in split_dockets(row.get("docket_numbers_raw", "")):
                if docket not in all_dockets:
                    all_dockets.append(docket)
            for value, target in (
                (row.get("case_name", ""), all_names),
                (row.get("reported_citations", ""), all_citations),
                (row.get("publication_status", ""), all_statuses),
                (row.get("judges", ""), all_judges),
            ):
                for item in str(value).split(" | "):
                    item = clean_text(item)
                    if item and item not in target:
                        target.append(item)
            for url_field in ("courtlistener_url", "justia_url", "courtlistener_pdf_url", "justia_pdf_url"):
                url = clean_text(row.get(url_field))
                if url and url not in source_urls:
                    source_urls.append(url)
            row["opinion_sequence"] = seq
        seed = normalize_docket(all_dockets[0]) if all_dockets else hashlib.sha1("|".join(all_names).encode()).hexdigest()[:12]
        family_id = f"NJTC-{seed}"
        for row in group_rows:
            row["case_family_id"] = family_id
        dates = [row.get("decision_date", "") for row in group_rows if row.get("decision_date")]
        families.append(
            {
                "case_family_id": family_id,
                "canonical_case_name": max(all_names, key=len) if all_names else "",
                "all_case_names": " | ".join(all_names),
                "all_docket_numbers": " | ".join(all_dockets),
                "first_decision_date": min(dates) if dates else "",
                "latest_decision_date": max(dates) if dates else "",
                "opinion_count": len(group_rows),
                "reported_citations": " | ".join(all_citations),
                "publication_statuses": " | ".join(all_statuses),
                "judges": " | ".join(all_judges),
                "tax_types": " | ".join(dict.fromkeys(row.get("tax_type_primary", "") for row in group_rows if row.get("tax_type_primary"))),
                "source_coverage": " | ".join(dict.fromkeys(row.get("source_coverage", "") for row in group_rows if row.get("source_coverage"))),
                "source_urls": " | ".join(source_urls),
            }
        )
    families.sort(key=lambda row: (row.get("first_decision_date", ""), row.get("canonical_case_name", "")))
    return families


def scrape_nj_official_current() -> list[dict[str, Any]]:
    """Scrape currently exposed official NJ Tax opinion cards.

    The NJ Courts pages are JavaScript-backed and historically bounded. These rows
    are therefore used as an authority/validation overlay, not as the primary corpus.
    """
    rows: list[dict[str, Any]] = []
    for status, url in (("Published", NJ_PUBLISHED_TAX), ("Unpublished", NJ_UNPUBLISHED_TAX)):
        page_html = get_html(url, context=f"NJ Courts {status}")
        if not page_html:
            continue
        soup = BeautifulSoup(page_html, "lxml")
        text = soup.get_text("\n", strip=True)
        # Capture docket/date/title from links to PDF/document assets. The exact
        # Drupal markup changes, so keep this permissive.
        for anchor in soup.select("a[href]"):
            href = anchor.get("href") or ""
            title = clean_text(anchor.get_text(" ", strip=True))
            parent_text = clean_text(anchor.parent.get_text(" ", strip=True) if anchor.parent else "")
            docket_matches = split_dockets(parent_text)
            date_match = re.search(r"(?:Jan\.?|Feb\.?|Mar\.?|Apr\.?|May|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Oct\.?|Nov\.?|Dec\.?)\s+\d{1,2},\s+\d{4}", parent_text, flags=re.I)
            if not docket_matches or not title or len(title) < 5:
                continue
            if not any(token in href.lower() for token in ("opinion", ".pdf", "/attorneys/opinions/")):
                continue
            rows.append(
                {
                    "case_name": title,
                    "docket_numbers": " | ".join(docket_matches),
                    "decision_date": parse_date(date_match.group(0)) if date_match else "",
                    "official_status": status,
                    "official_nj_courts_url": urljoin(url, href),
                }
            )
    # Deduplicate permissive parser output.
    unique: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in rows:
        key = (normalize_name(row["case_name"]), row["docket_numbers"], row["official_status"])
        unique[key] = row
    LOG.info("Official NJ overlay rows: %d", len(unique))
    return list(unique.values())


def apply_official_overlay(rows: list[dict[str, Any]], official: list[dict[str, Any]]) -> None:
    by_docket: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in official:
        for docket in row_docket_keys(record):
            by_docket[docket].append(record)
    for row in rows:
        candidates: list[dict[str, Any]] = []
        for docket in row_docket_keys(row):
            candidates.extend(by_docket.get(docket, []))
        if not candidates:
            continue
        best = max(candidates, key=lambda rec: similarity(row.get("case_name", ""), rec.get("case_name", "")))
        if similarity(row.get("case_name", ""), best.get("case_name", "")) >= 0.45:
            row["official_nj_courts_url"] = best.get("official_nj_courts_url", "")
            row["publication_status"] = best.get("official_status", row.get("publication_status", ""))
            row["validation_tier"] = "Tier 1 – official NJ Courts corroborated"


def fetch_appellate_supreme_candidates(tax_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    queries = ["\"Tax Court\"", "\"N.J. Tax\"", "\"J.T.C.\"", "\"P.J.T.C.\""]
    raw: dict[str, dict[str, Any]] = {}
    query_hits: dict[str, set[str]] = defaultdict(set)
    max_per_query = int(os.getenv("NJ_TAX_APPELLATE_QUERY_CAP", "5000"))
    for query in queries:
        results = fetch_courtlistener_results(
            courts="nj,njsuperctappdiv",
            query=query,
            max_results=max_per_query,
            order_by="dateFiled asc",
        )
        for result in results:
            key = str(result.get("cluster_id") or result.get("id") or result.get("absolute_url") or hashlib.sha1(json.dumps(result, sort_keys=True).encode()).hexdigest())
            raw[key] = result
            query_hits[key].add(query)

    citation_to_family: dict[str, set[str]] = defaultdict(set)
    docket_to_family: dict[str, set[str]] = defaultdict(set)
    name_to_family: list[tuple[str, str]] = []
    for row in tax_rows:
        family = row.get("case_family_id", "")
        for citation in str(row.get("reported_citations", "") + " | " + row.get("nj_tax_citations_in_text", "")).split(" | "):
            normalized = clean_text(citation).lower()
            if normalized:
                citation_to_family[normalized].add(family)
        for docket in row_docket_keys(row):
            docket_to_family[docket].add(family)
        if row.get("case_name"):
            name_to_family.append((normalize_name(row["case_name"]), family))

    output: list[dict[str, Any]] = []
    for key, result in raw.items():
        cl = simplify_cl_result(result)
        evidence = " ".join(
            clean_text(value)
            for value in (
                cl.get("courtlistener_snippet"),
                cl.get("procedural_history"),
                cl.get("nature_of_suit"),
                cl.get("case_name_full"),
            )
            if clean_text(value)
        )
        evidence_lower = evidence.lower()
        direct_patterns = [
            r"appeal(?:s|ed)?\s+from\s+(?:a\s+)?(?:final\s+)?(?:judgment|order|decision)\s+of\s+the\s+tax court",
            r"appeal(?:s|ed)?\s+from\s+the\s+tax court",
            r"tax court(?:'s)?\s+(?:judgment|order|decision)",
            r"judgment\s+of\s+the\s+tax court",
            r"we\s+(?:affirm|reverse|vacate|remand).{0,120}tax court",
            r"tax court\s+judge",
        ]
        if any(re.search(pattern, evidence_lower, flags=re.I) for pattern in direct_patterns):
            relationship = "Likely direct review of Tax Court"
            confidence = "High"
        elif "tax court" in evidence_lower:
            relationship = "Tax-related appellate opinion; direct-review status requires confirmation"
            confidence = "Medium"
        elif "n.j. tax" in evidence_lower or "j.t.c." in evidence_lower:
            relationship = "Cites Tax Court authority"
            confidence = "Low"
        else:
            relationship = "Query match; relationship unconfirmed"
            confidence = "Low"

        linked_families: set[str] = set()
        for citation in regex_unique(r"\b\d{1,3}\s+N\.J\.\s+Tax\s+\d{1,4}\b", evidence, flags=re.I, limit=50):
            linked_families.update(citation_to_family.get(citation.lower(), set()))
        for docket in row_docket_keys(cl):
            linked_families.update(docket_to_family.get(docket, set()))
        # Conservative fuzzy name link.
        norm_name = normalize_name(cl.get("case_name", ""))
        if norm_name:
            for tax_name, family in name_to_family:
                if len(tax_name) >= 12 and SequenceMatcher(None, norm_name, tax_name).ratio() >= 0.78:
                    linked_families.add(family)

        tax_type, topics = classify_tax_type(evidence, cl.get("case_name", ""))
        citations = extract_legal_citations(evidence)
        output.append(
            {
                "appellate_opinion_id": "NJ-APP-" + hashlib.sha1(key.encode("utf-8")).hexdigest()[:12].upper(),
                "court_level": "NJ Supreme Court" if cl.get("court_id") == "nj" else "NJ Superior Court, Appellate Division",
                "case_name": cl.get("case_name", ""),
                "case_name_full": cl.get("case_name_full", ""),
                "decision_date": cl.get("decision_date", ""),
                "docket_numbers": cl.get("docket_numbers", ""),
                "reported_citations": cl.get("reported_citations", ""),
                "precedential_status": cl.get("precedential_status", ""),
                "relationship_to_tax_court": relationship,
                "relationship_confidence": confidence,
                "linked_tax_case_family_ids": " | ".join(sorted(f for f in linked_families if f)),
                "tax_type_primary": tax_type,
                "tax_topics": topics,
                "judges": cl.get("judges_raw", ""),
                "attorneys": cl.get("attorneys_raw", ""),
                "procedural_history": cl.get("procedural_history", ""),
                "search_query_hits": " | ".join(sorted(query_hits[key])),
                "evidence_snippet": evidence[:2500],
                "courtlistener_cluster_id": cl.get("courtlistener_cluster_id", ""),
                "courtlistener_url": cl.get("courtlistener_url", ""),
                "courtlistener_pdf_url": cl.get("courtlistener_pdf_url", ""),
                **citations,
            }
        )
    output.sort(key=lambda row: (row.get("decision_date", ""), row.get("court_level", ""), row.get("case_name", "")))
    LOG.info("Appellate/Supreme candidates: %d", len(output))
    return output


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str] | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if fieldnames is None:
        ordered: list[str] = []
        seen: set[str] = set()
        for row in rows:
            for key in row:
                if key not in seen:
                    seen.add(key)
                    ordered.append(key)
        fieldnames = ordered
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def build_coverage(rows: list[dict[str, Any]], advertised: dict[int, int]) -> list[dict[str, Any]]:
    by_year: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        try:
            year = int(row.get("decision_year") or str(row.get("decision_date", ""))[:4])
        except (TypeError, ValueError):
            continue
        by_year[year].append(row)
    output: list[dict[str, Any]] = []
    for year in range(FIRST_YEAR, CURRENT_YEAR + 1):
        year_rows = by_year.get(year, [])
        source_counts = Counter(row.get("source_coverage", "") for row in year_rows)
        output.append(
            {
                "year": year,
                "opinion_documents": len(year_rows),
                "justia_advertised_count": advertised.get(year, 0),
                "courtlistener_and_justia": source_counts.get("CourtListener + Justia", 0),
                "courtlistener_only": source_counts.get("CourtListener only", 0),
                "justia_only": source_counts.get("Justia only", 0),
                "official_nj_corroborated": sum(1 for row in year_rows if row.get("official_nj_courts_url")),
                "published_or_reported": sum(1 for row in year_rows if "publish" in str(row.get("publication_status", "")).lower() and "unpublish" not in str(row.get("publication_status", "")).lower()),
                "unpublished": sum(1 for row in year_rows if "unpublish" in str(row.get("publication_status", "")).lower()),
            }
        )
    return output


def write_readme(metadata: dict[str, Any]) -> None:
    text = f"""# New Jersey Tax Court Opinion Index\n\nGenerated: {metadata['generated_at']}\n\n## Scope\n\n- Tax Court opinion documents: **{metadata['tax_opinion_documents']:,}**\n- Deduplicated docket-linked case families: **{metadata['tax_case_families']:,}**\n- Appellate Division / NJ Supreme Court candidates: **{metadata['appellate_supreme_candidates']:,}**\n- Date span: **{metadata.get('date_span', '')}**\n\n## Files\n\n- `nj_tax_opinion_documents.csv`: one row per opinion document, preserving multiple opinions under the same docket.\n- `nj_tax_case_families.csv`: docket-overlap families for case-level navigation.\n- `nj_tax_appellate_supreme_candidates.csv`: appellate and Supreme Court opinions found through Tax Court-related CourtListener queries, with relationship-confidence labels and attempted links to Tax Court families.\n- `coverage_by_year.csv`: source and publication-status counts by year.\n- `source_failures.csv`: fetch failures requiring follow-up.\n- `metadata.json`: generation and source notes.\n\n## Validation tiers\n\n- **Tier 1:** corroborated by an official NJ Courts opinion listing.\n- **Tier 2:** matched between CourtListener and Justia.\n- **Tier 3:** found in one public legal repository and requires independent confirmation before citation.\n\n## Important legal-research caveat\n\nThis is a discovery/index resource, not a citator. Before relying on an opinion, verify the official text, publication status, subsequent history, and current validity through authoritative sources and a current citator. Justia expressly warns that its hosted opinions may not be official published versions.\n"""
    (OUT_DIR / "README.md").write_text(text, encoding="utf-8")


def main() -> int:
    started = datetime.utcnow()
    LOG.info("Starting NJ Tax Court opinion index build")

    cl_raw = fetch_courtlistener_results(courts="njtaxct", query=None, max_results=None)
    cl_tax = [simplify_cl_result(result) for result in cl_raw]
    LOG.info("CourtListener Tax Court rows: %d", len(cl_tax))

    justia_links, advertised = scrape_justia_year_links()
    LOG.info("Justia Tax Court links: %d", len(justia_links))
    justia_tax = scrape_justia_cases(justia_links)

    opinions = match_and_merge(cl_tax, justia_tax)
    families = assign_case_families(opinions)

    official = scrape_nj_official_current()
    apply_official_overlay(opinions, official)

    appellate = fetch_appellate_supreme_candidates(opinions)
    coverage = build_coverage(opinions, advertised)

    opinion_fields = [
        "opinion_id", "case_family_id", "opinion_sequence", "case_name", "case_name_full",
        "decision_date", "decision_year", "docket_numbers", "docket_numbers_raw", "primary_docket",
        "court_level", "reported_citations", "publication_status", "justia_publication_status",
        "judges", "attorneys", "tax_type_primary", "tax_topics", "procedural_history", "nature_of_suit",
        "disposition_snippet", "statutes_cited", "regulations_cited", "nj_tax_citations_in_text",
        "nj_reporter_citations_in_text", "atlantic_citations_in_text", "courtlistener_cluster_id",
        "courtlistener_url", "courtlistener_pdf_url", "justia_url", "justia_pdf_url",
        "official_nj_courts_url", "year_page_url", "source_coverage", "match_score", "validation_tier",
        "opinion_text_lead", "opinion_text_tail",
    ]
    write_csv(OUT_DIR / "nj_tax_opinion_documents.csv", opinions, opinion_fields)
    write_csv(OUT_DIR / "nj_tax_case_families.csv", families)
    write_csv(OUT_DIR / "nj_tax_appellate_supreme_candidates.csv", appellate)
    write_csv(OUT_DIR / "coverage_by_year.csv", coverage)
    write_csv(
        OUT_DIR / "source_failures.csv",
        [failure.__dict__ for failure in FAILURES],
        ["source", "url", "error", "context"],
    )

    dates = sorted(row.get("decision_date", "") for row in opinions if re.match(r"^\d{4}-\d{2}-\d{2}$", str(row.get("decision_date", ""))))
    metadata = {
        "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "run_seconds": round((datetime.utcnow() - started).total_seconds(), 2),
        "tax_opinion_documents": len(opinions),
        "tax_case_families": len(families),
        "courtlistener_tax_rows": len(cl_tax),
        "justia_case_links": len(justia_links),
        "justia_successful_case_pages": sum(1 for row in justia_tax if row.get("fetch_ok")),
        "appellate_supreme_candidates": len(appellate),
        "source_failures": len(FAILURES),
        "date_span": f"{dates[0]} through {dates[-1]}" if dates else "",
        "sources": {
            "CourtListener search API": COURTLISTENER_SEARCH,
            "Justia NJ Tax Court archive": JUSTIA_TAX_ROOT,
            "NJ Courts published Tax opinions": NJ_PUBLISHED_TAX,
            "NJ Courts unpublished Tax opinions": NJ_UNPUBLISHED_TAX,
        },
        "notes": [
            "Opinion-document count is not the same as unique case count; multiple opinions may share a docket.",
            "Appellate/Supreme relationship classifications are automated candidates and must be attorney-verified.",
            "This index is not a citator and does not determine whether an opinion remains good law.",
        ],
    }
    (OUT_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    write_readme(metadata)

    LOG.info("Complete: %s", json.dumps(metadata, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
