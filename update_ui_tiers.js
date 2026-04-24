const fs = require('fs');

const oldOptionsRegex = /<option value="PRIVATE">.*?<\/option>\s*<option value="PUBLIC">.*?<\/option>\s*<option value="MOCK_PUBLIC">.*?<\/option>/g;
const newOptions = `<option value="TIER1_PRIVATE">Tier 1 ส่วนตัว (PSS GO)</option>
                        <option value="TIER2_PUBLIC_CITY">Tier 2 สาธารณะ (City Parking)</option>
                        <option value="TIER3_PUBLIC_PSS">Tier 3 สาธารณะ (PSS)</option>
                        <option value="TIER4_PUBLIC_OTHERS">Tier 4 สาธารณะ (Others)</option>`;

function updateOptions(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');
    c = c.replace(oldOptionsRegex, newOptions);
    fs.writeFileSync(filePath, c);
    console.log("Updated options in", filePath);
}

updateOptions('c:/Toon/pssgo/app/sites/add/page.tsx');
updateOptions('c:/Toon/pssgo/app/sites/[id]/page.tsx');

// Update default value in actions/sites.ts
let actions = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');
actions = actions.replace(/type \|\| 'PRIVATE'/g, "type || 'TIER1_PRIVATE'");
actions = actions.replace(/DEFAULT 'PRIVATE'/g, "DEFAULT 'TIER1_PRIVATE'");
fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', actions);
console.log("Updated default type in actions");

// Update SiteTypeLogic.tsx
let logic = fs.readFileSync('c:/Toon/pssgo/app/sites/SiteTypeLogic.tsx', 'utf8');
logic = logic.replace(/typeSelect\.value === 'MOCK_PUBLIC'/g, "typeSelect.value === 'TIER4_PUBLIC_OTHERS'");
fs.writeFileSync('c:/Toon/pssgo/app/sites/SiteTypeLogic.tsx', logic);
console.log("Updated SiteTypeLogic");
