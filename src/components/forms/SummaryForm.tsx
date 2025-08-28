import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Edit,
  CheckCircle,
  Email,
  CalendarToday,
  Business,
  LocationOn,
  Policy,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useFormContext } from '../../contexts/FormContext';

interface SummaryItemProps {
  label: string;
  value: string | number | boolean | null;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString();
  
  return (
    <ListItem sx={{ py: 0.5 }}>
      <ListItemText
        primary={label}
        secondary={displayValue}
        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        secondaryTypographyProps={{ variant: 'body1' }}
      />
    </ListItem>
  );
};

export const SummaryForm: React.FC = () => {
  const { formData, setCurrentStep } = useFormContext();

  const handleEdit = (step: 'rating' | 'policy' | 'location') => {
    setCurrentStep(step);
  };

  const handleSubmit = () => {
    // In a real application, this would submit to an API
    console.log('Submitting form data:', formData);
    alert('Form submitted successfully! (Check console for data)');
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CheckCircle color="success" sx={{ fontSize: 60 }} />
        </Box>
        <Typography variant="h5" align="center" gutterBottom>
          Review Your Information
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Please review all the information below before submitting your application.
        </Typography>
      </Paper>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Email sx={{ mr: 2 }} />
          <Typography variant="h6">Rating Information</Typography>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleEdit('rating')}
            sx={{ ml: 'auto' }}
          >
            Edit
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <SummaryItem label="Email" value={formData.ratingInfo.email} />
                <SummaryItem 
                  label="Effective Date" 
                  value={formData.ratingInfo.effectiveDate ? format(formData.ratingInfo.effectiveDate, 'MM/dd/yyyy') : ''} 
                />
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <SummaryItem label="Entity Type" value={formData.insuredInfo.entityType} />
                <SummaryItem label="Company Name" value={formData.insuredInfo.companyName} />
                <SummaryItem 
                  label="Address" 
                  value={`${formData.insuredInfo.streetNumber} ${formData.insuredInfo.streetName}, ${formData.insuredInfo.city}, ${formData.insuredInfo.state} ${formData.insuredInfo.zipCode}`} 
                />
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Policy sx={{ mr: 2 }} />
          <Typography variant="h6">Policy Information</Typography>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => handleEdit('policy')}
            sx={{ ml: 'auto' }}
          >
            Edit
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <SummaryItem 
                  label="Date Business Started" 
                  value={formData.policyInfo.dateBusinessStarted ? format(formData.policyInfo.dateBusinessStarted, 'MM/dd/yyyy') : ''} 
                />
                <SummaryItem label="Business Description" value={formData.policyInfo.businessDescription} />
                <SummaryItem label="Ordinary Payroll Days" value={formData.policyInfo.ordinaryPayrollDays} />
                <SummaryItem label="Employee Dishonesty Limit" value={formData.policyInfo.employeeDishonestlyLimit} />
                <SummaryItem label="Computer Fraud Limit" value={formData.policyInfo.computerFraudLimit} />
                <SummaryItem label="Medical Expenses Limit" value={formData.policyInfo.medicalExpensesLimit} />
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <List dense>
                <SummaryItem label="Years of Loss History" value={formData.policyInfo.yearsOfLossHistory} />
                <SummaryItem label="History Incurred Losses" value={`$${formData.policyInfo.historyIncurredLosses}`} />
                <SummaryItem label="Liability Limit Per Occurrence" value={formData.policyInfo.liabilityLimitPerOccurrence} />
                <SummaryItem label="Products/Operations Limit" value={formData.policyInfo.productsOperationsLimit} />
                <SummaryItem label="General Aggregate Limit" value={formData.policyInfo.generalAggregateLimit} />
                <SummaryItem label="Accept Terrorism Coverage" value={formData.policyInfo.acceptTerrorismCoverage} />
              </List>
            </Grid>
            {formData.policyInfo.coverageSelections.length > 0 && (
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Coverage Selections
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {formData.policyInfo.coverageSelections.map((coverage) => (
                    <Chip key={coverage} label={coverage} size="small" color="primary" />
                  ))}
                </Stack>
              </Grid>
            )}
            {formData.policyInfo.hiredAutoEnabled && (
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Hired Auto Coverage
                </Typography>
                <List dense>
                  <SummaryItem label="Number of Employees" value={formData.policyInfo.numberOfEmployees || 0} />
                  <SummaryItem label="Hired Auto Liability" value={formData.policyInfo.hiredAutoLiability || 'No'} />
                  <SummaryItem label="Non-owned Auto (with Delivery)" value={formData.policyInfo.nonOwnedAutoWithDelivery || 'No'} />
                  <SummaryItem label="Non-owned Auto (without Delivery)" value={formData.policyInfo.nonOwnedAutoWithoutDelivery || 'No'} />
                </List>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {formData.locations.map((location, locationIndex) => (
        <Accordion key={location.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <LocationOn sx={{ mr: 2 }} />
            <Typography variant="h6">Location {locationIndex + 1}</Typography>
            <Button
              size="small"
              startIcon={<Edit />}
              onClick={() => handleEdit('location')}
              sx={{ ml: 'auto' }}
            >
              Edit
            </Button>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <SummaryItem 
                label="Address" 
                value={`${location.streetNumber} ${location.streetName}, ${location.city}, ${location.state} ${location.zipCode}`} 
              />
              <SummaryItem label="Equipment Breakdown" value={location.equipmentBreakdown} />
              <SummaryItem label="Property Deductible" value={location.propertyDeductible} />
            </List>
            
            {location.coverageSelections.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location Coverage
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {location.coverageSelections.map((coverage) => (
                    <Chip key={coverage} label={coverage} size="small" color="primary" />
                  ))}
                </Stack>
              </Box>
            )}
            
            {location.buildings.map((building, buildingIndex) => (
              <Box key={building.id} sx={{ mt: 2, ml: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Business sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
                  Building {buildingIndex + 1}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <List dense>
                      <SummaryItem label="Construction Type" value={building.constructionType} />
                      <SummaryItem label="Year of Construction" value={building.yearOfConstruction} />
                      <SummaryItem label="Automatic Sprinkler System" value={building.automaticSprinklerSystem} />
                      <SummaryItem label="Business Personal Property Limit" value={building.businessPersonalPropertyLimit > 0 ? `$${building.businessPersonalPropertyLimit.toLocaleString()}` : ''} />
                      <SummaryItem label="Building Limit" value={building.buildingLimit > 0 ? `$${building.buildingLimit.toLocaleString()}` : ''} />
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <List dense>
                      <SummaryItem label="Percentage Owner Occupied" value={building.percentageOwnerOccupied} />
                      <SummaryItem label="Classification Description" value={building.classificationDescription} />
                      <SummaryItem label="Rating Group Class" value={building.ratingGroupClass} />
                      <SummaryItem label="Classification Square Footage" value={building.classificationSquareFootage > 0 ? building.classificationSquareFootage.toLocaleString() : ''} />
                    </List>
                  </Grid>
                </Grid>
                {building.coverageSelections.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Building Coverage
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {building.coverageSelections.map((coverage) => (
                        <Chip key={coverage} label={coverage} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => setCurrentStep('rating')}
          >
            Start Over
          </Button>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleSubmit}
          >
            Submit Application
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};