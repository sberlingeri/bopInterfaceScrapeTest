import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Fade,
  Zoom,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Policy,
  AttachMoney,
  CalendarToday,
  Email,
  CheckCircle,
  Circle,
  ArrowForward,
  ArrowBack,
  Dashboard,
  Security,
  TrendingUp,
  LocalAtm,
  Store,
  HomeWork,
  DirectionsCar,
  Engineering,
  Restaurant,
  LocalHospital,
  School,
  Gavel,
  Construction,
  ShoppingCart,
  Palette,
  ViewInAr,
  Timeline,
  Speed,
  AutoFixHigh,
  Verified,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormContext } from '../contexts/FormContext';

interface StepCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: string[];
  color: string;
  completed: boolean;
}

const industryOptions = [
  { value: 'retail', label: 'Retail Store', icon: <Store />, color: '#FF6B6B' },
  { value: 'restaurant', label: 'Restaurant', icon: <Restaurant />, color: '#4ECDC4' },
  { value: 'professional', label: 'Professional Services', icon: <Gavel />, color: '#45B7D1' },
  { value: 'construction', label: 'Construction', icon: <Construction />, color: '#96CEB4' },
  { value: 'healthcare', label: 'Healthcare', icon: <LocalHospital />, color: '#FFEAA7' },
  { value: 'technology', label: 'Technology', icon: <Engineering />, color: '#A29BFE' },
  { value: 'education', label: 'Education', icon: <School />, color: '#FD79A8' },
  { value: 'automotive', label: 'Automotive', icon: <DirectionsCar />, color: '#FDCB6E' },
];

const coverageOptions = [
  { 
    id: 'basic', 
    title: 'Essential', 
    price: '$99-149/mo',
    features: ['Property: $250K', 'Liability: $1M', 'Basic Coverage'],
    color: '#74b9ff',
    icon: <Security />
  },
  { 
    id: 'standard', 
    title: 'Professional', 
    price: '$150-249/mo',
    features: ['Property: $500K', 'Liability: $2M', 'Cyber Protection', 'Business Interruption'],
    color: '#a29bfe',
    icon: <Verified />,
    recommended: true
  },
  { 
    id: 'premium', 
    title: 'Enterprise', 
    price: '$250+/mo',
    features: ['Property: $1M+', 'Liability: $5M', 'Full Cyber Suite', 'Business Interruption', 'Equipment Breakdown'],
    color: '#6c5ce7',
    icon: <AutoFixHigh />
  },
];

export const VersionD: React.FC = () => {
  const { saveToLocalStorage } = useFormContext();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    email: '',
    effectiveDate: null,
    industry: '',
    companyName: '',
    revenue: '',
    employees: '',
    coverage: '',
  });
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null);
  const [selectedCoverage, setSelectedCoverage] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const steps = [
    {
      title: 'Welcome! Let\'s Get Started',
      subtitle: 'Tell us about your business',
      content: 'businessInfo',
    },
    {
      title: 'Choose Your Industry',
      subtitle: 'This helps us customize your coverage',
      content: 'industry',
    },
    {
      title: 'Select Your Coverage Level',
      subtitle: 'Pick the protection that fits your needs',
      content: 'coverage',
    },
    {
      title: 'Final Details',
      subtitle: 'Just a few more questions',
      content: 'details',
    },
    {
      title: 'Your Quote is Ready!',
      subtitle: 'Review your personalized quote',
      content: 'summary',
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderBusinessInfo = () => (
    <Fade in timeout={500}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <ViewInAr sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quick & Easy
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Get your business insurance quote in under 3 minutes with our visual workflow.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2}>
                <Chip icon={<Speed />} label="Fast" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip icon={<Security />} label="Secure" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip icon={<Timeline />} label="Smart" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Stack>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight="bold">
                  Basic Information
                </Typography>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Business Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  variant="outlined"
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Coverage Start Date"
                    value={formData.effectiveDate}
                    onChange={(date) => setFormData({ ...formData, effectiveDate: date })}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
                <FormControl fullWidth>
                  <InputLabel>Annual Revenue</InputLabel>
                  <Select
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    label="Annual Revenue"
                  >
                    <MenuItem value="<100k">Under $100,000</MenuItem>
                    <MenuItem value="100-500k">$100,000 - $500,000</MenuItem>
                    <MenuItem value="500k-1m">$500,000 - $1M</MenuItem>
                    <MenuItem value="1m-5m">$1M - $5M</MenuItem>
                    <MenuItem value=">5m">Over $5M</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Number of Employees</InputLabel>
                  <Select
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    label="Number of Employees"
                  >
                    <MenuItem value="1-5">1-5 employees</MenuItem>
                    <MenuItem value="6-20">6-20 employees</MenuItem>
                    <MenuItem value="21-50">21-50 employees</MenuItem>
                    <MenuItem value="51-100">51-100 employees</MenuItem>
                    <MenuItem value=">100">100+ employees</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fade>
  );

  const renderIndustry = () => (
    <Fade in timeout={500}>
      <Box>
        <Grid container spacing={3}>
          {industryOptions.map((industry) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={industry.value}>
              <Zoom in timeout={300 + industryOptions.indexOf(industry) * 100}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: formData.industry === industry.value ? 3 : 0,
                    borderColor: industry.color,
                    transform: hoveredIndustry === industry.value ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hoveredIndustry === industry.value ? 6 : 1,
                  }}
                  onClick={() => setFormData({ ...formData, industry: industry.value })}
                  onMouseEnter={() => setHoveredIndustry(industry.value)}
                  onMouseLeave={() => setHoveredIndustry(null)}
                >
                  <CardContent sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: industry.color, 
                        width: 80, 
                        height: 80,
                        mb: 2,
                      }}
                    >
                      {industry.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {industry.label}
                    </Typography>
                    {formData.industry === industry.value && (
                      <CheckCircle sx={{ color: industry.color, mt: 1 }} />
                    )}
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  );

  const renderCoverage = () => (
    <Fade in timeout={500}>
      <Box>
        <Grid container spacing={3}>
          {coverageOptions.map((option, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={option.id}>
              <Zoom in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    border: selectedCoverage === option.id ? 3 : 0,
                    borderColor: option.color,
                    transform: selectedCoverage === option.id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => setSelectedCoverage(option.id)}
                >
                  {option.recommended && (
                    <Chip
                      label="RECOMMENDED"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: option.color,
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {option.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="primary" 
                      fontWeight="bold"
                      gutterBottom
                    >
                      {option.price}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      {option.features.map((feature, i) => (
                        <ListItem key={i} sx={{ justifyContent: 'center', py: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 18, mr: 1, color: option.color }} />
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              fontWeight: i === 0 ? 'bold' : 'normal'
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      variant={selectedCoverage === option.id ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => {
                        setSelectedCoverage(option.id);
                        setFormData({ ...formData, coverage: option.id });
                      }}
                    >
                      {selectedCoverage === option.id ? 'Selected' : 'Select Plan'}
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  );

  const renderDetails = () => (
    <Fade in timeout={500}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Additional Information
              </Typography>
              <Stack spacing={3} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Business Address"
                  multiline
                  rows={2}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Years in Business"
                  type="number"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Brief Description of Business Activities"
                  multiline
                  rows={3}
                  variant="outlined"
                />
                <FormControl fullWidth>
                  <InputLabel>Prior Insurance Claims</InputLabel>
                  <Select label="Prior Insurance Claims">
                    <MenuItem value="none">No claims in past 5 years</MenuItem>
                    <MenuItem value="1-2">1-2 claims</MenuItem>
                    <MenuItem value="3+">3+ claims</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <Business sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={formData.companyName || 'Your Company'}
                    secondary={formData.industry || 'Industry'}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <AttachMoney sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={formData.revenue || 'Revenue Range'}
                    secondary={formData.employees || 'Employees'}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                      <Security sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={coverageOptions.find(c => c.id === formData.coverage)?.title || 'Coverage'}
                    secondary={coverageOptions.find(c => c.id === formData.coverage)?.price || 'Price'}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fade>
  );

  const renderSummary = () => (
    <Fade in timeout={500}>
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Your Quote is Ready!
                  </Typography>
                  <Typography variant="h2" color="primary" fontWeight="bold" gutterBottom>
                    $185/month
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Based on your business profile and selected coverage
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                    <Button variant="contained" size="large" color="primary">
                      Purchase Policy
                    </Button>
                    <Button variant="outlined" size="large">
                      Download Quote
                    </Button>
                    <Button variant="outlined" size="large">
                      Speak to Agent
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Coverage Highlights
                  </Typography>
                  <List dense>
                    <ListItem>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <ListItemText primary="Property Coverage: $500,000" />
                    </ListItem>
                    <ListItem>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <ListItemText primary="General Liability: $2M" />
                    </ListItem>
                    <ListItem>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <ListItemText primary="Cyber Protection Included" />
                    </ListItem>
                    <ListItem>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <ListItemText primary="Business Interruption Coverage" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Next Steps
                  </Typography>
                  <Typography variant="body2">
                    1. Review your quote details
                  </Typography>
                  <Typography variant="body2">
                    2. Choose payment frequency
                  </Typography>
                  <Typography variant="body2">
                    3. Complete purchase
                  </Typography>
                  <Typography variant="body2">
                    4. Receive policy documents
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderContent = () => {
    switch (steps[activeStep].content) {
      case 'businessInfo':
        return renderBusinessInfo();
      case 'industry':
        return renderIndustry();
      case 'coverage':
        return renderCoverage();
      case 'details':
        return renderDetails();
      case 'summary':
        return renderSummary();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            background: 'white',
            borderRadius: 3,
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {steps[activeStep].title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {steps[activeStep].subtitle}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      transition: 'all 0.3s',
                    }}
                  >
                    {index < activeStep ? <CheckCircle /> : index + 1}
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep + 1) / steps.length * 100}
            sx={{ mt: 3, height: 8, borderRadius: 4 }}
          />
        </Paper>

        {/* Content */}
        <Box sx={{ mb: 4 }}>
          {renderContent()}
        </Box>

        {/* Navigation */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0}
              size="large"
            >
              Previous
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                size="large"
              >
                Continue
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};