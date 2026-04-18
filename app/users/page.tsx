import { getUsers, toggleUserStatus, deleteUser } from "@/app/actions/users";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users: any[] = [];
  
  try {
    users = await getUsers();
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-sky-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">ข้อมูลผู้ใช้งานระบบ</h1>
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full uppercase tracking-wider">System Users</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จัดการสิทธิ์การเข้าถึง และข้อมูลบัญชีของผู้ใช้งานในระบบ (ผู้ดูแล, รปภ., หัวหน้างาน)
            </p>
          </div>
          <Link href="/users/add" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-sky-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มผู้ใช้งาน
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest leading-relaxed">ข้อมูลส่วนตัว<br/>(ชื่อ / อีเมล)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">โครงสร้าง/ระดับ<br/>(Level)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สิทธิ์เมนู<br/>(Role)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {users.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลผู้ใช้งาน</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เพิ่มบัญชีผู้ใช้งานเข้าสู่ระบบเพื่อควบคุมการทำงาน</p>
                            <Link href="/users/add" className="text-sky-600 hover:text-sky-700 font-bold border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-lg transition-colors">
                                + เพิ่มบัญชีแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-sm flex-shrink-0">
                                {user.first_name?.charAt(0) || 'U'}{user.last_name?.charAt(0) || ''}
                                </div>
                                <div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                                    {user.first_name} {user.last_name}
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">
                                    {user.email}
                                </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border 
                                ${user.level === 'Level1' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                                (user.level === 'Level2' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' : 
                                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20')}`}>
                                {user.level || 'Level1'}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20">
                                {user.role}
                            </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <form action={async () => {
                                "use server";
                                await toggleUserStatus(user.id, !user.is_active);
                                }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {user.is_active ? 'Active' : 'Locked'}
                                </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/users/${user.id}`} title="แก้ไข" className="text-zinc-400 hover:text-sky-600 dark:hover:text-sky-500 transition-colors p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteUser(user.id);
                                }}>
                                <button type="submit" title="ลบข้อมูลบัญชี" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                </form>
                            </div>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
