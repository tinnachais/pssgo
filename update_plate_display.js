const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');

c = c.replace(
    /<div className="transform origin-left scale-75 md:scale-90">\s*<LicensePlateDisplay licensePlate=\{v\.license_plate\} province=\{v\.province\} \/>\s*<\/div>/g,
    `<div className="transform origin-left scale-75 md:scale-90">
        <LicensePlateDisplay licensePlate={v.license_plate} province={v.province} />
    </div>
    {v.type_name && (
        <div className="text-[9px] text-zinc-500 text-center font-semibold mt-0.5 whitespace-nowrap">
            {v.type_name}
        </div>
    )}`
);

c = c.replace(
    /<div className="transform origin-left scale-75 md:scale-90 opacity-90">\s*<LicensePlateDisplay licensePlate=\{v\.license_plate\} province=\{v\.province\} \/>\s*<\/div>/g,
    `<div className="transform origin-left scale-75 md:scale-90 opacity-90">
        <LicensePlateDisplay licensePlate={v.license_plate} province={v.province} />
    </div>
    {v.type_name && (
        <div className="text-[9px] text-zinc-500 text-center font-semibold mt-0.5 whitespace-nowrap">
            {v.type_name}
        </div>
    )}`
);

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', c);
console.log('updated liff-users/page.tsx');
