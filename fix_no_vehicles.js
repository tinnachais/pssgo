const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');

c = c.replace(
    /\) : \(\s*<span className="text-xs text-zinc-400 italic">.*?<\/span>\s*\)}/g,
    `) : (!user.shared_vehicles || !Array.isArray(user.shared_vehicles) || user.shared_vehicles.filter((v:any) => v).length === 0) ? (
                                                        <span className="text-xs text-zinc-400 italic">ไม่มีรถในระบบ</span>
                                                    ) : null}`
);

fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', c);
console.log('Fixed no vehicles text');
