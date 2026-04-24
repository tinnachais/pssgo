const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            // Exclude directories we don't want to modify
            if (['liff', 'liff-users', 'login', 'visitor', 'webpay', 'receipt', 'ticket', 'components', 'api'].includes(f)) {
                return;
            }
            walkDir(dirPath, callback);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            callback(dirPath);
        }
    });
}

let modifiedFiles = 0;

walkDir('c:/Toon/pssgo/app', function(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace <main className="max-w-7xl mx-auto
    // It could be 7xl, 6xl, 5xl, 4xl, 3xl, 2xl, xl, lg, etc.
    content = content.replace(/<main className="max-w-[a-z0-9]+ mx-auto/g, '<main className="w-full');
    
    // Also, some might not have exactly that string but similar.
    // Let's just catch the standard ones we saw.
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        modifiedFiles++;
        console.log('Updated:', filePath);
    }
});

// Also check app/page.tsx
const pagePath = 'c:/Toon/pssgo/app/page.tsx';
if (fs.existsSync(pagePath)) {
    let c = fs.readFileSync(pagePath, 'utf8');
    if (c.match(/<main className="max-w-[a-z0-9]+ mx-auto/)) {
        c = c.replace(/<main className="max-w-[a-z0-9]+ mx-auto/g, '<main className="w-full');
        fs.writeFileSync(pagePath, c);
        console.log('Updated app/page.tsx');
    }
}

console.log('Total files modified:', modifiedFiles);
