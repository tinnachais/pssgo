const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8'); 

c = c.replace(
    /await query\(`\s*INSERT INTO access_logs \(license_plate, house_number, action, type, gate_name\)\s*VALUES \(\$1, \$2, \$3, 'RESIDENT', 'Gate 1 \(Manual Test\)'\)\s*`, \[licensePlate, houseNumber, action\]\);/,
    `const siteQuery = await query("SELECT site_id FROM residents WHERE house_number = $1 AND site_id IS NOT NULL LIMIT 1", [houseNumber]);
    const siteId = siteQuery.rows[0]?.site_id || null;

    await query(\`
      INSERT INTO access_logs (license_plate, house_number, action, type, gate_name, site_id)
      VALUES ($1, $2, $3, 'RESIDENT', 'Gate 1 (Manual Test)', $4)
    \`, [licensePlate, houseNumber, action, siteId]);`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
