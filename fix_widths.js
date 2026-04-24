const fs = require('fs');

function replaceWidth(file) {
    if (!fs.existsSync(file)) return;
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/className="max-w-7xl mx-auto/g, 'className="w-full');
    fs.writeFileSync(file, c);
}

replaceWidth('c:/Toon/pssgo/app/liff-users/page.tsx');
replaceWidth('c:/Toon/pssgo/app/residents/page.tsx');

console.log('Fixed widths for liff-users and residents');
