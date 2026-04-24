const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');

c = c.replace(
    /mock_slots_car, mock_slots_motorcycle, mock_fee_car, mock_fee_motorcycle, mock_free_time_car, mock_free_time_motorcycle\)([\s\S]*?)\$18\)([\s\S]*?)mockFreeTimeMotorcycle \|\| null\n\s*]/g,
    `mock_slots_car, mock_slots_motorcycle, mock_fee_car, mock_fee_motorcycle, mock_free_time_car, mock_free_time_motorcycle)$1$18)$2mockFreeTimeMotorcycle || null\n      ]`
);

console.log("Check if addSite is correct, I'll use a better approach.");
