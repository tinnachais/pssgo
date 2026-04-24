const fs = require('fs');

function addMockOption(filePath) {
    let c = fs.readFileSync(filePath, 'utf8');
    c = c.replace(
        /(<option value="PUBLIC">.*?<\/option>)/g,
        `$1\n                              <option value="MOCK_PUBLIC">สาธารณะจำลอง (พิกัด, จำนวนช่องจอด, ค่าจอด)</option>`
    );
    fs.writeFileSync(filePath, c);
}

addMockOption('c:/Toon/pssgo/app/sites/add/page.tsx');
addMockOption('c:/Toon/pssgo/app/sites/[id]/page.tsx');

console.log('Added MOCK_PUBLIC option');
