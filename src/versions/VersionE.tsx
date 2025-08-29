import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  AlertTitle,
  Slider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Badge,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
  Business,
  AttachMoney,
  Security,
  LocationOn,
  CalendarToday,
  Email,
  Phone,
  Person,
  Calculate,
  TrendingUp,
  Shield,
  LocalOffer,
  Verified,
  AutoGraph,
  Savings,
  Help,
  Chat,
  Download,
  Print,
  Share,
  Assessment,
  EmojiEvents,
  Speed,
  Timer,
  DoneAll,
  PriorityHigh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormContext } from '../contexts/FormContext';

interface SectionStatus {
  basic: 'pending' | 'complete' | 'error';
  business: 'pending' | 'complete' | 'error';
  coverage: 'pending' | 'complete' | 'error';
  location: 'pending' | 'complete' | 'error';
}

export const VersionE: React.FC = () => {
  const { saveToLocalStorage } = useFormContext();
  const [expandedPanel, setExpandedPanel] = useState<string | false>('basic');
  const [formData, setFormData] = useState<any>({
    // Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Business Info
    companyName: '',
    entityType: '',
    industry: '',
    yearEstablished: '',
    revenue: '',
    employees: '',
    
    // Coverage
    effectiveDate: null,
    propertyLimit: 250000,
    liabilityLimit: 1000000,
    deductible: 1000,
    additionalCoverages: [],
    
    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    buildingType: '',
    squareFootage: '',
  });

  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    basic: 'pending',
    business: 'pending',
    coverage: 'pending',
    location: 'pending',
  });

  const [instantQuote, setInstantQuote] = useState<number | null>(null);
  const [discounts, setDiscounts] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    calculateCompletion();
    calculateInstantQuote();
    checkDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const calculateCompletion = () => {
    const fields = Object.keys(formData);
    const filledFields = fields.filter(field => {
      const value = formData[field];
      return value !== '' && value !== null && (Array.isArray(value) ? value.length > 0 : true);
    });
    const percentage = (filledFields.length / fields.length) * 100;
    setCompletionPercentage(Math.round(percentage));

    // Update section statuses
    const newStatus = { ...sectionStatus };
    
    // Basic Info
    if (formData.firstName && formData.lastName && formData.email && formData.phone) {
      newStatus.basic = 'complete';
    }
    
    // Business Info
    if (formData.companyName && formData.entityType && formData.industry && formData.revenue) {
      newStatus.business = 'complete';
    }
    
    // Coverage
    if (formData.effectiveDate && formData.propertyLimit && formData.liabilityLimit) {
      newStatus.coverage = 'complete';
    }
    
    // Location
    if (formData.address && formData.city && formData.state && formData.zipCode) {
      newStatus.location = 'complete';
    }
    
    setSectionStatus(newStatus);
  };

  const calculateInstantQuote = () => {
    if (formData.revenue && formData.employees && formData.propertyLimit && formData.liabilityLimit) {
      let basePrice = 100;
      
      // Revenue factor
      if (formData.revenue === '100-500k') basePrice += 50;
      if (formData.revenue === '500k-1m') basePrice += 100;
      if (formData.revenue === '1m-5m') basePrice += 200;
      if (formData.revenue === '>5m') basePrice += 400;
      
      // Coverage factor
      basePrice += (formData.propertyLimit / 100000) * 10;
      basePrice += (formData.liabilityLimit / 500000) * 15;
      
      // Deductible discount
      if (formData.deductible >= 2500) basePrice *= 0.9;
      if (formData.deductible >= 5000) basePrice *= 0.85;
      
      // Apply discounts
      basePrice *= (1 - (discounts.length * 0.05));
      
      setInstantQuote(Math.round(basePrice));
    }
  };

  const checkDiscounts = () => {
    const availableDiscounts = [];
    
    if (formData.yearEstablished && new Date().getFullYear() - parseInt(formData.yearEstablished) > 5) {
      availableDiscounts.push('Established Business');
    }
    
    if (formData.deductible >= 2500) {
      availableDiscounts.push('High Deductible');
    }
    
    if (formData.additionalCoverages?.includes('cyber')) {
      availableDiscounts.push('Cyber Security');
    }
    
    if (completionPercentage === 100) {
      availableDiscounts.push('Complete Application');
    }
    
    setDiscounts(availableDiscounts);
  };

  const handlePanelChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const getStatusIcon = (status: 'pending' | 'complete' | 'error') => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error':
        return <Warning sx={{ color: 'error.main' }} />;
      default:
        return <Timer sx={{ color: 'text.secondary' }} />;
    }
  };

  const speedDialActions = [
    { icon: <Help />, name: 'Get Help' },
    { icon: <Chat />, name: 'Live Chat' },
    { icon: <Phone />, name: 'Call Agent' },
    { icon: <Download />, name: 'Save Draft' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', pb: 4 }}>
      {/* Top Progress Bar */}
      <Paper elevation={0} sx={{ position: 'sticky', top: 0, zIndex: 100, borderRadius: 0 }}>
        <Box sx={{ p: 2, bgcolor: 'white' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Speed />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Dynamic Quote Builder
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fill out any section in any order - your quote updates instantly!
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Completion: {completionPercentage}%
                  </Typography>
                  {instantQuote && (
                    <Chip 
                      label={`Estimated: $${instantQuote}/mo`}
                      color="primary"
                      icon={<TrendingUp />}
                    />
                  )}
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Main Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Basic Information */}
            <Accordion 
              expanded={expandedPanel === 'basic'}
              onChange={handlePanelChange('basic')}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: sectionStatus.basic === 'complete' ? 'success.50' : 'background.paper',
                  borderRadius: expandedPanel === 'basic' ? '8px 8px 0 0' : 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  {getStatusIcon(sectionStatus.basic)}
                  <Typography variant="h6" fontWeight="bold">Contact Information</Typography>
                  {sectionStatus.basic === 'complete' && (
                    <Chip label="Complete" color="success" size="small" />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Business Information */}
            <Accordion 
              expanded={expandedPanel === 'business'}
              onChange={handlePanelChange('business')}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: sectionStatus.business === 'complete' ? 'success.50' : 'background.paper',
                  borderRadius: expandedPanel === 'business' ? '8px 8px 0 0' : 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  {getStatusIcon(sectionStatus.business)}
                  <Typography variant="h6" fontWeight="bold">Business Details</Typography>
                  {sectionStatus.business === 'complete' && (
                    <Chip label="Complete" color="success" size="small" />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Entity Type</InputLabel>
                      <Select
                        value={formData.entityType}
                        onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                        label="Entity Type"
                      >
                        <MenuItem value="llc">LLC</MenuItem>
                        <MenuItem value="corp">Corporation</MenuItem>
                        <MenuItem value="partnership">Partnership</MenuItem>
                        <MenuItem value="sole">Sole Proprietorship</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        label="Industry"
                      >
                        <MenuItem value="retail">Retail</MenuItem>
                        <MenuItem value="professional">Professional Services</MenuItem>
                        <MenuItem value="construction">Construction</MenuItem>
                        <MenuItem value="technology">Technology</MenuItem>
                        <MenuItem value="healthcare">Healthcare</MenuItem>
                        <MenuItem value="restaurant">Restaurant</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Year Established"
                      type="number"
                      value={formData.yearEstablished}
                      onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Annual Revenue</InputLabel>
                      <Select
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        label="Annual Revenue"
                      >
                        <MenuItem value="<100k">Under $100k</MenuItem>
                        <MenuItem value="100-500k">$100k - $500k</MenuItem>
                        <MenuItem value="500k-1m">$500k - $1M</MenuItem>
                        <MenuItem value="1m-5m">$1M - $5M</MenuItem>
                        <MenuItem value=">5m">Over $5M</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Number of Employees</InputLabel>
                      <Select
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                        label="Number of Employees"
                      >
                        <MenuItem value="1-5">1-5</MenuItem>
                        <MenuItem value="6-20">6-20</MenuItem>
                        <MenuItem value="21-50">21-50</MenuItem>
                        <MenuItem value="51-100">51-100</MenuItem>
                        <MenuItem value=">100">100+</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Coverage Options */}
            <Accordion 
              expanded={expandedPanel === 'coverage'}
              onChange={handlePanelChange('coverage')}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: sectionStatus.coverage === 'complete' ? 'success.50' : 'background.paper',
                  borderRadius: expandedPanel === 'coverage' ? '8px 8px 0 0' : 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  {getStatusIcon(sectionStatus.coverage)}
                  <Typography variant="h6" fontWeight="bold">Coverage Selection</Typography>
                  {sectionStatus.coverage === 'complete' && (
                    <Chip label="Complete" color="success" size="small" />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Effective Date"
                      value={formData.effectiveDate}
                      onChange={(date) => setFormData({ ...formData, effectiveDate: date })}
                      sx={{ width: '100%' }}
                    />
                  </LocalizationProvider>
                  
                  <Box>
                    <Typography gutterBottom>
                      Property Coverage: ${formData.propertyLimit.toLocaleString()}
                    </Typography>
                    <Slider
                      value={formData.propertyLimit}
                      onChange={(_, value) => setFormData({ ...formData, propertyLimit: value })}
                      min={100000}
                      max={2000000}
                      step={50000}
                      marks={[
                        { value: 100000, label: '$100K' },
                        { value: 1000000, label: '$1M' },
                        { value: 2000000, label: '$2M' },
                      ]}
                    />
                  </Box>
                  
                  <Box>
                    <Typography gutterBottom>
                      Liability Coverage: ${formData.liabilityLimit.toLocaleString()}
                    </Typography>
                    <Slider
                      value={formData.liabilityLimit}
                      onChange={(_, value) => setFormData({ ...formData, liabilityLimit: value })}
                      min={500000}
                      max={5000000}
                      step={100000}
                      marks={[
                        { value: 500000, label: '$500K' },
                        { value: 2500000, label: '$2.5M' },
                        { value: 5000000, label: '$5M' },
                      ]}
                    />
                  </Box>
                  
                  <FormControl fullWidth>
                    <InputLabel>Deductible</InputLabel>
                    <Select
                      value={formData.deductible}
                      onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                      label="Deductible"
                    >
                      <MenuItem value={500}>$500</MenuItem>
                      <MenuItem value={1000}>$1,000</MenuItem>
                      <MenuItem value={2500}>$2,500</MenuItem>
                      <MenuItem value={5000}>$5,000</MenuItem>
                      <MenuItem value={10000}>$10,000</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box>
                    <Typography gutterBottom fontWeight="bold">Additional Coverages</Typography>
                    <Grid container spacing={1}>
                      {['Cyber Liability', 'Employment Practices', 'Business Auto', 'Professional Liability'].map((coverage) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={coverage}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formData.additionalCoverages?.includes(coverage.toLowerCase().replace(' ', ''))}
                                onChange={(e) => {
                                  const key = coverage.toLowerCase().replace(' ', '');
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      additionalCoverages: [...(formData.additionalCoverages || []), key]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      additionalCoverages: formData.additionalCoverages?.filter((c: string) => c !== key)
                                    });
                                  }
                                }}
                              />
                            }
                            label={coverage}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Location Information */}
            <Accordion 
              expanded={expandedPanel === 'location'}
              onChange={handlePanelChange('location')}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{ 
                  bgcolor: sectionStatus.location === 'complete' ? 'success.50' : 'background.paper',
                  borderRadius: expandedPanel === 'location' ? '8px 8px 0 0' : 2,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  {getStatusIcon(sectionStatus.location)}
                  <Typography variant="h6" fontWeight="bold">Location Information</Typography>
                  {sectionStatus.location === 'complete' && (
                    <Chip label="Complete" color="success" size="small" />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        label="State"
                      >
                        <MenuItem value="CA">California</MenuItem>
                        <MenuItem value="NY">New York</MenuItem>
                        <MenuItem value="TX">Texas</MenuItem>
                        <MenuItem value="FL">Florida</MenuItem>
                        <MenuItem value="IL">Illinois</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Building Type</InputLabel>
                      <Select
                        value={formData.buildingType}
                        onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                        label="Building Type"
                      >
                        <MenuItem value="owned">Owned Building</MenuItem>
                        <MenuItem value="leased">Leased Space</MenuItem>
                        <MenuItem value="home">Home Office</MenuItem>
                        <MenuItem value="virtual">Virtual Office</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Square Footage"
                      type="number"
                      value={formData.squareFootage}
                      onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Right Column - Live Quote & Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} sx={{ position: 'sticky', top: 100 }}>
              {/* Live Quote Card */}
              <Grow in={instantQuote !== null} timeout={500}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="bold">
                          Live Quote
                        </Typography>
                        <Chip 
                          icon={<AutoGraph />}
                          label="Updates instantly"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                          }}
                        />
                      </Stack>
                      
                      {instantQuote ? (
                        <>
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h2" fontWeight="bold">
                              ${instantQuote}
                            </Typography>
                            <Typography variant="subtitle1">
                              per month
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                          
                          <Stack spacing={1}>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                              This quote includes:
                            </Typography>
                            <List dense sx={{ py: 0 }}>
                              <ListItem sx={{ py: 0, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Property: $${(formData.propertyLimit || 0).toLocaleString()}`}
                                  primaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                              <ListItem sx={{ py: 0, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Liability: $${(formData.liabilityLimit || 0).toLocaleString()}`}
                                  primaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                              <ListItem sx={{ py: 0, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Deductible: $${(formData.deductible || 0).toLocaleString()}`}
                                  primaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            </List>
                          </Stack>
                        </>
                      ) : (
                        <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                          Complete more fields to see your quote
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grow>

              {/* Discounts Card */}
              {discounts.length > 0 && (
                <Fade in timeout={700}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocalOffer color="success" />
                          <Typography variant="h6" fontWeight="bold">
                            Available Discounts
                          </Typography>
                        </Stack>
                        <Stack spacing={1}>
                          {discounts.map((discount, index) => (
                            <Chip
                              key={index}
                              label={discount}
                              color="success"
                              variant="outlined"
                              icon={<Savings />}
                              sx={{ justifyContent: 'flex-start' }}
                            />
                          ))}
                        </Stack>
                        <Alert severity="success">
                          You're saving approximately ${discounts.length * 10}/month!
                        </Alert>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              )}

              {/* Progress Summary */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Progress Summary
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(sectionStatus).map(([section, status]) => (
                      <Stack key={section} direction="row" alignItems="center" spacing={1}>
                        {getStatusIcon(status)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {section} Information
                        </Typography>
                        {status === 'complete' && (
                          <DoneAll sx={{ fontSize: 16, color: 'success.main', ml: 'auto' }} />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                  
                  {completionPercentage === 100 && (
                    <Box sx={{ mt: 3 }}>
                      <Alert severity="success">
                        <AlertTitle>Ready to Submit!</AlertTitle>
                        Your application is complete. Review and submit below.
                      </Alert>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {completionPercentage >= 50 && (
                <Fade in timeout={900}>
                  <Stack spacing={2}>
                    <Button 
                      variant="contained" 
                      size="large"
                      disabled={completionPercentage < 100}
                      startIcon={<Verified />}
                    >
                      Submit Application
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      startIcon={<Download />}
                    >
                      Save Draft
                    </Button>
                  </Stack>
                </Fade>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Speed Dial */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};