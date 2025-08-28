const fs = require('fs');
const path = require('path');

// Function to fix Grid components in a file
function fixGridInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix patterns like <Grid size={12} md={3}>
  content = content.replace(/<Grid size={(\d+)} md={(\d+)}>/g, '<Grid size={{ xs: $1, md: $2 }}>');
  
  // Fix patterns like <Grid size={12} md={6}>
  // Already covered by the above
  
  // Fix patterns like <Grid size={12}>
  content = content.replace(/<Grid size={(\d+)}>/g, '<Grid size={$1}>');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Fix all form files
const files = [
  './src/components/forms/LocationForm.tsx',
  './src/components/forms/PolicyInfoForm.tsx',
  './src/components/forms/RatingInfoForm.tsx',
  './src/components/forms/SummaryForm.tsx'
];

files.forEach(file => {
  fixGridInFile(file);
});

console.log('Grid v7 migration complete!');