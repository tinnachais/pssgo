const fs = require('fs');

// 1. Update Sidebar.tsx
let sidebar = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/name: "ผู้ใช้บริการ",\s*href: "\/liff-users",/g, 'name: "ผู้ใช้แพลตฟอร์ม",\n      href: "/liff-users",');
fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', sidebar);

// 2. Update page.tsx
let page = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');
page = page.replace(/ผู้ใช้บริการ \(LINE LIFF\)/g, 'ผู้ใช้แพลตฟอร์ม (LINE LIFF)');
page = page.replace(/ไม่พบข้อมูลผู้ใช้บริการ/g, 'ไม่พบข้อมูลผู้ใช้แพลตฟอร์ม');
fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', page);

console.log('Renamed to Platform Users');
