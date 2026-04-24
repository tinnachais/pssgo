const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/vehicles/page.tsx', 'utf8');

if (!c.includes('import LicensePlateDisplay')) {
    c = c.replace('import Link from "next/link";', 'import Link from "next/link";\nimport LicensePlateDisplay from "@/app/components/LicensePlateDisplay";');
}

c = c.replace(
    /<div className="inline-flex flex-col border border-zinc-300 \n?dark:border-zinc-600 rounded pt-1\.5 pb-1\.5 px-3 bg-white dark:bg-zinc-800 shadow-sm relative overflow-hidden \n?min-w-\[100px\] text-center">\s*<div className="absolute top-0 inset-x-0 h-1 bg-rose-500"><\/div>\s*<span className="font-bold text-sm tracking-widest text-zinc-900 \n?dark:text-white uppercase leading-none mt-1">\{v\.license_plate\}<\/span>\s*<span className="text-\[9px\] text-zinc-500 dark:text-zinc-400 mt-1 pb-0\.5 \n?border-t border-zinc-100 dark:border-zinc-700\/50 leading-tight block w-full text-center">\s*\{v\.province \|\| '.*?'\}\s*<\/span>\s*<\/div>/g,
    `<div className="transform origin-left scale-90">
                                              <LicensePlateDisplay licensePlate={v.license_plate} province={v.province} />
                                          </div>`
);

fs.writeFileSync('c:/Toon/pssgo/app/vehicles/page.tsx', c);
console.log('Fixed vehicles page plates');
