const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

c = c.replace(
    /\} else \{\s*siteLimitQuery = await query\(`SELECT max_vehicles, max_residents FROM sites LIMIT 1`\);\s*\}/g,
    `} else { siteLimitQuery = { rows: [{ max_vehicles: 5, max_residents: 5 }] }; }`
);

c = c.replace(
    /\} else \{\s*siteLimitQuery = await query\(`SELECT max_vehicles FROM sites LIMIT 1`\);\s*\}/g,
    `} else { siteLimitQuery = { rows: [{ max_vehicles: 5 }] }; }`
);

c = c.replace(
    /\} else \{\s*limitQuery = await query\(`SELECT max_vehicles FROM sites LIMIT 1`\);\s*\}/g,
    `} else { limitQuery = { rows: [{ max_vehicles: 5 }] }; }`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
