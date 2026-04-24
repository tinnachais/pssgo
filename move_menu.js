const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'components', 'Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove from sites children
const targetToRemove = '{ name: "ผู้ใช้บริการ", href: "/liff-users" },';
if (content.includes(targetToRemove)) {
    content = content.replace(targetToRemove, '');
    console.log("Removed from sites children.");
} else {
    // maybe it has spaces or something else
    const altTarget = '{ name: "ผู้ใช้แพลตฟอร์ม", href: "/liff-users" },';
    if (content.includes(altTarget)) {
        content = content.replace(altTarget, '');
        console.log("Removed from sites children (alt).");
    } else {
        console.log("Could not find liff-users in sites children.");
    }
}

// remove trailing empty spaces and newlines if it left an empty line
content = content.replace(/^[ \t]*\n/gm, '');

// 2. Add to top level items
const usersItemStr = `{ 
      id: "users",
      name: "ผู้ใช้งานระบบ",`;

const liffUsersItem = `{ 
      id: "liff-users",
      name: "ผู้ใช้แพลตฟอร์ม", 
      href: "/liff-users", 
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
    },
    `;

if (content.includes(usersItemStr) && !content.includes('id: "liff-users"')) {
    content = content.replace(usersItemStr, liffUsersItem + usersItemStr);
    console.log("Added liff-users to top level items.");
} else if (content.includes('id: "liff-users"')) {
    console.log("liff-users is already at the top level.");
} else {
    console.log("Could not find 'users' item to insert before.");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Sidebar.tsx updated.");
