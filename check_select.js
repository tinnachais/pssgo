const fs = require('fs');
const lines = fs.readFileSync('c:/Toon/pssgo/app/sites/[id]/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('<select') && lines.slice(i, i+15).join(' ').includes('value="PUBLIC"')) {
        console.log(lines.slice(i-2, i+10).join('\n'));
    }
});
