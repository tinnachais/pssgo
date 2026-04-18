import { getRole, updateRole } from "@/app/actions/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PERMISSION_MODULES } from "../constants";

export default async function RoleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const role = await getRole(id);
  
  if (!role) {
    notFound();
  }

  const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions || '[]') : [];

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/roles" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้ากลุ่มสิทธิ์การใช้งาน
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 font-bold text-3xl flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{role.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${role.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${role.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {role.is_active ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลสิทธิ์และเมนู
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateRole(id, formData);
            }} className="space-y-6 max-w-2xl">
                
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อกลุ่มสิทธิ์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={role.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    คำอธิบายสิทธิ์
                    </label>
                    <input
                    type="text"
                    name="description"
                    id="description"
                    defaultValue={role.description || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                    />
                </div>

                <div className="pt-2">
                    <label className="block text-base font-bold text-zinc-700 dark:text-zinc-300 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                        สิทธิ์เข้าถึงเมนู (Permissions)
                    </label>
                    <div className="space-y-3">
                        {PERMISSION_MODULES.map((mod) => (
                            <label key={mod.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700">
                                <div className="flex items-center h-6 mt-0.5">
                                    <input
                                        type="checkbox"
                                        name="permissions"
                                        value={mod.id}
                                        defaultChecked={perms.includes(mod.id)}
                                        className="w-5 h-5 text-rose-600 rounded border-zinc-300 focus:ring-rose-500 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-zinc-900 dark:text-white">{mod.name}</span>
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{mod.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                
                <div className="pt-6 flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <Link href="/roles" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
