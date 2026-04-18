import { addZone } from "@/app/actions/zones";
import { getSites } from "@/app/actions/sites";
import Link from "next/link";

export default async function AddZonePage() {
  const sites = await getSites();
  const activeSites = sites.filter(s => s.is_active);

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/zones" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าโซนพื้นที่
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มโซนใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                สร้างโซนพื้นที่ย่อยในแต่ละโครงการ เพื่อใช้กำหนดทางเข้าออกและสิทธิ์
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addZone} className="space-y-6 relative z-10 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="siteId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    โครงการเป้าหมาย <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="siteId"
                        id="siteId"
                        required
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกโครงการ --</option>
                        {activeSites.map((site) => (
                            <option key={site.id} value={site.id}>
                            {site.name} ({site.provider_name})
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    {activeSites.length === 0 && (
                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ต้องเพิ่มข้อมูลโครงการก่อน
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อโซน <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="เช่น เฟส 1, โซน VIP..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รายละเอียดเพิ่มเติม
                    </label>
                    <textarea
                    name="description"
                    id="description"
                    rows={4}
                    placeholder="รายละเอียดโซน..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
                    ></textarea>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={activeSites.length === 0}
                        className={`font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeSites.length > 0
                            ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg active:scale-[0.98]"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        บันทึกข้อมูล
                    </button>
                    <Link href="/zones" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
