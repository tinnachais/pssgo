import { getRoles, toggleRoleStatus, deleteRole } from "@/app/actions/roles";
import Link from "next/link";
import { PERMISSION_MODULES } from "./constants";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  let roles: any[] = [];
  
  try {
    roles = await getRoles();
  } catch (err) {
    console.error("Failed to fetch roles:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">กลุ่มสิทธิ์การใช้งาน</h1>
              <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full uppercase tracking-wider">Roles</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              สร้างกลุ่มผู้ใช้งาน (เช่น นิติบุคคล, รปภ., Admin) และกำหนดสิทธิ์การมองเห็นเมนู
            </p>
          </div>
          <Link href="/roles/add" className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มกลุ่มสิทธิ์ใหม่
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[25%]">กลุ่มสิทธิ์<br/>(Role Name)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[45%]">เมนูที่อนุญาต<br/>(Allowed Modules)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {roles.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีการสร้างกลุ่มสิทธิ์</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">สร้างกลุ่มสิทธิ์เพื่อให้ผู้ใช้งานแต่ละระดับเข้าถึงเมนูต่างๆ ได้แตกต่างกัน</p>
                            <Link href="/roles/add" className="text-rose-600 hover:text-rose-700 font-bold border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg transition-colors">
                                + สร้างกลุ่มสิทธิ์แรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    roles.map((role: any) => {
                        const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : [];
                        return (
                        <tr key={role.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{role.name}</div>
                            <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{role.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                                {perms.length === 0 && <span className="text-[10px] text-zinc-400">ไม่มีสิทธิ์</span>}
                                {perms.slice(0, 4).map((p: string) => (
                                    <span key={p} className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                                        {p}
                                    </span>
                                ))}
                                {perms.length > 4 && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                                        +{perms.length - 4}
                                    </span>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <form action={async () => {
                                "use server";
                                await toggleRoleStatus(role.id, !role.is_active);
                                }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 ${role.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${role.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {role.is_active ? 'Active' : 'Disabled'}
                                </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/roles/${role.id}`} title="แก้ไขสิทธิ์" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteRole(role.id);
                                }}>
                                <button type="submit" title="ลบกลุ่ม" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                </form>
                            </div>
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
