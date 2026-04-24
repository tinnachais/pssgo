const fs = require('fs'); 
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/liff.ts', 'utf8'); 

// Fix familyMembersQuery
c = c.replace(
    'SELECT id, owner_name, line_user_id, line_display_name, line_picture_url, is_active, created_at, invite_code FROM residents WHERE parent_id = $1 ORDER BY al.created_at DESC',
    'SELECT id, owner_name, line_user_id, line_display_name, line_picture_url, is_active, created_at, invite_code FROM residents WHERE parent_id = $1 ORDER BY created_at DESC'
);

// Fix SELECT action FROM access_logs
c = c.replace(
    'SELECT action FROM access_logs WHERE license_plate = $1 ORDER BY al.created_at DESC LIMIT 1',
    'SELECT action FROM access_logs WHERE license_plate = $1 ORDER BY created_at DESC LIMIT 1'
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/liff.ts', c);
