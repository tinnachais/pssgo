const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/public-users/page.tsx', 'utf8');

c = c.replace(/export default async function ResidentsPage\(\) \{/, "export default async function PublicUsersPage() {");
c = c.replace(/residents = await getResidents\(\);/, "residents = await getResidents('public');");
c = c.replace(/ผู้เช่า\/ร้าน\/บริษัท/g, "ผู้ใช้บริการ");
c = c.replace(/จัดการบ้าน\/ห้อง\/บริษัท\/รถ/g, "จัดการผู้ใช้บริการสถานที่สาธารณะ");
c = c.replace(/<span className="bg-blue-100 text-blue-600 dark:bg-blue-500\/10 dark:text-blue-400 p-2.5 rounded-2xl">/, `<span className="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 p-2.5 rounded-2xl">`);

fs.writeFileSync('c:/Toon/pssgo/app/public-users/page.tsx', c);

let r = fs.readFileSync('c:/Toon/pssgo/app/residents/page.tsx', 'utf8');
r = r.replace(/residents = await getResidents\(\);/, "residents = await getResidents('private');");
r = r.replace(/ผู้เช่า\/ร้าน\/บริษัท/g, "ลูกบ้าน/ผู้เช่า");
fs.writeFileSync('c:/Toon/pssgo/app/residents/page.tsx', r);

console.log('Fixed public users and residents pages');
