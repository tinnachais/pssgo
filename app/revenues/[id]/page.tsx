import { getRevenue, updateRevenue } from "@/app/actions/revenues";
import { getSites } from "@/app/actions/sites";
import { getRevenueGroups } from "@/app/actions/revenue-groups";
import { getRevenueTypes } from "@/app/actions/revenue-types";
import { getRevenueMethods } from "@/app/actions/revenue-methods";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RevenueDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const revenue = await getRevenue(id);
  
  if (!revenue) {
    notFound();
  }

  const sites = await getSites();
  const revenueTypes = await getRevenueTypes();
  const revenueMethods = await getRevenueMethods();

  const activeSites = sites.filter((s:any) => s.is_active || s.id === revenue.site_id);
  const activeRevenueTypes = revenueTypes.filter((t:any) => t.is_active || t.id === revenue.type_id);
  const activeRevenueMethods = revenueMethods.filter((m:any) => m.is_active || m.id === revenue.method_id);

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <Link href="/revenues" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้ารายได้ / ใบเสร็จ
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-bold text-3xl flex-shrink-0">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1 font-mono">{revenue.receipt_no}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            {revenue.payment_status === 'PAID' && (
                                <span className="inline-flex py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                PAID (รับชำระแล้ว)
                                </span>
                            )}
                            {revenue.payment_status === 'PENDING' && (
                                <span className="inline-flex py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                PENDING (รอชำระ)
                                </span>
                            )}
                            {revenue.payment_status === 'CANCELLED' && (
                                <span className="inline-flex py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                VOID (ยกเลิก)
                                </span>
                            )}
                            <span className="text-xs text-zinc-500">{new Date(revenue.issued_at).toLocaleString('th-TH')}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 px-6 py-4 rounded-2xl text-right">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">ยอดสุทธิ (Total Amount)</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center justify-end font-mono">
                   {parseFloat(revenue.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                   <span className="text-sm ml-1 text-amber-700/50">THB</span>
                </p>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขรายละเอียดบิล / เปลี่ยนสถานะ
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateRevenue(id, formData);
            }} className="space-y-6 relative z-10 max-w-2xl">
                <input type="hidden" name="siteId" value={revenue.site_id || ''} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="typeId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ประเภทรายได้ (Type)
                        </label>
                        <div className="relative">
                            <select
                            name="typeId"
                            id="typeId"
                            defaultValue={revenue.type_id || ''}
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
                        defaultValue={revenue.amount}
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
                            defaultValue={revenue.method_id || ''}
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
                            defaultValue={revenue.payment_status || 'PAID'}
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
                    defaultValue={revenue.description || ''}
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
                        required
                        defaultValue={revenue.receipt_no || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all uppercase"
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
                        defaultValue={revenue.license_plate || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all uppercase"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
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
