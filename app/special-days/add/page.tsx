import { addSpecialDay } from "@/app/actions/special-days";
import Link from "next/link";

export default function AddSpecialDayPage() {
  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/special-days" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าวันหยุดพิเศษ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มวันหยุดพิเศษ</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                กำหนดวันหยุดเพื่อตั้งค่าหรือผูกกับเงื่อนไขค่าจอดรถ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <form action={addSpecialDay} className="space-y-6 relative z-10">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อวันหยุด <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="เช่น วันขึ้นปีใหม่"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    วันที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input
                    type="checkbox"
                    name="is_recurring"
                    id="is_recurring"
                    className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-amber-500 focus:ring-amber-500/50"
                    />
                    <label htmlFor="is_recurring" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    เกิดขึ้นทุกปีในวันนี้แบบอัตโนมัติ
                    </label>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รายละเอียด (ถ้ามี)
                    </label>
                    <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="เช่น ไม่คิดค่าจอด"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกข้อมูล
                    </button>
                    <Link href="/special-days" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
