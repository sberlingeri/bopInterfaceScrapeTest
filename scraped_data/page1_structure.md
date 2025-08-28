# Page 1: Initial Form - BopAutomatedPublic

## URL
https://axon-portal-bopautomated-public-dev.devweb1.think1st.dev/

## Page Structure

### Header
- Logo image
- Step indicator showing "1"
- Title: "TITLE GOES HERE"
- Description: Lorem ipsum placeholder text

### Form Sections

#### 1. Rating Information
- **Email Field**
  - Type: Text input
  - Required field
  
- **Effective Date**
  - Type: Date picker with calendar
  - Placeholder: MM/DD/YYYY
  - Has calendar button

#### 2. Insured Information
- **Entity Type**
  - Type: Dropdown/Select
  - Default: "Select..."
  
- **Company Name**
  - Type: Text input
  
- **Mailing Address**
  - Type: Google Maps autocomplete search
  - Placeholder: "Search For a Place"
  - Has clear button
  - Auto-fills the following fields:
    - Street Number
    - Street Name
    - City
    - State (Dropdown)
    - Zip Code
  
- **Manual Entry Option**
  - Checkbox: "Can't find address? Enter manually."
  - When checked, allows manual entry of address fields

### Navigation
- **Next Button**: Proceeds to next page

### Visual Elements
- Clean form layout with sections
- Input fields with labels
- Responsive design
- Network Error indicator present (development environment)