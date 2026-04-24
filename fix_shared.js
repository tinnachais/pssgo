const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(
    /(SELECT json_agg\(json_build_object\('id', v\.id, 'license_plate', v\.license_plate, 'province', v\.province, 'is_active', v\.is_active, 'owner_name', COALESCE\(r2\.line_display_name, r2\.owner_name, 'ไม่ระบุ'\)\)\) \s*FROM vehicle_shares vs \s*JOIN vehicles v ON vs\.vehicle_id = v\.id \s*)LEFT JOIN residents r2 ON v\.line_user_id = r2\.line_user_id AND r2\.site_id IS NULL \s*WHERE vs\.line_user_id = r\.line_user_id\) as shared_vehicles/g,
    `$1LEFT JOIN vehicle_types vt ON v.type_id = vt.id
       LEFT JOIN residents r2 ON v.line_user_id = r2.line_user_id AND r2.site_id IS NULL 
       WHERE vs.line_user_id = r.line_user_id) as shared_vehicles`
);

c = c.replace(
    /'province', v\.province, 'is_active', v\.is_active, 'owner_name', COALESCE\(r2\.line_display_name, r2\.owner_name, 'ไม่ระบุ'\)\)\)/g,
    `'province', v.province, 'is_active', v.is_active, 'type_name', vt.name, 'owner_name', COALESCE(r2.line_display_name, r2.owner_name, 'ไม่ระบุ')))`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Fixed shared_vehicles');
