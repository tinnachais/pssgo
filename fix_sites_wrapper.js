const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/sites/page.tsx', 'utf8');
c = c.replace(/<main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">/g, '<main className="w-full px-4 sm:px-6 lg:px-8 py-10">');
fs.writeFileSync('c:/Toon/pssgo/app/sites/page.tsx', c);
console.log('Fixed sites wrapper');
