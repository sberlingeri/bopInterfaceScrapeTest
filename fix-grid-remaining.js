const fs = require('fs');

// Fix LocationForm.tsx
const filePath = './src/components/forms/LocationForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Grid size={12} md={3} with Grid size={{ xs: 12, md: 3 }}
content = content.replace(/<Grid size={12} md={3}>/g, '<Grid size={{ xs: 12, md: 3 }}>');
content = content.replace(/<Grid size={12} md={6}>/g, '<Grid size={{ xs: 12, md: 6 }}>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed remaining Grid components in LocationForm.tsx');