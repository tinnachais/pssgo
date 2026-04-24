const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/liff/page.tsx', 'utf8'); 

c = c.replace(
    /<div className="text-xs text-slate-500">\{log\.gate_name \|\| [^}]+\}<\/div>/,
    `<div className="text-xs text-slate-500 line-clamp-1">{log.site_name ? \`\${log.site_name} \` : ''}{log.gate_name && log.site_name ? '• ' : ''}{log.gate_name || 'เข้า/ออกแบบแมนนวล'}</div>`
);

fs.writeFileSync('c:/Toon/pssgo/app/liff/page.tsx', c);
