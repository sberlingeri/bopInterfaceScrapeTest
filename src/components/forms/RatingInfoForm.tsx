import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Box,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays, subDays } from 'date-fns';
import { useFormContext } from '../../contexts/FormContext';
import { ENTITY_TYPES } from '../../types';

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

export const RatingInfoForm: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const [addressSearchValue, setAddressSearchValue] = useState('');

  const handleRatingChange = (field: string, value: any) => {
    updateFormData('ratingInfo', { [field]: value });
  };

  const handleInsuredChange = (field: string, value: any) => {
    updateFormData('insuredInfo', { [field]: value });
  };

  const handleManualAddressToggle = () => {
    handleInsuredChange('manualAddressEntry', !formData.insuredInfo.manualAddressEntry);
  };

  // Simulated address search - in production, this would use Google Maps API
  const handleAddressSearch = (value: string) => {
    setAddressSearchValue(value);
    // Simulate parsing an address
    if (value.length > 5) {
      const parts = value.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const streetParts = parts[0].split(' ');
        const streetNumber = streetParts[0];
        const streetName = streetParts.slice(1).join(' ');
        
        handleInsuredChange('streetNumber', streetNumber);
        handleInsuredChange('streetName', streetName);
        handleInsuredChange('mailingAddress', value);
        
        if (parts[1]) handleInsuredChange('city', parts[1]);
        if (parts[2]) {
          const stateParts = parts[2].split(' ');
          if (stateParts.length >= 2) {
            handleInsuredChange('state', stateParts[0]);
            handleInsuredChange('zipCode', stateParts[1]);
          }
        }
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rating Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={formData.ratingInfo.email}
                onChange={(e) => handleRatingChange('email', e.target.value)}
                helperText="Enter a valid email address"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Effective Date"
                value={formData.ratingInfo.effectiveDate}
                onChange={(date) => handleRatingChange('effectiveDate', date)}
                minDate={subDays(new Date(), 14)}
                maxDate={addDays(new Date(), 90)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: 'Must be between 14 days ago and 90 days from today'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Insured Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Entity Type"
                required
                value={formData.insuredInfo.entityType}
                onChange={(e) => handleInsuredChange('entityType', e.target.value)}
              >
                {ENTITY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Company Name"
                required
                value={formData.insuredInfo.companyName}
                onChange={(e) => handleInsuredChange('companyName', e.target.value)}
              />
            </Grid>

            {!formData.insuredInfo.manualAddressEntry && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Search for Address"
                  placeholder="Enter address (e.g., 100 Main Street, White Plains, NY)"
                  value={addressSearchValue}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  helperText="Start typing to search for an address"
                />
              </Grid>
            )}

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.insuredInfo.manualAddressEntry}
                    onChange={handleManualAddressToggle}
                  />
                }
                label="Can't find address? Enter manually"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Street Number"
                required
                disabled={!formData.insuredInfo.manualAddressEntry}
                value={formData.insuredInfo.streetNumber}
                onChange={(e) => handleInsuredChange('streetNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Street Name"
                required
                disabled={!formData.insuredInfo.manualAddressEntry}
                value={formData.insuredInfo.streetName}
                onChange={(e) => handleInsuredChange('streetName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="City"
                required
                disabled={!formData.insuredInfo.manualAddressEntry}
                value={formData.insuredInfo.city}
                onChange={(e) => handleInsuredChange('city', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={US_STATES}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={US_STATES.find(s => s.code === formData.insuredInfo.state) || null}
                onChange={(_, value) => handleInsuredChange('state', value?.code || '')}
                disabled={!formData.insuredInfo.manualAddressEntry}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    required
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Zip Code"
                required
                disabled={!formData.insuredInfo.manualAddressEntry}
                value={formData.insuredInfo.zipCode}
                onChange={(e) => handleInsuredChange('zipCode', e.target.value)}
                inputProps={{ maxLength: 5, pattern: '[0-9]{5}' }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};