const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');

c = c.replace(
    /enable_visitor_id_exchange = \$11,\s*api_token = COALESCE\(api_token, \$12\)\s*WHERE id = \$13/,
    `enable_visitor_id_exchange = $11,
      api_token = COALESCE(api_token, $12),
      mock_slots_car = $13,
      mock_slots_motorcycle = $14,
      mock_fee_car = $15,
      mock_fee_motorcycle = $16,
      mock_free_time_car = $17,
      mock_free_time_motorcycle = $18
     WHERE id = $19`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', c);
console.log('Fixed updateSite query');
