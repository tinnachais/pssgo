const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');

const liffMenuItem = `    { 
      id: "liff-users",
      name: "ผู้ใช้บริการ", 
      href: "/liff-users", 
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
    },\n`;

// Only insert if it's not already there
if (!c.includes('id: "liff-users"')) {
    c = c.replace(/const allLinks = \[(?:\r?\n)/, "const allLinks = [\n" + liffMenuItem);
    fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', c);
    console.log('Fixed insertion');
} else {
    console.log('Already inserted');
}
