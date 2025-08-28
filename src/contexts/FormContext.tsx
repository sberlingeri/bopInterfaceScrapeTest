import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FormData, FormStep } from '../types';

interface FormContextType {
  formData: FormData;
  currentStep: FormStep;
  updateFormData: (section: keyof FormData, data: any) => void;
  setCurrentStep: (step: FormStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProgress: () => boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const initialFormData: FormData = {
  ratingInfo: {
    email: '',
    effectiveDate: null,
  },
  insuredInfo: {
    entityType: '',
    companyName: '',
    mailingAddress: '',
    streetNumber: '',
    streetName: '',
    city: '',
    state: '',
    zipCode: '',
    manualAddressEntry: false,
  },
  policyInfo: {
    dateBusinessStarted: null,
    businessDescription: '',
    ordinaryPayrollDays: '',
    employeeDishonestlyLimit: '',
    computerFraudLimit: '',
    medicalExpensesLimit: '$10,000',
    yearsOfLossHistory: 'No history',
    historyIncurredLosses: 0,
    liabilityLimitPerOccurrence: '',
    productsOperationsLimit: '',
    generalAggregateLimit: '$2,000,000',
    acceptTerrorismCoverage: false,
    coverageSelections: [],
    hiredAutoEnabled: false,
  },
  locations: [
    {
      id: 'loc-1',
      streetNumber: '',
      streetName: '',
      city: '',
      state: '',
      zipCode: '',
      useInsuredLocation: false,
      manualAddressEntry: false,
      equipmentBreakdown: '',
      propertyDeductible: '',
      coverageSelections: [],
      buildings: [
        {
          id: 'bldg-1-1',
          constructionType: '',
          yearOfConstruction: '',
          automaticSprinklerSystem: '',
          businessPersonalPropertyLimit: 0,
          buildingLimit: 0,
          percentageOwnerOccupied: '',
          classificationDescription: '',
          ratingGroupClass: '',
          classificationSquareFootage: 0,
          coverageSelections: [],
        },
      ],
    },
  ],
};

const FormContext = createContext<FormContextType | undefined>(undefined);

const STEPS: FormStep[] = ['rating', 'policy', 'location', 'summary'];

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<FormStep>('rating');

  // Auto-save to localStorage every time formData changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const updateFormData = useCallback((section: keyof FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: Array.isArray(data) ? data : {
        ...prev[section],
        ...data,
      },
    }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const canProgress = useCallback(() => {
    switch (currentStep) {
      case 'rating':
        return !!(
          formData.ratingInfo.email &&
          formData.ratingInfo.effectiveDate &&
          formData.insuredInfo.entityType &&
          formData.insuredInfo.companyName &&
          formData.insuredInfo.state
        );
      case 'policy':
        return !!(
          formData.policyInfo.dateBusinessStarted &&
          formData.policyInfo.businessDescription &&
          formData.policyInfo.ordinaryPayrollDays &&
          formData.policyInfo.liabilityLimitPerOccurrence
        );
      case 'location':
        return formData.locations.length > 0 && 
          formData.locations.every(loc => 
            loc.state && loc.city && loc.buildings.length > 0
          );
      default:
        return true;
    }
  }, [currentStep, formData]);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('bop-form-data', JSON.stringify(formData));
      localStorage.setItem('bop-form-step', currentStep);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [formData, currentStep]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('bop-form-data');
      const savedStep = localStorage.getItem('bop-form-step');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        if (parsedData.ratingInfo?.effectiveDate) {
          parsedData.ratingInfo.effectiveDate = new Date(parsedData.ratingInfo.effectiveDate);
        }
        if (parsedData.policyInfo?.dateBusinessStarted) {
          parsedData.policyInfo.dateBusinessStarted = new Date(parsedData.policyInfo.dateBusinessStarted);
        }
        setFormData(parsedData);
      }
      
      if (savedStep) {
        setCurrentStep(savedStep as FormStep);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  const value = {
    formData,
    currentStep,
    updateFormData,
    setCurrentStep,
    nextStep,
    previousStep,
    canProgress,
    saveToLocalStorage,
    loadFromLocalStorage,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};