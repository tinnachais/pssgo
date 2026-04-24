const fs = require('fs');
let actions = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');
actions = actions.replace(/type \|\| 'PRIVATE'/g, "type || 'TIER1_PRIVATE'");
actions = actions.replace(/DEFAULT 'PRIVATE'/g, "DEFAULT 'TIER1_PRIVATE'");
fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', actions);
console.log('Updated default type in actions');
