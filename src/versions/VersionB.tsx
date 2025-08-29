import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Fade,
  Grow,
  Badge,
  Divider,
} from '@mui/material';
import { 
  NavigateNext, 
  NavigateBefore, 
  Save, 
  RestartAlt,
  CheckCircle,
  RadioButtonUnchecked,
  Info,
  AutorenewOutlined,
  CloudDone,
} from '@mui/icons-material';
import { useFormContext } from '../contexts/FormContext';
import { RatingInfoForm } from '../components/forms/RatingInfoForm';
import { PolicyInfoForm } from '../components/forms/PolicyInfoForm';
import { LocationForm } from '../components/forms/LocationForm';
import { SummaryForm } from '../components/forms/SummaryForm';

const steps = [
  {
    label: 'Rating Information',
    description: 'Basic information and business details',
    icon: '1',
    key: 'rating',
  },
  {
    label: 'Policy Information',
    description: 'Coverage and limits configuration',
    icon: '2',
    key: 'policy',
  },
  {
    label: 'Location Details',
    description: 'Business location configuration',
    icon: '3',
    key: 'location',
  },
  {
    label: 'Review & Submit',
    description: 'Final review and submission',
    icon: '4',
    key: 'summary',
  },
];

export const VersionB: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    canProgress,
    saveToLocalStorage,
    formData,
  } = useFormContext();
  
  const [saveNotification, setSaveNotification] = React.useState(false);
  const [autoSaved, setAutoSaved] = React.useState(false);
  const [highestStepReached, setHighestStepReached] = React.useState(0);
  const activeStepIndex = steps.findIndex(s => s.key === currentStep);

  // Track the highest step reached
  React.useEffect(() => {
    if (activeStepIndex > highestStepReached) {
      setHighestStepReached(activeStepIndex);
    }
  }, [activeStepIndex, highestStepReached]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1000);
    }, 2000);
    
    return () => clearTimeout(timer);
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

  const getCompletedSteps = () => {
    const stepOrder = ['rating', 'policy', 'location', 'summary'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex;
  };

  const handleStepClick = (stepKey: string) => {
    // Allow navigation to any step that has been visited
    const clickedIndex = steps.findIndex(s => s.key === stepKey);
    // Can click if it's within the highest step reached
    if (clickedIndex <= highestStepReached) {
      setCurrentStep(stepKey as any);
    }
  };

  return (
    <Box sx={{ py: 3, bgcolor: '#e9ecef', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Fade in timeout={600}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Business Owners Policy
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Secure your business with comprehensive coverage
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Auto-save is active">
                  <Chip 
                    icon={autoSaved ? <CloudDone /> : <AutorenewOutlined />}
                    label={autoSaved ? "Saved" : "Auto-save"}
                    color={autoSaved ? "success" : "default"}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Tooltip>
                <Tooltip title="Save progress manually">
                  <IconButton 
                    onClick={handleManualSave}
                    sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset form">
                  <IconButton 
                    onClick={handleReset}
                    sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        </Fade>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left Sidebar - Vertical Stepper */}
          <Grow in timeout={800}>
            <Card sx={{ 
              width: { xs: '100%', md: 300 }, 
              height: 'fit-content',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Application Progress
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stepper activeStep={activeStepIndex} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.key} completed={index < getCompletedSteps()}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: index <= activeStepIndex ? 'primary.main' : 'grey.300',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              transition: 'all 0.3s',
                              cursor: index <= highestStepReached ? 'pointer' : 'default',
                            }}
                            onClick={() => handleStepClick(step.key)}
                          >
                            {index < getCompletedSteps() ? (
                              <CheckCircle sx={{ fontSize: 20 }} />
                            ) : (
                              step.icon
                            )}
                          </Box>
                        )}
                        sx={{
                          cursor: index <= highestStepReached ? 'pointer' : 'default',
                          '&:hover': index <= highestStepReached ? {
                            '& .MuiStepLabel-label': {
                              color: 'primary.main',
                            }
                          } : {},
                        }}
                        onClick={() => handleStepClick(step.key)}
                      >
                        <Typography variant="subtitle2" fontWeight={index === activeStepIndex ? 'bold' : 'normal'}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
                
                {/* Quick Stats */}
                <Box sx={{ 
                  mt: 4, 
                  p: 2, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Completion Status
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {Math.round((activeStepIndex + 1) / steps.length * 100)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Step {activeStepIndex + 1} of {steps.length}
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grow>

          {/* Main Content Area */}
          <Box sx={{ flex: 1 }}>
            <Grow in timeout={1000}>
              <Card sx={{ 
                mb: 3,
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {activeStepIndex + 1}
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {steps[activeStepIndex].label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {steps[activeStepIndex].description}
                      </Typography>
                    </Box>
                    <Tooltip title="Learn more about this section">
                      <IconButton size="small">
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {renderForm()}
                </CardContent>
              </Card>
            </Grow>

            {/* Navigation */}
            <Fade in timeout={1200}>
              <Card sx={{
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}>
                <CardContent>
                  <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center"
                  >
                    <Button
                      variant="text"
                      startIcon={<NavigateBefore />}
                      onClick={previousStep}
                      disabled={currentStep === 'rating'}
                      size="large"
                    >
                      Previous
                    </Button>
                    
                    <Stack direction="row" spacing={1}>
                      {steps.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: index <= activeStepIndex ? 'primary.main' : 'grey.300',
                            transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </Stack>
                    
                    <Button
                      variant="contained"
                      endIcon={currentStep === 'summary' ? <CheckCircle /> : <NavigateNext />}
                      onClick={nextStep}
                      disabled={currentStep === 'summary' ? false : !canProgress()}
                      size="large"
                      sx={{
                        bgcolor: currentStep === 'summary' ? 'success.main' : 'primary.main',
                        '&:hover': {
                          bgcolor: currentStep === 'summary' ? 'success.dark' : 'primary.dark',
                        },
                      }}
                    >
                      {currentStep === 'summary' ? 'Submit Application' : 'Continue'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={saveNotification}
        autoHideDuration={2000}
        onClose={() => setSaveNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CloudDone />
            <Typography>Progress saved successfully!</Typography>
          </Stack>
        </Alert>
      </Snackbar>
    </Box>
  );
};