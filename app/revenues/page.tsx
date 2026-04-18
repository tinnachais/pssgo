import { getRevenues, deleteRevenue, updateRevenueStatus } from "@/app/actions/revenues";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RevenuesPage() {
  let revenues: any[] = [];

  try { 
    revenues = await getRevenues(); 
  } catch (err) {
    console.error("Failed to fetch revenues:", err);
  }

  // Stats calculation
  const totalRevenue = revenues.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const paidRevenue = revenues.filter(r => r.payment_status === 'PAID').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">รายได้ / ใบเสร็จ</h1>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">Revenues</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              บันทึกและจัดการรายได้, ค่าจอดรถ, ส่วนกลาง และการออกใบเสร็จ
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 px-6 py-3 rounded-2xl flex items-center gap-8 w-full sm:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">ยอดรวมทั้งหมด</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1">฿ {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                </div>
                <div className="w-px h-8 bg-amber-200 dark:bg-amber-500/30"></div>
                <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">ชำระแล้ว (PAID)</p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1">฿ {paidRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                </div>
            </div>
            
            <Link href="/revenues/add" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                บันทึกรายได้ใหม่
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest pl-6">เลขที่ใบเสร็จ / วันที่</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest">รายละเอียด / อ้างอิง</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right">จำนวนเงิน (฿)</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center">สถานะ</th>
                    <th className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right pr-6">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {revenues.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลรายการรับชำระเงิน</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เริ่มบันทึกรายได้ ค่าจอดรถ และค่าส่วนกลางของโครงการ</p>
                            <Link href="/revenues/add" className="text-amber-600 hover:text-amber-700 font-bold border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg transition-colors">
                                + บันทึกบิลแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    revenues.map(r => (
                        <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                        <td className="px-5 py-4 pl-6 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                                {r.receipt_no}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {new Date(r.issued_at).toLocaleString('th-TH')}
                                </span>
                            </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-200 line-clamp-1 overflow-hidden overflow-ellipsis max-w-[200px] md:max-w-xs">
                                {r.description || 'รายได้ทั่วไป'}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-bold">
                                    {r.site_name}
                                </span>
                                {r.group_name && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded text-[10px] font-bold">
                                    {r.group_name}
                                    </span>
                                )}
                                {r.type_name && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                                    {r.type_name}
                                    </span>
                                )}
                                {r.license_plate && (
                                    <span className="inline-flex items-center px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 rounded text-[10px] font-mono font-bold tracking-widest uppercase">
                                    {r.license_plate}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-lg text-amber-600 dark:text-amber-500 font-mono">
                                ฿ {parseFloat(r.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold mt-0.5 tracking-wider bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {r.method_name || r.payment_method}
                                </span>
                            </div>
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                            {r.payment_status === 'PAID' && (
                                <span className="inline-flex py-1 px-3 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                กำลังชำระ (PAID)
                                </span>
                            )}
                            {r.payment_status === 'PENDING' && (
                                <span className="inline-flex py-1 px-3 rounded-full text-[10px] font-bold tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                รอชำระ (PENDING)
                                </span>
                            )}
                            {r.payment_status === 'CANCELLED' && (
                                <span className="inline-flex py-1 px-3 rounded-full text-[10px] font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                ยกเลิก (VOID)
                                </span>
                            )}
                        </td>
                        <td className="px-5 py-4 text-right pr-6 whitespace-nowrap">
                            <div className="flex justify-end gap-2 items-center">
                                <Link href={`/revenues/${r.id}`} title="ดู/แก้ไขรายละเอียด" className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 inline-flex border border-transparent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteRevenue(r.id);
                                }}>
                                <button type="submit" title="ลบข้อมูลใบเสร็จ" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex border border-transparent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
