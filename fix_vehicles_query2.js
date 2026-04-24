const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

c = c.replace(
    /const vehiclesQuery = await query\([\s\S]*?GROUP BY v\.id[^\`]*\`,\s*\[resident\.house_number, resident\.line_user_id\]\);/,
`const vehiclesQuery = await query(\`
            SELECT v.*, r.line_display_name, r.line_picture_url, r.owner_name, vt.name as type_name 
            FROM vehicles v 
            LEFT JOIN resident_vehicles rv ON v.id = rv.vehicle_id
            LEFT JOIN residents r ON rv.resident_id = r.id 
            LEFT JOIN vehicle_types vt ON v.type_id = vt.id
            LEFT JOIN vehicle_shares vs ON v.id = vs.vehicle_id
            WHERE rv.resident_id = $1 
               OR vs.line_user_id = $2
            GROUP BY v.id, r.line_display_name, r.line_picture_url, r.owner_name, vt.name
            ORDER BY MAX(v.created_at) DESC
        \`, [resident.id, resident.line_user_id]);`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
