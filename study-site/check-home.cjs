const fs = require('fs');
const content = fs.readFileSync('js/pages/home.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('`') && line.includes('router.generateUrl')) {
    console.log('Line ' + (i+1) + ': ' + line.trim().substring(0, 150));
  }
});