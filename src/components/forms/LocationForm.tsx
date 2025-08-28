import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Autocomplete,
  Tabs,
  Tab,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  LocationOn,
  Business,
} from '@mui/icons-material';
import { useFormContext } from '../../contexts/FormContext';
import { Location, Building, PROPERTY_DEDUCTIBLES, CONSTRUCTION_TYPES, COVERAGE_OPTIONS } from '../../types';

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: 3, 
          bgcolor: 'background.paper',
          borderRadius: '0 0 4px 4px'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const LocationForm: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeLocationTab, setActiveLocationTab] = useState(0);
  const [activeBuildingTabs, setActiveBuildingTabs] = useState<{ [key: string]: number }>({});

  // Handle location changes
  const handleLocationChange = (locationIndex: number, field: string, value: any) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      [field]: value,
    };
    updateFormData('locations', updatedLocations);
  };

  // Handle building changes
  const handleBuildingChange = (locationIndex: number, buildingIndex: number, field: string, value: any) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[locationIndex].buildings[buildingIndex] = {
      ...updatedLocations[locationIndex].buildings[buildingIndex],
      [field]: value,
    };
    updateFormData('locations', updatedLocations);
  };

  // Add a new location
  const handleAddLocation = () => {
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
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
          id: `bldg-${Date.now()}-1`,
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
    };
    const updatedLocations = [...formData.locations, newLocation];
    updateFormData('locations', updatedLocations);
    setActiveLocationTab(updatedLocations.length - 1);
  };

  // Remove a location
  const handleRemoveLocation = (locationIndex: number) => {
    const updatedLocations = formData.locations.filter((_, index) => index !== locationIndex);
    updateFormData('locations', updatedLocations);
    if (activeLocationTab >= updatedLocations.length) {
      setActiveLocationTab(updatedLocations.length - 1);
    }
  };

  // Add a new building to a location
  const handleAddBuilding = (locationIndex: number) => {
    const newBuilding: Building = {
      id: `bldg-${Date.now()}`,
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
    };
    const updatedLocations = [...formData.locations];
    updatedLocations[locationIndex].buildings.push(newBuilding);
    updateFormData('locations', updatedLocations);
    
    // Switch to the new building tab
    const locationId = updatedLocations[locationIndex].id;
    setActiveBuildingTabs({
      ...activeBuildingTabs,
      [locationId]: updatedLocations[locationIndex].buildings.length - 1
    });
  };

  // Remove a building from a location
  const handleRemoveBuilding = (locationIndex: number, buildingIndex: number) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[locationIndex].buildings = updatedLocations[locationIndex].buildings.filter(
      (_, index) => index !== buildingIndex
    );
    updateFormData('locations', updatedLocations);
    
    const locationId = updatedLocations[locationIndex].id;
    const currentBuildingTab = activeBuildingTabs[locationId] || 0;
    if (currentBuildingTab >= updatedLocations[locationIndex].buildings.length) {
      setActiveBuildingTabs({
        ...activeBuildingTabs,
        [locationId]: updatedLocations[locationIndex].buildings.length - 1
      });
    }
  };

  // Use insured location
  const handleUseInsuredLocation = (locationIndex: number) => {
    const updatedLocations = [...formData.locations];
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      streetNumber: formData.insuredInfo.streetNumber,
      streetName: formData.insuredInfo.streetName,
      city: formData.insuredInfo.city,
      state: formData.insuredInfo.state,
      zipCode: formData.insuredInfo.zipCode,
      useInsuredLocation: true,
    };
    updateFormData('locations', updatedLocations);
  };

  // Toggle location coverage selection
  const handleLocationCoverageToggle = (locationIndex: number, coverage: string) => {
    const location = formData.locations[locationIndex];
    const currentSelections = location.coverageSelections;
    const newSelections = currentSelections.includes(coverage)
      ? currentSelections.filter(c => c !== coverage)
      : [...currentSelections, coverage];
    handleLocationChange(locationIndex, 'coverageSelections', newSelections);
  };

  // Toggle building coverage selection
  const handleBuildingCoverageToggle = (locationIndex: number, buildingIndex: number, coverage: string) => {
    const building = formData.locations[locationIndex].buildings[buildingIndex];
    const currentSelections = building.coverageSelections;
    const newSelections = currentSelections.includes(coverage)
      ? currentSelections.filter(c => c !== coverage)
      : [...currentSelections, coverage];
    handleBuildingChange(locationIndex, buildingIndex, 'coverageSelections', newSelections);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <Tabs
          value={activeLocationTab}
          onChange={(e, newValue) => setActiveLocationTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: 'primary.main',
            '& .MuiTab-root': {
              color: 'white',
              fontWeight: 'bold',
              '&.Mui-selected': {
                bgcolor: 'white',
                color: 'primary.main',
              }
            },
            '& .MuiTabs-indicator': {
              bgcolor: 'secondary.main',
              height: 4,
            }
          }}
        >
          {formData.locations.map((location, index) => (
            <Tab 
              key={location.id} 
              icon={<LocationOn sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Location {index + 1}</span>
                  {formData.locations.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLocation(index);
                      }}
                      sx={{ color: 'inherit' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {formData.locations.map((location, locationIndex) => (
          <TabPanel key={location.id} value={activeLocationTab} index={locationIndex}>
            {/* Location Address Section */}
            <Typography variant="h6" gutterBottom>
              Location Address
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={() => handleUseInsuredLocation(locationIndex)}
                sx={{ mb: 2 }}
              >
                Use Insured Location
              </Button>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={location.manualAddressEntry}
                    onChange={(e) => handleLocationChange(locationIndex, 'manualAddressEntry', e.target.checked)}
                  />
                }
                label="Can't find address? Enter manually"
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Street Number"
                    value={location.streetNumber}
                    onChange={(e) => handleLocationChange(locationIndex, 'streetNumber', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Street Name"
                    value={location.streetName}
                    onChange={(e) => handleLocationChange(locationIndex, 'streetName', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={location.city}
                    onChange={(e) => handleLocationChange(locationIndex, 'city', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={US_STATES}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={US_STATES.find(s => s.code === location.state) || null}
                    onChange={(_, value) => handleLocationChange(locationIndex, 'state', value?.code || '')}
                    renderInput={(params) => (
                      <TextField {...params} label="State" />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    value={location.zipCode}
                    onChange={(e) => handleLocationChange(locationIndex, 'zipCode', e.target.value)}
                    inputProps={{ maxLength: 5, pattern: '[0-9]{5}' }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Equipment Breakdown and Property Deductible */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Equipment Breakdown</FormLabel>
                  <RadioGroup
                    row
                    value={location.equipmentBreakdown}
                    onChange={(e) => handleLocationChange(locationIndex, 'equipmentBreakdown', e.target.value)}
                  >
                    <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Property Deductible"
                  value={location.propertyDeductible}
                  onChange={(e) => handleLocationChange(locationIndex, 'propertyDeductible', e.target.value)}
                >
                  {PROPERTY_DEDUCTIBLES.map((deductible) => (
                    <MenuItem key={deductible} value={deductible}>
                      {deductible}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Coverage Selection for Location */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📋 Coverage Selection for Location
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {COVERAGE_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    onClick={() => handleLocationCoverageToggle(locationIndex, option)}
                    color={location.coverageSelections.includes(option) ? 'primary' : 'default'}
                    variant={location.coverageSelections.includes(option) ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: location.coverageSelections.includes(option) ? 'bold' : 'normal',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 2,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Buildings Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business /> Buildings
            </Typography>
            
            <Paper elevation={1} sx={{ bgcolor: 'secondary.50', border: '2px solid', borderColor: 'secondary.main' }}>
              <Tabs
                value={activeBuildingTabs[location.id] || 0}
                onChange={(e, newValue) => setActiveBuildingTabs({
                  ...activeBuildingTabs,
                  [location.id]: newValue
                })}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: 'secondary.main',
                  '& .MuiTab-root': {
                    color: 'white',
                    minHeight: 48,
                    '&.Mui-selected': {
                      bgcolor: 'white',
                      color: 'secondary.main',
                    }
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: 'primary.main',
                    height: 3,
                  }
                }}
              >
                {location.buildings.map((building, index) => (
                  <Tab
                    key={building.id}
                    icon={<Business sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>Building {index + 1}</span>
                        {location.buildings.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBuilding(locationIndex, index);
                            }}
                            sx={{ color: 'inherit', p: 0.5 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    }
                  />
                ))}
              </Tabs>

              {location.buildings.map((building, buildingIndex) => (
                <TabPanel 
                  key={building.id} 
                  value={activeBuildingTabs[location.id] || 0} 
                  index={buildingIndex}
                >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Construction Type"
                        value={building.constructionType}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'constructionType', e.target.value)}
                      >
                        {CONSTRUCTION_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Year of Construction"
                        type="number"
                        value={building.yearOfConstruction}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'yearOfConstruction', e.target.value)}
                        inputProps={{ min: 1800, max: new Date().getFullYear() }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Automatic Sprinkler System</FormLabel>
                        <RadioGroup
                          row
                          value={building.automaticSprinklerSystem}
                          onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'automaticSprinklerSystem', e.target.value)}
                        >
                          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="No" control={<Radio />} label="No" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Business Personal Property Limit"
                        value={building.businessPersonalPropertyLimit || ''}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'businessPersonalPropertyLimit', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Building Limit"
                        value={building.buildingLimit || ''}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'buildingLimit', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Percentage Owner Occupied"
                        value={building.percentageOwnerOccupied}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'percentageOwnerOccupied', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Classification Description"
                        value={building.classificationDescription}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'classificationDescription', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Rating Group Class"
                        value={building.ratingGroupClass}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'ratingGroupClass', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Classification Square Footage"
                        value={building.classificationSquareFootage || ''}
                        onChange={(e) => handleBuildingChange(locationIndex, buildingIndex, 'classificationSquareFootage', parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                  </Grid>

                  {/* Coverage Selection for Building */}
                  <Paper elevation={0} sx={{ p: 2, mt: 3, bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      🏢 Coverage Selection for Building
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {COVERAGE_OPTIONS.map((option) => (
                        <Chip
                          key={option}
                          label={option}
                          size="small"
                          onClick={() => handleBuildingCoverageToggle(locationIndex, buildingIndex, option)}
                          color={building.coverageSelections.includes(option) ? 'secondary' : 'default'}
                          variant={building.coverageSelections.includes(option) ? 'filled' : 'outlined'}
                          sx={{
                            fontWeight: building.coverageSelections.includes(option) ? 'bold' : 'normal',
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: 1,
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </TabPanel>
              ))}
            </Paper>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() => handleAddBuilding(locationIndex)}
              sx={{ 
                mt: 2,
                fontWeight: 'bold',
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Add another building
            </Button>
          </TabPanel>
        ))}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<LocationOn />}
        onClick={handleAddLocation}
        fullWidth
        sx={{
          py: 2,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: 3,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          '&:hover': {
            boxShadow: 5,
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          }
        }}
      >
        Add another location
      </Button>
    </Box>
  );
};