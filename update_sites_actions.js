const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');

c = c.replace(
    /await query\('ALTER TABLE sites ADD COLUMN IF NOT EXISTS enable_visitor_id_exchange BOOLEAN DEFAULT TRUE'\);/g,
    `await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS enable_visitor_id_exchange BOOLEAN DEFAULT TRUE');
    await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS mock_parking_fee VARCHAR(255)');`
);

// We need to add mockParkingFee to addSite
c = c.replace(
    /const enableVisitorIdExchange = formData\.get\("enableVisitorIdExchange"\) === "on";\n\s*await query\('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lat DECIMAL\(10, 8\)'\);/,
    `const enableVisitorIdExchange = formData.get("enableVisitorIdExchange") === "on";
  const mockParkingFee = formData.get("mockParkingFee") as string;
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8)');`
);

c = c.replace(
    /package_id, type, enable_appointments, enable_visitor_id_exchange, api_token\)\n\s*VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13\) RETURNING id/g,
    `package_id, type, enable_appointments, enable_visitor_id_exchange, api_token, mock_parking_fee)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`
);

c = c.replace(
    /type \|\| 'PRIVATE',\n\s*enableAppointments,\n\s*enableVisitorIdExchange,\n\s*apiToken\n\s*\]\);/g,
    `type || 'PRIVATE',
      enableAppointments,
      enableVisitorIdExchange,
      apiToken,
      mockParkingFee || null
    ]);`
);

// Now for editSite
c = c.replace(
    /const enableVisitorIdExchange = formData\.get\("enableVisitorIdExchange"\) === "on";\n\s*await query\('ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR\(255\)'\);/,
    `const enableVisitorIdExchange = formData.get("enableVisitorIdExchange") === "on";
  const mockParkingFee = formData.get("mockParkingFee") as string;
  await query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS contact_link VARCHAR(255)');`
);

c = c.replace(
    /enable_visitor_id_exchange = \$11,\n\s*api_token = COALESCE\(api_token, \$12\)\n\s*WHERE id = \$13/g,
    `enable_visitor_id_exchange = $11,
      api_token = COALESCE(api_token, $12),
      mock_parking_fee = $13
    WHERE id = $14`
);

c = c.replace(
    /enableAppointments,\n\s*enableVisitorIdExchange,\n\s*fallbackToken,\n\s*id\n\s*\]\);/g,
    `enableAppointments,
      enableVisitorIdExchange,
      fallbackToken,
      mockParkingFee || null,
      id
    ]);`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', c);
console.log('Updated sites.ts');
