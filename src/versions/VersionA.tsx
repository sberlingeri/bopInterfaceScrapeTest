import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save, RestartAlt } from '@mui/icons-material';
import { useFormContext } from '../contexts/FormContext';
import { FormStepper } from '../components/layout/FormStepper';
import { RatingInfoForm } from '../components/forms/RatingInfoForm';
import { PolicyInfoForm } from '../components/forms/PolicyInfoForm';
import { LocationForm } from '../components/forms/LocationForm';
import { SummaryForm } from '../components/forms/SummaryForm';

export const VersionA: React.FC = () => {
  const {
    currentStep,
    nextStep,
    previousStep,
    canProgress,
    saveToLocalStorage,
    formData,
  } = useFormContext();
  
  const [saveNotification, setSaveNotification] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
      setSaveNotification(true);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleManualSave = () => {
    saveToLocalStorage();
    setSaveNotification(true);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all form data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderForm = () => {
    switch (currentStep) {
      case 'rating':
        return <RatingInfoForm />;
      case 'policy':
        return <PolicyInfoForm />;
      case 'location':
        return <LocationForm />;
      case 'summary':
        return <SummaryForm />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'rating':
        return 'Rating & Insured Information';
      case 'policy':
        return 'Policy Information';
      case 'location':
        return 'Location Details';
      case 'summary':
        return 'Review & Submit';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'rating':
        return 'Please provide your basic information and business details.';
      case 'policy':
        return 'Configure your policy coverage and limits.';
      case 'location':
        return 'Add and configure your business locations.';
      case 'summary':
        return 'Review all information before submitting your application.';
      default:
        return '';
    }
  };

  const getProgress = () => {
    const steps = ['rating', 'policy', 'location', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
              Business Owners Policy Application
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Complete your insurance application in just a few steps
            </Typography>
          </Box>
          
          <FormStepper />
          
          <LinearProgress variant="determinate" value={getProgress()} sx={{ mb: 4 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {getStepTitle()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getStepDescription()}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mb: 3 }}>
          {renderForm()}
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={handleManualSave}
                size="small"
              >
                Save Progress
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RestartAlt />}
                onClick={handleReset}
                size="small"
              >
                Reset Form
              </Button>
            </Stack>
            
            <Stack direction="row" spacing={2}>
              {currentStep !== 'rating' && currentStep !== 'summary' && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={previousStep}
                >
                  Previous
                </Button>
              )}
              {currentStep !== 'summary' && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={nextStep}
                  disabled={!canProgress()}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Your progress is automatically saved every 2 seconds
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={saveNotification}
        autoHideDuration={2000}
        onClose={() => setSaveNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          Progress saved!
        </Alert>
      </Snackbar>
    </Box>
  );
};