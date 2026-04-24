const fs = require('fs');

function replaceScript(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');
    const startIdx = c.indexOf('<script dangerouslySetInnerHTML');
    if (startIdx !== -1) {
        const endIdx = c.indexOf('</script>', startIdx) + 9;
        c = c.substring(0, startIdx) + '<SiteTypeLogic />' + c.substring(endIdx);
        
        if (!c.includes('import SiteTypeLogic')) {
            const lastImportIndex = c.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLine = c.indexOf('\n', lastImportIndex);
                c = c.substring(0, endOfLine + 1) + 'import SiteTypeLogic from "@/app/sites/SiteTypeLogic";\n' + c.substring(endOfLine + 1);
            } else {
                c = 'import SiteTypeLogic from "@/app/sites/SiteTypeLogic";\n' + c;
            }
        }
        
        fs.writeFileSync(filePath, c);
        console.log('Replaced script in ' + filePath);
    } else {
        console.log('No script found in ' + filePath);
    }
}

replaceScript('c:/Toon/pssgo/app/sites/add/page.tsx');
replaceScript('c:/Toon/pssgo/app/sites/[id]/page.tsx');
