const fs = require('fs');

function fixFile(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');

    // 1. Remove the entire <script>...</script> block
    const scriptStart = c.indexOf('<script dangerouslySetInnerHTML');
    if (scriptStart !== -1) {
        const scriptEnd = c.indexOf('</script>', scriptStart) + 9;
        
        // Remove the script, but insert the component
        c = c.substring(0, scriptStart) + '<SiteTypeLogic />' + c.substring(scriptEnd);
        
        // Ensure no multiple <SiteTypeLogic />
        c = c.replace(/(<SiteTypeLogic \/>\s*)+/g, '<SiteTypeLogic />\n');

        // 2. Add import
        if (!c.includes('import SiteTypeLogic')) {
            c = 'import SiteTypeLogic from "@/app/sites/SiteTypeLogic";\n' + c;
        }

        fs.writeFileSync(filePath, c);
        console.log('Fixed', filePath);
    } else {
        console.log('No script found in', filePath);
        
        // In case replaceScript.js already removed it but left <SiteTypeLogic /> multiple times?
        // Let's clean up multiple SiteTypeLogic
        if (c.includes('<SiteTypeLogic />')) {
            let matches = c.match(/<SiteTypeLogic \/>/g);
            if (matches && matches.length > 1) {
                console.log('Found multiple SiteTypeLogic! Cleaning up...');
                c = c.replace(/(<SiteTypeLogic \/>\s*)+/g, '<SiteTypeLogic />\n');
                fs.writeFileSync(filePath, c);
            }
        }
    }
}

fixFile('c:/Toon/pssgo/app/sites/add/page.tsx');
fixFile('c:/Toon/pssgo/app/sites/[id]/page.tsx');
