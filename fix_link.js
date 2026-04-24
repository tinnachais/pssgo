const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');

c = c.replace(/<Link \s*href=\{\`\/residents\/\$\{user.id\}\`\}\s*/g, '<Link href={`/liff-users/edit/${user.line_user_id}`}\n');

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', c);
console.log('Fixed link');
