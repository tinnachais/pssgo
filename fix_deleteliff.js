const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/components/DeleteLiffUserButton.tsx', 'utf8');

c = c.replace(/export default function DeleteLiffUserButton\(\{ id \}: \{ id: number \}\) \{/, 'export default function DeleteLiffUserButton({ id }: { id: string }) {');

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/components/DeleteLiffUserButton.tsx', c);
console.log('Fixed DeleteLiffUserButton');
