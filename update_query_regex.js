const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

c = c.replace(
    /SELECT \* FROM access_logs\s+WHERE house_number = \$1\s+OR al\.license_plate IN \([\s\S]*?ORDER BY created_at DESC\s+LIMIT 50/g,
`SELECT al.*, s.name as site_name FROM access_logs al
            LEFT JOIN sites s ON al.site_id = s.id
            WHERE al.house_number = $1 
               OR al.license_plate IN (
                   SELECT license_plate FROM vehicles WHERE house_number = $1
                   \${lineUserId ? "UNION SELECT v.license_plate FROM vehicles v JOIN vehicle_shares vs ON v.id = vs.vehicle_id WHERE vs.line_user_id = $2" : ""}
               )
            ORDER BY al.created_at DESC 
            LIMIT 50`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
