const fs = require('fs');

const newOptions = `<option value="TIER1_PRIVATE">Tier 1 ส่วนตัว (PSS GO)</option>
                            <option value="TIER2_PUBLIC_CITY">Tier 2 สาธารณะ (City Parking)</option>
                            <option value="TIER3_PUBLIC_PSS">Tier 3 สาธารณะ (PSS)</option>
                            <option value="TIER4_PUBLIC_OTHERS">Tier 4 สาธารณะ (Others)</option>`;

function fixTiers(filePath) { 
    let c = fs.readFileSync(filePath, 'utf8'); 
    
    // First, remove MOCK_PUBLIC if it exists
    c = c.replace(/<option value="MOCK_PUBLIC">[\s\S]*?<\/option>/g, "");

    // Now replace PRIVATE and PUBLIC with the 4 Tiers
    c = c.replace(/<option value="PRIVATE">[\s\S]*?<\/option>\s*<option value="PUBLIC">[\s\S]*?<\/option>/g, newOptions); 
    
    fs.writeFileSync(filePath, c); 
} 

fixTiers('c:/Toon/pssgo/app/sites/add/page.tsx'); 
fixTiers('c:/Toon/pssgo/app/sites/[id]/page.tsx'); 
console.log('Fixed Tiers dropdown');
