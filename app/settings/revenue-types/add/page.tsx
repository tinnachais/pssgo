import { addRevenueType } from "@/app/actions/revenue-types";
import { getRevenueGroups } from "@/app/actions/revenue-groups";
import Link from "next/link";

export default async function AddRevenueTypePage() {
  const groups = await getRevenueGroups();
  return (
    <div className="min-h-full font-sans selection:bg-purple-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/settings/revenue-types" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าประเภทรายได้
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มประเภทรายได้</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                กำหนดประเภทใหม่เพื่อระบุที่มาของรายรับให้เจาะจงมากขึ้น
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <form action={addRevenueType} className="space-y-6 relative z-10">
                <div className="space-y-2">
                    <label htmlFor="code" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รหัสประเภท (Code) <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="code"
                    id="code"
                    required
                    placeholder="เช่น SUB"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all uppercase"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อประเภท <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="เช่น ค่าปรับทั่วไป"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รายละเอียดเพิ่มเติม
                    </label>
                    <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="รายละเอียดเพิ่มเติมของประเภทนี้"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="group_id" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    จัดอยู่ในกลุ่มรายได้ (Revenue Group)
                    </label>
                    <select
                    name="group_id"
                    id="group_id"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
                    >
                        <option value="">-- ไม่ระบุกลุ่ม --</option>
                        {groups.map((g: any) => (
                            <option key={g.id} value={g.id}>
                                {g.name} {g.code ? `(${g.code})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกข้อมูล
                    </button>
                    <Link href="/settings/revenue-types" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
