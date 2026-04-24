const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/liff/page.tsx', 'utf8'); 
c = c.replace('const logs = await getResidentAccessLogs(profileData.resident.house_number);', 'const logs = await getResidentAccessLogs(profileData.resident.house_number, profile?.userId || "");'); 
fs.writeFileSync('c:/Toon/pssgo/app/liff/page.tsx', c);
