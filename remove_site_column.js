const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');

// Remove the table header for site
c = c.replace(/<th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">สถานที่<\/th>\s*/, '');

// Remove the table cell for site
// It looks like:
// <td className="px-6 py-4 whitespace-nowrap">
//      <div className="text-sm font-semibold text-zinc-900 dark:text-white">
//          {user.site_name ? (
//              <>{user.site_name} {user.is_owner ? '(ผู้เช่า)' : '(ผู้ใช้บริการ)'}</>
//          ) : (
//              <span className="text-blue-500 font-medium bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">ผู้ใช้บริการสาธารณะ</span>
//          )}
//      </div>
// </td>

const tdPattern = /<td className="px-6 py-4 whitespace-nowrap">\s*<div className="text-sm font-semibold text-zinc-900 dark:text-white">\s*\{user\.site_name \? \(\s*<>[^<]+<\/>\s*\) : \(\s*<span[^>]+>[^<]+<\/span>\s*\)\}\s*<\/div>\s*<\/td>\s*/g;
c = c.replace(tdPattern, '');

// Adjust colSpan from 5 to 4
c = c.replace(/colSpan=\{5\}/g, 'colSpan={4}');

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', c);
console.log('Removed site column');
