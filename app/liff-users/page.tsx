import { getLiffUsers } from "@/app/actions/residents";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import "dayjs/locale/th";

export const dynamic = "force-dynamic";

export default async function LiffUsersPage() {
    const users = await getLiffUsers();
    
    // Set locale to Thai
    dayjs.locale("th");

    return (
        <div className="min-h-full font-sans selection:bg-blue-500/30">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 p-2.5 rounded-2xl">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </span>
                            ผู้ใช้บริการ (LINE LIFF)
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                            รายชื่อผู้ที่ลงทะเบียนใช้งานและผูกบัญชี LINE เรียบร้อยแล้ว
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">บัญชี LINE</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">ห้อง / สถานที่</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">สถานะ</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">วันที่ลงทะเบียน</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-transparent">
                                {users.length > 0 ? (
                                    users.map((user: any) => (
                                        <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 relative rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                                                        {user.line_picture_url ? (
                                                            <Image
                                                                src={user.line_picture_url}
                                                                alt={user.line_display_name || "LINE User"}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            {user.line_display_name || "ไม่ระบุชื่อ"}
                                                        </div>
                                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                            {user.owner_name || "ไม่มีชื่อในโปรไฟล์"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {user.house_number}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {user.site_name || "ไม่ระบุสถานที่"}
                                                    {user.is_owner ? ' (เจ้าบ้าน)' : ' (ผู้ใช้ประจำ)'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                                {dayjs(user.created_at).format("D MMM YYYY")}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-zinc-400">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">ไม่พบผู้ใช้บริการ</h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">ยังไม่มีผู้ลงทะเบียนผ่าน LINE LIFF ในระบบ</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
