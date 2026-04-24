const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/sites.ts', 'utf8');

c = c.replace(
    /const type = formData\.get\("type"\) as string;/g,
    `const type = formData.get("type") as string;
    const mockParkingFee = formData.get("mockParkingFee") as string;`
);

fs.writeFileSync('c:/Toon/pssgo/app/actions/sites.ts', c);
console.log('Fixed type declaration in sites.ts');
