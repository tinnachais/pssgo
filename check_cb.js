const fs = require('fs');
console.log('add:', fs.readFileSync('c:/Toon/pssgo/app/sites/add/page.tsx', 'utf8').includes('name="enableAppointments"'));
console.log('edit:', fs.readFileSync('c:/Toon/pssgo/app/sites/[id]/page.tsx', 'utf8').includes('name="enableAppointments"'));
