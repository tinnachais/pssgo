import { getProviderRevenues } from "@/app/actions/provider_revenues";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");
export const dynamic = "force-dynamic";

export default async function ProviderRevenuesPage() {
  const revenues = await getProviderRevenues();
  
  // Calculate Summaries
  const totalRevenue = revenues.reduce((sum, rev) => sum + parseFloat(rev.amount), 0);
  const monthlyRevenue = revenues.filter(r => r.billing_cycle === 'MONTHLY').reduce((sum, rev) => sum + parseFloat(rev.amount), 0);
  const yearlyRevenue = revenues.filter(r => r.billing_cycle === 'YEARLY').reduce((sum, rev) => sum + parseFloat(rev.amount), 0);

  return (
    <div className="min-h-full font-sans selection:bg-emerald-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">บิลลิ่งโครงการ (รายได้ Provider)</h1>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
                Billing
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จดบันทึกรายได้และการซื้อแพ็กเกจของโครงการ เพื่อผูกขีดจำกัดปริมาณรถของระบบ
            </p>
          </div>
          <Link
            href="/provider-revenues/add"
            className="group relative inline-flex items-center gap-2 px-6 py-3 font-bold text-white bg-emerald-600 rounded-xl overflow-hidden hover:bg-emerald-700 transition-all active:scale-95 shadow-sm hover:shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">ออกบิลเรียกเก็บโครงการ</span>
          </Link>
        </div>

        {/* Dashboard Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500 absolute bottom-4 left-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">รายได้รวมทั้งหมด</h3>
                <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">฿{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">รายได้จากแพ็กเกจรายเดือน</h3>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">฿{monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-2">รายได้จากแพ็กเกจรายปี</h3>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tight">฿{yearlyRevenue.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest pl-8">วันที่รับชำระ</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">โครงการ (Site)</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">แพ็กเกจ</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">รอบบิล</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">สถานะ</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">ยอดเงิน</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center pr-8 w-24">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {revenues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium">ยังไม่มีประวัติการเรียกเก็บเงิน</p>
                    </td>
                  </tr>
                ) : (
                  revenues.map((rev: any) => (
                    <tr key={rev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 pl-8 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-white">
                        {dayjs(rev.created_at).format("DD MMM YYYY HH:mm")}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                        <div>{rev.site_name || 'ไม่ระบุ'}</div>
                        {rev.period_start && rev.period_end && (
                            <div className="text-[10px] text-zinc-500 font-medium mt-0.5">
                                ครอบคลุม: {dayjs(rev.period_start).format("DD MMM YYYY")} - {dayjs(rev.period_end).format("DD MMM YYYY")}
                            </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {rev.package_name || 'ไม่ระบุแพ็กเกจ'}
                      </td>
                      <td className="px-6 py-4">
                        {rev.billing_cycle === 'YEARLY' ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Yearly</span>
                        ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">Monthly</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {rev.status === 'PENDING' ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">รอชำระเงิน</span>
                        ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">ชำระแล้ว</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-zinc-900 dark:text-white">
                        ฿{parseFloat(rev.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 pr-8 text-center whitespace-nowrap">
                        <div className="flex justify-end items-center gap-1">
                            {rev.status === 'PENDING' && (
                                <form action={async () => {
                                    "use server";
                                    const { markProviderRevenueAsPaid } = await import("@/app/actions/provider_revenues");
                                    await markProviderRevenueAsPaid(rev.id);
                                }}>
                                    <button type="submit" title="บันทึกชำระเงิน" className="text-zinc-600 bg-emerald-100/50 hover:text-emerald-700 dark:text-emerald-400/80 dark:bg-emerald-500/10 dark:hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 inline-flex items-center gap-1 text-xs font-bold mr-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        ยืนยันชำระ
                                    </button>
                                </form>
                            )}
                            <Link href={`/provider-revenues/${rev.id}/invoice`} target="_blank" title="ใบแจ้งหนี้/ใบเสร็จ" className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                            </Link>
                            <form action={async () => {
                                "use server";
                                const { deleteProviderRevenue } = await import("@/app/actions/provider_revenues");
                                await deleteProviderRevenue(rev.id);
                            }}>
                                <button type="submit" title="ลบบิล" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
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
