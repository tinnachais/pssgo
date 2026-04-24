const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/actions/residents.ts', 'utf8');

c = c.replace(/const query = require\('@\/lib\/db'\)\.query;\n/g, '');
c = c.replace(/const \{ revalidatePath \} = require\('next\/cache'\);\n/g, '');

fs.writeFileSync('c:/Toon/pssgo/app/actions/residents.ts', c);
console.log('Fixed requires in deleteLiffUserAndData');
