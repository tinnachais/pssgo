const fs = require('fs');

function makeCompact(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');
    
    // Reduce padding
    c = c.replace(/px-6 py-4/g, 'px-4 py-2.5');
    c = c.replace(/px-5 py-4/g, 'px-4 py-2.5');
    c = c.replace(/px-4 py-4/g, 'px-4 py-2.5');
    c = c.replace(/px-6 py-5/g, 'px-4 py-3');
    
    // Reduce image sizes in tables
    c = c.replace(/w-10 h-10/g, 'w-8 h-8');
    c = c.replace(/w-12 h-12/g, 'w-8 h-8');
    
    // Reduce plate scale
    c = c.replace(/scale-75 md:scale-90/g, 'scale-[0.65] md:scale-75');
    c = c.replace(/scale-90/g, 'scale-75');
    
    // Reduce gap in tables
    c = c.replace(/space-y-2/g, 'space-y-1');
    
    fs.writeFileSync(filePath, c);
}

makeCompact('c:/Toon/pssgo/app/liff-users/page.tsx');
makeCompact('c:/Toon/pssgo/app/vehicles/page.tsx');

console.log('Made tables compact');
