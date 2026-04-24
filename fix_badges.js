const fs = require('fs');
let c = fs.readFileSync('c:/Toon/pssgo/app/sites/page.tsx', 'utf8');

const regex = /\{site\.type === 'PUBLIC' \? \([\s\S]*?<\/span>\s*\)\}/;

const replacement = `{site.type === 'TIER1_PRIVATE' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">Tier 1 ส่วนตัว (PSS GO)</span>
                                    ) : site.type === 'TIER2_PUBLIC_CITY' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">Tier 2 สาธารณะ (City Parking)</span>
                                    ) : site.type === 'TIER3_PUBLIC_PSS' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">Tier 3 สาธารณะ (PSS)</span>
                                    ) : site.type === 'TIER4_PUBLIC_OTHERS' ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">Tier 4 สาธารณะ (Others)</span>
                                    ) : null}`;

c = c.replace(regex, replacement);
fs.writeFileSync('c:/Toon/pssgo/app/sites/page.tsx', c);
console.log('Fixed badges');
