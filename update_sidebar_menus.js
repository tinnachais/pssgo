const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');

// Replace the residents menu block
c = c.replace(
    /\{ name: "ผู้เช่า\/ร้าน\/บริษัท", href: "\/residents" \},\s*\{ name: "ข้อมูลลูกบ้าน \(LIFF\)", href: "\/liff-users-private" \},\s*\{ name: "ข้อมูลผู้ใช้บริการ \(LIFF\)", href: "\/liff-users-public" \},/,
    `{ name: "ลูกบ้าน/ผู้เช่า", href: "/residents" },
        { name: "ผู้ใช้บริการ", href: "/public-users" },
        { name: "ข้อมูลผู้ใช้งานตั้งต้น (LIFF)", href: "/liff-users" },`
);

fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', c);
console.log('Fixed Sidebar');
