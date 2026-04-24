const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');

c = c.replace(
    /"INSERT INTO sites \(name, address, provider_id, max_vehicles, lat, lng, contact_link, package_id, api_token, type, enable_appointments, enable_visitor_id_exchange\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12\) RETURNING id"/g,
    `"INSERT INTO sites (name, address, provider_id, max_vehicles, lat, lng, contact_link, package_id, api_token, type, enable_appointments, enable_visitor_id_exchange, mock_parking_fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id"`
);

c = c.replace(
    /type \|\| 'PRIVATE',\n\s*enableAppointments,\n\s*enableVisitorIdExchange\n\s*\]/g,
    `type || 'PRIVATE',
        enableAppointments,
        enableVisitorIdExchange,
        mockParkingFee || null
      ]`
);

c = c.replace(
    /type = \$9,\n\s*enable_appointments = \$10,\n\s*enable_visitor_id_exchange = \$11,\n\s*api_token = COALESCE\(api_token, \$12\)\n\s*WHERE id = \$13/g,
    `type = $9,
        enable_appointments = $10,
        enable_visitor_id_exchange = $11,
        api_token = COALESCE(api_token, $12),
        mock_parking_fee = $13
      WHERE id = $14`
);

c = c.replace(
    /type \|\| 'PRIVATE',\n\s*enableAppointments,\n\s*enableVisitorIdExchange,\n\s*fallbackToken,\n\s*id\n\s*\]/g,
    `type || 'PRIVATE',
        enableAppointments,
        enableVisitorIdExchange,
        fallbackToken,
        mockParkingFee || null,
        id
      ]`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', c);
console.log('Fixed actions');
