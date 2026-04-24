const fs = require('fs');

function replaceScriptWithComponent(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');

    // Remove the script tag
    c = c.replace(/<script dangerouslySetInnerHTML=[\s\S]*?<\/script>/, '<SiteTypeLogic />');

    // Add the import statement
    if (!c.includes('import SiteTypeLogic')) {
        // Find the last import
        const lastImportIndex = c.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = c.indexOf('\n', lastImportIndex);
            c = c.substring(0, endOfLine + 1) + 'import SiteTypeLogic from "@/app/sites/SiteTypeLogic";\n' + c.substring(endOfLine + 1);
        } else {
            c = 'import SiteTypeLogic from "@/app/sites/SiteTypeLogic";\n' + c;
        }
    }

    fs.writeFileSync(filePath, c);
}

replaceScriptWithComponent('c:/Toon/pssgo/app/sites/add/page.tsx');
replaceScriptWithComponent('c:/Toon/pssgo/app/sites/[id]/page.tsx');

console.log('Done replacing script with SiteTypeLogic');
