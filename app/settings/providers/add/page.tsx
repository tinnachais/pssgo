import { addProvider } from "@/app/actions/providers";
import Link from "next/link";

export default function AddProviderPage() {
  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/settings/providers" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้ให้บริการ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มผู้ให้บริการใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                เพิ่มข้อมูลของบริษัท, นิติบุคคล, หรือกลุ่ม รปภ. เพื่อเปิดให้ใช้งานในระบบ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addProvider} className="space-y-6 relative z-10 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อบริษัท / นิติบุคคล <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="บจก. รักษาความปลอดภัย หรือ นิติบุคคล..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="taxId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    เลขประจำตัวผู้เสียภาษี
                    </label>
                    <input
                    type="text"
                    name="taxId"
                    id="taxId"
                    placeholder="01055xxxxxxxx"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ที่อยู่สำหรับออกใบเสร็จ
                    </label>
                    <textarea
                    name="address"
                    id="address"
                    rows={4}
                    placeholder="ที่อยู่ตาม ภ.พ.20..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label htmlFor="contactName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อผู้ติดต่อ
                    </label>
                    <input
                    type="text"
                    name="contactName"
                    id="contactName"
                    placeholder="เช่น คุณสมชาย บุญรักษา"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        เบอร์โทรศัพท์
                        </label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="081-xxx-xxxx"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        อีเมล์
                        </label>
                        <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="example@company.com"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="invoiceAdvanceDays" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    สร้างใบแจ้งหนี้อัตโนมัติล่วงหน้า (วัน)
                    </label>
                    <input
                    type="number"
                    name="invoiceAdvanceDays"
                    id="invoiceAdvanceDays"
                    defaultValue="7"
                    min="1"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        ระบบจะทำการออกใบแจ้งหนี้ (สถานะรอดำเนินการ) อัตโนมัติล่วงหน้าก่อนที่แพ็กเกจจะหมดอายุตามจำนวนวันที่ระบุ
                    </p>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        บันทึกข้อมูล
                    </button>
                    <Link href="/settings/providers" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
