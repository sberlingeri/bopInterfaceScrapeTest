# Page 1: Filled Form Data

## Form Fields Filled:

### Rating Information
- **Email**: test@example.com  
- **Effective Date**: 9/26/2025

### Insured Information
- **Entity Type**: LLC
- **Company Name**: Test Company LLC
- **Mailing Address** (via Google Maps lookup): 100 Main Street, White Plains, New York
  - **Street Number**: 100
  - **Street Name**: Main Street
  - **City**: White Plains
  - **Zip Code**: 10601
  - **State**: (Unable to select due to dropdown issue - should be NY)

## Issues Encountered:
- State dropdown appears to have a data loading issue ("No data to display")
- Network errors visible in console (connection refused to localhost:58479)
- This appears to be a development environment with some backend services not fully configured

## UI Elements:
- Step indicator showing "1" at the top
- "Next" button to proceed to the next page
- "Can't find address? Enter manually" checkbox (checked to enable manual address entry)
- Google Maps integration for address lookup (functional)