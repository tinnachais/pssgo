import { getParkingFees, toggleParkingFeeStatus, deleteParkingFee } from "@/app/actions/parking-fees";
import { getParkTypes } from "@/app/actions/park-types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ParkingFeesPage() {
  let parkingFees: any[] = [];
  let parkTypes: any[] = [];
  
  try {
    parkingFees = await getParkingFees();
    parkTypes = await getParkTypes();
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">อัตราค่าจอดรถ</h1>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">Parking Fees</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              กำหนดอัตราค่าบริการและเงื่อนไขการเก็บค่าที่จอดรถสำหรับผู้มาติดต่อ
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/parking-fees/simulate" className="bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold py-3.5 px-6 rounded-xl border border-sky-200 dark:border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              เครื่องมือจำลอง (Simulator)
            </Link>
            <Link href="/parking-fees/add" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มอัตราค่าบริการ
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest leading-relaxed">ชื่อรายการค่าบริการ<br/>(และรายละเอียด)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/5">อัตราค่าบริการ<br/>(บาท)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">สถานะ</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {parkingFees.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีการกำหนดอัตราค่าบริการ</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">เริ่มตั้งค่าระบบคิดเงินค่าจอดรถสำหรับโครงการของคุณ</p>
                            <Link href="/parking-fees/add" className="text-amber-600 hover:text-amber-700 font-bold border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg transition-colors">
                                + สร้างรายการแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    parkingFees.map((fee: any) => (
                        <tr key={fee.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <td className="px-6 py-4 align-top">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 mt-1 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm font-bold text-xs flex-shrink-0">
                                {fee.fee_type === 'VIP' ? 'VIP' : fee.fee_type === 'DELIVERY' ? 'SEND' : fee.fee_type === 'TAXI' ? 'TAXI' : '฿'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{fee.name}</span>
                                    <span className="text-xs text-zinc-500 mt-1">{fee.description || 'ไม่มีคำอธิบาย'}</span>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {fee.applicable_days === 'NORMAL_ONLY' && <span className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-blue-200 dark:border-blue-500/20">วันปกติเท่านั้น</span>}
                                        {fee.applicable_days === 'HOLIDAY_ONLY' && <span className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-amber-200 dark:border-amber-500/20">วันหยุดเท่านั้น</span>}
                                        {(!fee.applicable_days || fee.applicable_days === 'ALL') && <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-zinc-200 dark:border-zinc-700">ใช้งานทุกวัน</span>}

                                        {/* Park Types Badges */}
                                        {Array.isArray(fee.applicable_park_type_ids) && fee.applicable_park_type_ids.length > 0 && (
                                            fee.applicable_park_type_ids.map((id: number) => {
                                                const pt = parkTypes.find(t => t.id === id);
                                                if (!pt) return null;
                                                return (
                                                    <span key={id} className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-bold border border-amber-200 dark:border-amber-500/20">
                                                        {pt.name}
                                                    </span>
                                                );
                                            })
                                        )}

                                        {fee.grace_period_minutes > 0 ? <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-emerald-200 dark:border-emerald-500/20">จอดฟรี {fee.grace_period_minutes} นาที</span> : null}
                                        {fee.free_hours_with_stamp > 0 ? <span className="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-sky-200 dark:border-sky-500/20">E-Stamp ฟรี {fee.free_hours_with_stamp} ชม.</span> : null}
                                    </div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <div className="flex flex-col gap-2">
                                    {fee.is_subscription && (
                                        <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-500/20 w-fit">
                                            <span className="text-xs text-purple-700 dark:text-purple-400 font-bold whitespace-nowrap">รายเดือน</span>
                                            <span className="text-sm font-bold text-purple-900 dark:text-purple-300 font-mono">{Number(fee.monthly_rate).toLocaleString('th-TH')} <span className="text-[10px]">THB</span></span>
                                        </div>
                                    )}
                                    {fee.is_flat_rate && (
                                        <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 w-fit">
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-bold whitespace-nowrap">รายชั่วโมง</span>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">{Number(fee.base_hourly_rate).toLocaleString('th-TH')} <span className="text-[10px]">THB/ชม.</span></span>
                                        </div>
                                    )}
                                    {fee.has_tiered_rates && fee.tiered_rates && fee.tiered_rates.length > 0 && (
                                        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold pl-1">+ อัตราก้าวหน้า {fee.tiered_rates.length} ขั้น</div>
                                    )}
                                    {fee.has_time_interval_rates && fee.time_interval_rates && fee.time_interval_rates.length > 0 && (
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold pl-1">+ อัตราแปรผันตามช่วงเวลา {fee.time_interval_rates.length} ช่วง</div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {fee.daily_max_rate ? <span className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-amber-200 dark:border-amber-500/20">สูงสุด ฿{fee.daily_max_rate}/วัน</span> : null}
                                        {fee.has_overnight_penalty && fee.overnight_penalty_rate ? <span className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-rose-200 dark:border-rose-500/20">ค้างคืนปรับ ฿{fee.overnight_penalty_rate}</span> : null}
                                    </div>
                                    {(!fee.is_subscription && !fee.is_flat_rate) && (
                                        <span className="text-sm text-zinc-400 italic">ไม่มีคิดเงิน</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                                <form action={async () => {
                                "use server";
                                await toggleParkingFeeStatus(fee.id, !fee.is_active);
                                }}>
                                <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 ${fee.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${fee.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {fee.is_active ? 'Active' : 'Disabled'}
                                </button>
                                </form>
                            </td>
                            <td className="px-6 py-4 align-top text-right">
                            <div className="flex justify-end gap-1">
                                <Link href={`/parking-fees/${fee.id}`} title="แก้ไข" className="text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 inline-flex">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                </Link>
                                <form action={async () => {
                                "use server";
                                await deleteParkingFee(fee.id);
                                }}>
                                <button type="submit" title="ลบข้อมูล" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
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
