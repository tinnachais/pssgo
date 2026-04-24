const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8');
c = c.replace(/type = 'PUBLIC'/g, "type LIKE '%PUBLIC%'");
fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
console.log('Fixed liff.ts');
