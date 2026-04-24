const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/sites/page.tsx', 'utf8');

// 1. Add import
if (!c.includes('import ExcelImportSites')) {
    const lastImportIndex = c.lastIndexOf('import ');
    const endOfLine = c.indexOf('\\n', lastImportIndex);
    c = c.substring(0, endOfLine + 1) + 'import ExcelImportSites from "./ExcelImportSites";\\n' + c.substring(endOfLine + 1);
}

// 2. Inject next to "เพิ่มสถานที่"
const targetStr = '<Link href="/sites/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">';

if (c.includes(targetStr)) {
    c = c.replace(targetStr, '<div className="flex gap-2 items-center flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">\\n            <ExcelImportSites />\\n            ' + targetStr);
    
    // also we need to close the div AFTER the Link closes
    // Find the end of the Link: </Link>
    const linkEndIndex = c.indexOf('</Link>', c.indexOf(targetStr));
    c = c.substring(0, linkEndIndex + 7) + '\\n          </div>' + c.substring(linkEndIndex + 7);
}

fs.writeFileSync('c:/Toon/pssgo/app/sites/page.tsx', c);
console.log('Injected ExcelImportSites');
