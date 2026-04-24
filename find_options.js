const fs = require('fs');
const c = fs.readFileSync('C:\\Toon\\pssgo\\app\\sites\\[id]\\page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((line, i) => {
    if (line.includes('<option')) {
        console.log(`${i+1}: ${line.trim()}`);
    }
});
