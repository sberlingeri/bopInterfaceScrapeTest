const fs = require('fs');
const path = require('path');

// Function to process files recursively
function processFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      processFiles(filePath);
    } else if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && !file.includes('node_modules')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Replace Grid item xs={value} with Grid size={value}
      content = content.replace(/<Grid\s+item\s+xs={(\d+)}/g, '<Grid size={$1}');
      
      // Replace Grid item xs={value} md={value} with Grid size={{ xs: value, md: value }}
      content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+md={(\d+)}/g, '<Grid size={{ xs: $1, md: $2 }}');
      
      // Replace Grid item xs={value} sm={value} with Grid size={{ xs: value, sm: value }}
      content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}/g, '<Grid size={{ xs: $1, sm: $2 }}');
      
      // Replace Grid item xs={value} sm={value} md={value} lg={value} with Grid size={{ xs: value, sm: value, md: value, lg: value }}
      content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+md={(\d+)}\s+lg={(\d+)}/g, 
        '<Grid size={{ xs: $1, sm: $2, md: $3, lg: $4 }}');
      
      // Remove standalone item prop
      content = content.replace(/<Grid\s+item\s+/g, '<Grid ');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  });
}

// Start processing from src directory
processFiles('./src');
console.log('Grid component migration complete!');