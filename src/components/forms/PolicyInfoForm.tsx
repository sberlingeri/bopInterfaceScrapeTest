import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  InputAdornment,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormContext } from '../../contexts/FormContext';
import {
  PAYROLL_DAYS,
  DISHONESTY_LIMITS,
  FRAUD_LIMITS,
  LIABILITY_LIMITS,
  AGGREGATE_LIMITS,
  COVERAGE_OPTIONS,
} from '../../types';

export const PolicyInfoForm: React.FC = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (field: string, value: any) => {
    updateFormData('policyInfo', { [field]: value });
  };

  const handleCoverageToggle = (coverage: string) => {
    const currentSelections = formData.policyInfo.coverageSelections;
    const newSelections = currentSelections.includes(coverage)
      ? currentSelections.filter(c => c !== coverage)
      : [...currentSelections, coverage];
    handleChange('coverageSelections', newSelections);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Business Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Date Business Started"
                value={formData.policyInfo.dateBusinessStarted}
                onChange={(date) => handleChange('dateBusinessStarted', date)}
                maxDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Ordinary Payroll Number of Days"
                required
                value={formData.policyInfo.ordinaryPayrollDays}
                onChange={(e) => handleChange('ordinaryPayrollDays', e.target.value)}
              >
                {PAYROLL_DAYS.map((days) => (
                  <MenuItem key={days} value={days}>
                    {days} days
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Business Description"
                required
                value={formData.policyInfo.businessDescription}
                onChange={(e) => handleChange('businessDescription', e.target.value)}
                helperText="Describe your business activities"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Coverage Limits
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Employee Dishonesty Limit"
                required
                value={formData.policyInfo.employeeDishonestlyLimit}
                onChange={(e) => handleChange('employeeDishonestlyLimit', e.target.value)}
              >
                {DISHONESTY_LIMITS.map((limit) => (
                  <MenuItem key={limit} value={limit}>
                    {limit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Computer Fraud Funds Transfer Fraud Limit"
                required
                value={formData.policyInfo.computerFraudLimit}
                onChange={(e) => handleChange('computerFraudLimit', e.target.value)}
              >
                {FRAUD_LIMITS.map((limit) => (
                  <MenuItem key={limit} value={limit}>
                    {limit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Medical Expenses Limit</FormLabel>
                <RadioGroup
                  row
                  value={formData.policyInfo.medicalExpensesLimit}
                  onChange={(e) => handleChange('medicalExpensesLimit', e.target.value)}
                >
                  <FormControlLabel value="$5,000" control={<Radio />} label="$5,000" />
                  <FormControlLabel value="$10,000" control={<Radio />} label="$10,000" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Years of Loss History</FormLabel>
                <RadioGroup
                  row
                  value={formData.policyInfo.yearsOfLossHistory}
                  onChange={(e) => handleChange('yearsOfLossHistory', e.target.value)}
                >
                  <FormControlLabel value="No history" control={<Radio />} label="No history" />
                  <FormControlLabel value="1 year" control={<Radio />} label="1 year" />
                  <FormControlLabel value="2 years" control={<Radio />} label="2 years" />
                  <FormControlLabel value="3 years" control={<Radio />} label="3 years" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formData.policyInfo.yearsOfLossHistory !== 'No history' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="History Incurred Losses"
                  value={formData.policyInfo.historyIncurredLosses}
                  onChange={(e) => handleChange('historyIncurredLosses', parseInt(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Liability Limits
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Liability Limit Per Occurrence</FormLabel>
                <RadioGroup
                  value={formData.policyInfo.liabilityLimitPerOccurrence}
                  onChange={(e) => handleChange('liabilityLimitPerOccurrence', e.target.value)}
                >
                  {LIABILITY_LIMITS.map((limit) => (
                    <FormControlLabel key={limit} value={limit} control={<Radio />} label={limit} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Products/Completed Operations Aggregate Limit</FormLabel>
                <RadioGroup
                  value={formData.policyInfo.productsOperationsLimit}
                  onChange={(e) => handleChange('productsOperationsLimit', e.target.value)}
                >
                  {AGGREGATE_LIMITS.map((limit) => (
                    <FormControlLabel key={limit} value={limit} control={<Radio />} label={limit} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.policyInfo.acceptTerrorismCoverage}
                    onChange={(e) => handleChange('acceptTerrorismCoverage', e.target.checked)}
                  />
                }
                label="Accept Certified Acts Terrorism Coverage"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Coverage Selection
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            {COVERAGE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                onClick={() => handleCoverageToggle(option)}
                color={formData.policyInfo.coverageSelections.includes(option) ? 'primary' : 'default'}
                variant={formData.policyInfo.coverageSelections.includes(option) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hired Auto and Non-Owned Auto
          </Typography>
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.policyInfo.hiredAutoEnabled}
                    onChange={(e) => handleChange('hiredAutoEnabled', e.target.checked)}
                  />
                }
                label="Hired Auto and Non-Owned Auto Coverage"
              />
            </Grid>
            {formData.policyInfo.hiredAutoEnabled && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Number of Employees"
                    value={formData.policyInfo.numberOfEmployees || ''}
                    onChange={(e) => handleChange('numberOfEmployees', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Hired Auto Liability Coverage</FormLabel>
                    <RadioGroup
                      row
                      value={formData.policyInfo.hiredAutoLiability || 'No'}
                      onChange={(e) => handleChange('hiredAutoLiability', e.target.value)}
                    >
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Non-owned Auto (with Delivery Service)</FormLabel>
                    <RadioGroup
                      row
                      value={formData.policyInfo.nonOwnedAutoWithDelivery || 'No'}
                      onChange={(e) => handleChange('nonOwnedAutoWithDelivery', e.target.value)}
                    >
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Non-owned Auto (without Delivery Service)</FormLabel>
                    <RadioGroup
                      row
                      value={formData.policyInfo.nonOwnedAutoWithoutDelivery || 'No'}
                      onChange={(e) => handleChange('nonOwnedAutoWithoutDelivery', e.target.value)}
                    >
                      <FormControlLabel value="No" control={<Radio />} label="No" />
                      <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};