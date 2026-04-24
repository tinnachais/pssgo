const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(/export async function getResidents\(\) \{/, "export async function getResidents(type?: string) {");

c = c.replace(
    /let queryStr = `\s*SELECT \* FROM \(\s*SELECT DISTINCT ON \(r\.line_user_id\) r\.\*, s\.name as site_name,\s*\(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, 'is_active', v\.is_active\)\) FROM vehicles v WHERE v\.resident_id = r\.id\) as user_vehicles\s*FROM residents r \s*LEFT JOIN sites s ON r\.site_id = s\.id\s*WHERE 1=1\s*`;/,
    `let queryStr = \`
      SELECT r.*, s.name as site_name,
      (SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active)) FROM vehicles v WHERE v.resident_id = r.id) as user_vehicles
      FROM residents r 
      LEFT JOIN sites s ON r.site_id = s.id
      WHERE 1=1
  \`;`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Fixed getResidents');
