const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(
    /let queryStr = `\n\s*SELECT r\.\*, s\.name as site_name,/g,
    `let queryStr = \`\n      SELECT * FROM (\n      SELECT DISTINCT ON (r.line_user_id) r.*, s.name as site_name,`
);

c = c.replace(
    /queryStr \+= ` ORDER BY r\.created_at DESC`;/g,
    `queryStr += \` ORDER BY r.line_user_id, r.created_at DESC\n      ) as unique_users ORDER BY created_at DESC\`;`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Fixed distinct query');
