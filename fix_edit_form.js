const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/edit/[id]/EditPlatformUserForm.tsx', 'utf8');

c = c.replace(/alert\("บันทึกข้อมูลเรียบร้อยแล้ว"\);\n\s*router.push\("\/liff-users"\);/, 'alert("บันทึกข้อมูลเรียบร้อยแล้ว");\n            router.refresh();\n            router.push("/liff-users");');

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/edit/[id]/EditPlatformUserForm.tsx', c);
console.log('Fixed EditPlatformUserForm');
