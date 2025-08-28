export interface RatingInfo {
  email: string;
  effectiveDate: Date | null;
}

export interface InsuredInfo {
  entityType: string;
  companyName: string;
  mailingAddress: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  manualAddressEntry: boolean;
  googlePlaceId?: string;
}

export interface PolicyInfo {
  dateBusinessStarted: Date | null;
  businessDescription: string;
  ordinaryPayrollDays: string;
  employeeDishonestlyLimit: string;
  computerFraudLimit: string;
  medicalExpensesLimit: string;
  yearsOfLossHistory: string;
  historyIncurredLosses: number;
  liabilityLimitPerOccurrence: string;
  productsOperationsLimit: string;
  generalAggregateLimit: string;
  acceptTerrorismCoverage: boolean;
  coverageSelections: string[];
  hiredAutoEnabled: boolean;
  numberOfEmployees?: number;
  hiredAutoLiability?: string;
  nonOwnedAutoWithDelivery?: string;
  nonOwnedAutoWithoutDelivery?: string;
}

export interface Building {
  id: string;
  constructionType: string;
  yearOfConstruction: string;
  automaticSprinklerSystem: string;
  businessPersonalPropertyLimit: number;
  buildingLimit: number;
  percentageOwnerOccupied: string;
  classificationDescription: string;
  ratingGroupClass: string;
  classificationSquareFootage: number;
  coverageSelections: string[];
}

export interface Location {
  id: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  useInsuredLocation: boolean;
  manualAddressEntry: boolean;
  equipmentBreakdown: string;
  propertyDeductible: string;
  coverageSelections: string[];
  buildings: Building[];
}

export interface FormData {
  ratingInfo: RatingInfo;
  insuredInfo: InsuredInfo;
  policyInfo: PolicyInfo;
  locations: Location[];
}

export type FormStep = 'rating' | 'policy' | 'location' | 'summary';

export const ENTITY_TYPES = [
  'Corporation',
  'Individual',
  'Joint Venture',
  'Limited Partnership',
  'LLC',
  'Partnership',
  'Trust',
  'Other'
];

export const PAYROLL_DAYS = ['30', '60', '90', '120', '150', '180', '270', '365'];

export const DISHONESTY_LIMITS = [
  '$5,000',
  '$10,000',
  '$15,000',
  '$25,000',
  '$50,000',
  '$100,000'
];

export const FRAUD_LIMITS = [
  '$25,000',
  '$50,000',
  '$100,000',
  '$250,000'
];

export const LIABILITY_LIMITS = [
  '$300,000',
  '$500,000',
  '$1,000,000',
  '$2,000,000'
];

export const AGGREGATE_LIMITS = [
  '$2,000,000',
  '$3,000,000'
];

export const PROPERTY_DEDUCTIBLES = [
  '$250',
  '$500',
  '$1,000',
  '$2,500',
  '$5,000',
  '$7,500',
  '$10,000'
];

export const CONSTRUCTION_TYPES = [
  'Frame Construction',
  'Joisted Masonry',
  'Non-combustible',
  'Masonry Non-combustible',
  'Modified Fire-resistive',
  'Fire-resistive'
];

export const COVERAGE_OPTIONS = [
  'Business Owners Extension',
  'BOP Multicover',
  'Real Estate Extension'
];