const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/liff/page.tsx', 'utf8'); 

c = c.replace(
    `{log.gate_name || 'ไม่ระบุ'}`,
    `{log.site_name ? \`\${log.site_name} \` : ''}{log.gate_name && log.site_name ? '• ' : ''}{log.gate_name || 'เข้า/ออกแบบแมนนวล'}`
);

fs.writeFileSync('c:/Toon/pssgo/app/liff/page.tsx', c);
