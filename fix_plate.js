const fs = require('fs');

let c = fs.readFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', 'utf8');

if (!c.includes('import LicensePlateDisplay')) {
    c = c.replace('import "dayjs/locale/th";', 'import "dayjs/locale/th";\nimport LicensePlateDisplay from "@/app/components/LicensePlateDisplay";');
}

// Find the start and end of the vehicle display block
const startText = '{user.user_vehicles && Array.isArray(user.user_vehicles) && user.user_vehicles.length > 0 ? (';
const endText = '))}';

const startIndex = c.indexOf(startText);
// find the correct endText index by counting brackets if needed, or just finding the one right before `</div>` and `</td>`
const afterEndText = '</div>\n                                            </td>\n                                            <td className="px-6 py-4 whitespace-nowrap">';
const endIndex = c.indexOf(afterEndText);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = `{user.user_vehicles && Array.isArray(user.user_vehicles) && user.user_vehicles.length > 0 ? (
                                                        user.user_vehicles.filter((v:any) => v).map((v: any) => (
                                                            <div key={v.id} className="relative inline-block group" title="รถของคุณ">
                                                                <div className="absolute -top-1.5 -right-1.5 z-10 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-zinc-800">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <div className="transform origin-left scale-75 md:scale-90">
                                                                    <LicensePlateDisplay licensePlate={v.license_plate} province={v.province} />
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-zinc-400 italic">ไม่มีรถในระบบ</span>
                                                    )}
                                                    
                                                    {user.shared_vehicles && Array.isArray(user.shared_vehicles) && user.shared_vehicles.filter((v:any) => v).map((v: any) => (
                                                        <div key={\`shared-\${v.id}\`} className="relative inline-block group" title={\`แชร์จาก: \${v.owner_name}\`}>
                                                            <div className="absolute -top-1.5 -right-1.5 z-10 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-zinc-800">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                                </svg>
                                                            </div>
                                                            <div className="transform origin-left scale-75 md:scale-90 opacity-90">
                                                                <LicensePlateDisplay licensePlate={v.license_plate} province={v.province} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    `;
    
    c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
    fs.writeFileSync('c:/Toon/pssgo/app/liff-users/page.tsx', c);
    console.log("Updated vehicle plates in liff-users!");
} else {
    console.log("Could not find block to replace.");
}
