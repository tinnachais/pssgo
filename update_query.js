const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(
    /"SELECT DISTINCT ON \(r\.line_user_id\) r\.\*, s\.name as site_name,\\n" \+\s*"        \(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, 'is_active', v\.is_active\)\) FROM vehicles v WHERE v\.line_user_id = r\.line_user_id\) as user_vehicles,\\n" \+\s*"        \(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, 'is_active', v\.is_active, 'owner_name', COALESCE\(r2\.line_display_name, r2\.owner_name, 'ไม่มีข้อมูล'\)\)\)\\n" \+\s*"         FROM vehicle_shares vs \\n" \+\s*"         JOIN vehicles v ON vs\.vehicle_id = v\.id \\n" \+\s*"         LEFT JOIN residents r2 ON v\.line_user_id = r2\.line_user_id AND r2\.site_id IS NULL \\n" \+\s*"         WHERE vs\.line_user_id = r\.line_user_id\) as shared_vehicles"/g,
    `"SELECT DISTINCT ON (r.line_user_id) r.*, s.name as site_name,\\n" +
"        (SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active, 'type_name', vt.name)) FROM vehicles v LEFT JOIN vehicle_types vt ON v.type_id = vt.id WHERE v.line_user_id = r.line_user_id) as user_vehicles,\\n" +
"        (SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active, 'type_name', vt.name, 'owner_name', COALESCE(r2.line_display_name, r2.owner_name, 'ไม่มีข้อมูล')))\\n" +
"         FROM vehicle_shares vs \\n" +
"         JOIN vehicles v ON vs.vehicle_id = v.id \\n" +
"         LEFT JOIN vehicle_types vt ON v.type_id = vt.id \\n" +
"         LEFT JOIN residents r2 ON v.line_user_id = r2.line_user_id AND r2.site_id IS NULL \\n" +
"         WHERE vs.line_user_id = r.line_user_id) as shared_vehicles"`
);

// Wait, the original code in residents.ts uses template literals, not string concatenation.
c = c.replace(
    /\(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, \n?'is_active', v\.is_active\)\) FROM vehicles v WHERE v\.line_user_id = r\.line_user_id\) as user_vehicles,/g,
    `(SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active, 'type_name', vt.name)) FROM vehicles v LEFT JOIN vehicle_types vt ON v.type_id = vt.id WHERE v.line_user_id = r.line_user_id) as user_vehicles,`
);

c = c.replace(
    /\(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, \n?'is_active', v\.is_active, 'owner_name', COALESCE\(r2\.line_display_name, r2\.owner_name, 'ไม่มีข้อมูล'\)\)\)\n         FROM vehicle_shares vs \n         JOIN vehicles v ON vs\.vehicle_id = v\.id \n         LEFT JOIN residents r2 ON v\.line_user_id = r2\.line_user_id AND r2\.site_id IS NULL \n         WHERE vs\.line_user_id = r\.line_user_id\) as shared_vehicles/g,
    `(SELECT json_agg(json_build_object('id', v.id, 'license_plate', v.license_plate, 'province', v.province, 'is_active', v.is_active, 'type_name', vt.name, 'owner_name', COALESCE(r2.line_display_name, r2.owner_name, 'ไม่มีข้อมูล')))
         FROM vehicle_shares vs 
         JOIN vehicles v ON vs.vehicle_id = v.id 
         LEFT JOIN vehicle_types vt ON v.type_id = vt.id 
         LEFT JOIN residents r2 ON v.line_user_id = r2.line_user_id AND r2.site_id IS NULL 
         WHERE vs.line_user_id = r.line_user_id) as shared_vehicles`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('updated residents.ts');
