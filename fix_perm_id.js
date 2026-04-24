const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', 'utf8');

// Change id from "liff-users" to "sites" so it inherits permission from the Sites module
c = c.replace(/id: "liff-users",/, 'id: "sites", // Shares permission with sites');

fs.writeFileSync('c:/Toon/pssgo/app/components/Sidebar.tsx', c);
console.log('Fixed liff-users permission ID');
