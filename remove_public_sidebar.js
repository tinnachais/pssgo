const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');

// Remove public-users menu
c = c.replace(/\s*\{ name: "ผู้ใช้บริการ", href: "\/public-users" \},/, "");

fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', c);
console.log('Removed public-users from Sidebar');
