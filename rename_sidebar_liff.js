const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');

c = c.replace(/\{ name: "ข้อมูลผู้ใช้งานตั้งต้น \(LIFF\)", href: "\/liff-users" \}/, '{ name: "ผู้ใช้บริการ", href: "/liff-users" }');

fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', c);
console.log('Renamed liff-users in Sidebar');
