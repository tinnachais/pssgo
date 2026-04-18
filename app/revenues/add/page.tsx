import { addRevenue } from "@/app/actions/revenues";
import { getSites } from "@/app/actions/sites";
import { getRevenueGroups } from "@/app/actions/revenue-groups";
import { getRevenueTypes } from "@/app/actions/revenue-types";
import { getRevenueMethods } from "@/app/actions/revenue-methods";
import Link from "next/link";

export default async function AddRevenuePage() {
  const sites = await getSites();
  const revenueTypes = await getRevenueTypes();
  const revenueMethods = await getRevenueMethods();

  const activeSites = sites.filter((s:any) => s.is_active);
  const activeRevenueTypes = revenueTypes.filter((t:any) => t.is_active);
  const activeRevenueMethods = revenueMethods.filter((m:any) => m.is_active);

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/revenues" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้ารายได้ / ใบเสร็จ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">บันทึกรับเงิน / เปิดใบเสร็จ</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                บันทึกรายได้รายการใหม่เข้าสู่ระบบ และออกเลขที่ใบเสร็จ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addRevenue} className="space-y-6 relative z-10 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-3">
                        <label htmlFor="siteId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สถานที่ / โครงการ (Site) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                            name="siteId"
                            id="siteId"
                            required
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                            >
                            <option value="">-- เลือกสถานที่ --</option>
                            {activeSites.map((site:any) => (
                                <option key={site.id} value={site.id}>
                                {site.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="typeId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ประเภทรายได้ (Type)
                        </label>
                        <div className="relative">
                            <select
                            name="typeId"
                            id="typeId"
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                            >
                            <option value="">-- ไม่ระบุประเภท --</option>
                            {activeRevenueTypes.map((t:any) => (
                                <option key={t.id} value={t.id}>
                                {t.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ยอดเงิน (บาท) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                            <span className="text-amber-500 font-bold text-lg">฿</span>
                        </div>
                        <input
                        type="number"
                        name="amount"
                        id="amount"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-10 pr-5 py-4 text-2xl font-bold text-amber-600 dark:text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="methodId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ช่องทางชำระเงิน
                        </label>
                        <div className="relative">
                            <select
                            name="methodId"
                            id="methodId"
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                            >
                            <option value="">-- เงินสด (Cash) --</option>
                            {activeRevenueMethods.map((m:any) => (
                                <option key={m.id} value={m.id}>
                                {m.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="paymentStatus" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สถานะการชำระเงิน
                        </label>
                        <div className="relative">
                            <select
                            name="paymentStatus"
                            id="paymentStatus"
                            defaultValue="PAID"
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-bold text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            >
                            <option value="PAID">✅ รับชำระแล้ว (PAID)</option>
                            <option value="PENDING">⏳ ค้างชำระ (PENDING)</option>
                            <option value="CANCELLED">❌ ยกเลิก (VOID)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รายการ / คำอธิบาย <span className="text-zinc-400 font-normal">(ระบุสินค้าหรือบริการ)</span>
                    </label>
                    <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="เช่น ค่าจอดรถผู้มาติดต่อ (2 ชม.)"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="receiptNo" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        เลขที่ใบเสร็จ
                        </label>
                        <input
                        type="text"
                        name="receiptNo"
                        id="receiptNo"
                        placeholder="ปล่อยว่างเพื่อสุ่มอัตโนมัติ"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all uppercase"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="licensePlate" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ทะเบียนรถอ้างอิง <span className="text-zinc-400 font-normal">(ไม่บังคับ)</span>
                        </label>
                        <input
                        type="text"
                        name="licensePlate"
                        id="licensePlate"
                        placeholder="เช่น 1กข-1234"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all uppercase"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกทำรายการ / สร้างใบเสร็จ
                    </button>
                    <Link href="/revenues" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
