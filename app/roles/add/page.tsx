import { addRole } from "@/app/actions/roles";
import Link from "next/link";
import { PERMISSION_MODULES } from "../constants";

export default function AddRolePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">สร้างกลุ่มสิทธิ์ใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                กำหนดชื่อกลุ่มสิทธิ์ และเลือกเมนูต่างๆ ที่ผู้ใช้งานในกลุ่มนี้สามารถเข้าถึงได้
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addRole} className="space-y-6 relative z-10 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อกลุ่มสิทธิ์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="เช่น ผู้จัดการนิติบุคคล, รปภ. กะเช้า"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
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
                    placeholder="เช่น จำกัดสิทธิ์เฉพาะดูจอและการเก็บเงิน"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
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
                        บันทึกกลุ่มใหม่
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
