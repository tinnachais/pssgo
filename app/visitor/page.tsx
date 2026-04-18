import { getVisitors, checkoutVisitor, deleteVisitor, confirmVisitorIn } from "@/app/actions/visitors";
import { getParkingFees } from "@/app/actions/parking-fees";
import WebPayQRCode from "@/app/components/WebPayQRCode";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VisitorPage() {
  let visitors: any[] = [];
  let parkingFees: any[] = [];
  
  try {
    visitors = await getVisitors();
    parkingFees = await getParkingFees();
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }

  const calculateFee = (visitor: any) => {
    if (!visitor.check_in_time) return 0;
    const rule = parkingFees.find((f: any) => f.name.includes("ติดต่อ") || f.name.includes("Visitor")) || parkingFees[0];
    if (!rule) return 0;

    let rawFee = 0;
    const bufferMins = rule.buffer_time_minutes || 15;
    const endTime = visitor.check_out_time ? new Date(visitor.check_out_time).getTime() : Date.now();
    const durationMinsNow = Math.floor((endTime - new Date(visitor.check_in_time).getTime()) / 60000);

    if (visitor.e_stamp_date) {
        const M_stamp = Math.floor((new Date(visitor.e_stamp_date).getTime() - new Date(visitor.check_in_time).getTime()) / 60000);
        const freeMins = visitor.e_stamp && rule.free_hours_with_stamp ? rule.free_hours_with_stamp * 60 : 0;
        
        let billableWhenStamped = M_stamp;
        if (freeMins > 0) {
            billableWhenStamped = Math.max(0, M_stamp - freeMins);
        } else if (rule.grace_period_minutes && M_stamp <= rule.grace_period_minutes) {
            billableWhenStamped = 0;
        }

        let entitledMins = freeMins;
        if (rule.grace_period_minutes && entitledMins < rule.grace_period_minutes) {
            entitledMins = rule.grace_period_minutes;
        }

        const rounding = rule.rounding_minutes || 60;
        if (billableWhenStamped > 0) {
            const intervalsPaid = Math.ceil(billableWhenStamped / rounding);
            entitledMins = freeMins + (intervalsPaid * rounding);
        }

        // Compare against duration NOW
        const maxAllowedDuration = entitledMins + bufferMins;
        if (durationMinsNow <= maxAllowedDuration) {
            rawFee = 0; // Completely covered by entitlement + buffer
        } else {
            const overstayMins = durationMinsNow - entitledMins;
            const rateBase = Number(rule.base_hourly_rate) || 0;
            const billableIntervals = Math.ceil(overstayMins / rounding);
            const ratePerInterval = rateBase * (rounding / 60);
            let computedFee = billableIntervals * ratePerInterval;
            if (rule.daily_max_rate && computedFee > rule.daily_max_rate) computedFee = rule.daily_max_rate;
            rawFee = computedFee;
        }
    } else {
        let billableMins = durationMinsNow;
        if (visitor.e_stamp && rule.free_hours_with_stamp) {
            if (billableMins <= rule.free_hours_with_stamp * 60) {
                rawFee = 0;
            } else {
                billableMins -= rule.free_hours_with_stamp * 60;
                rawFee = -1; // compute below
            }
        } else if (rule.grace_period_minutes && billableMins <= rule.grace_period_minutes) {
            rawFee = 0; 
        } else {
             rawFee = -1; // compute below
        }

        if (rawFee === -1) {
            if (billableMins <= 0) {
                rawFee = 0;
            } else {
                const rounding = rule.rounding_minutes || 60;
                const rateBase = Number(rule.base_hourly_rate) || 0;
                const billableIntervals = Math.ceil(billableMins / rounding);
                const ratePerInterval = rateBase * (rounding / 60);

                let computedFee = billableIntervals * ratePerInterval;
                if (rule.daily_max_rate && computedFee > rule.daily_max_rate) computedFee = rule.daily_max_rate;
                rawFee = computedFee;
            }
        }
    }

    const totalPaid = parseFloat(visitor.total_paid || '0');
    // ถ้ามีการ E-Stamp แล้ว (จ่ายแล้ว หรือ ประทับตราแล้ว) rawFee จะคำนวณเฉพาะ "ส่วนเกิน" เริ่มนับจาก e_stamp_date
    // ดังนั้นไม่ต้องนำไปหักลบกับ totalPaid ในอดีตแล้ว (เพราะเป็นบิลรอบใหม่)
    return visitor.e_stamp_date ? rawFee : Math.max(0, rawFee - totalPaid);
  };

  return (
    <div className="min-h-full font-sans selection:bg-purple-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">ข้อมูลผู้มาติดต่อ</h1>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">Visitor</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จดบันทึกการแลกบัตรประชาชน/ใบขับขี่ และบันทึกเวลาเข้า-ออก โครงการ
            </p>
          </div>
          <Link href="/visitor/add" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            บันทึกแลกบัตรเข้าหมู่บ้าน
          </Link>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest leading-relaxed">ข้อมูลผู้ติดต่อ<br/>(ชื่อ / ประเภทบัตร)</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/4">สถานที่ / รถ</th>
                    <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">เวลาเข้า-ออก</th>
                    <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">การจัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {visitors.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">ยังไม่มีข้อมูลผู้มาติดต่อเข้าในระบบ</p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 mb-6">บันทึกข้อมูลและแลกบัตรประชาชนเมื่อมีผู้มาติดต่อเข้าพื้นที่</p>
                            <Link href="/visitor/add" className="text-purple-600 hover:text-purple-700 font-bold border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg transition-colors">
                                + บันทึกผู้มาติดต่อแรก
                            </Link>
                        </div>
                        </td>
                    </tr>
                    ) : (
                    visitors.map((visitor: any) => (
                        <tr key={visitor.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{visitor.full_name}</span>
                                <span className="text-xs text-zinc-500 mt-1">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-400">{visitor.card_type}</span>
                                    {visitor.id_card_number && ` • ${visitor.id_card_number}`}
                                </span>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-sm text-zinc-800 dark:text-zinc-200"><span className="text-zinc-500">บ้าน:</span> {visitor.house_number || '-'}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-zinc-500">
                                        <span className="text-zinc-400">รถ:</span> {visitor.vehicle_plate || '-'}
                                        {visitor.vehicle_province ? ` ${visitor.vehicle_province}` : ''}
                                        {visitor.vehicle_color ? ` (สี${visitor.vehicle_color})` : ''}
                                    </span>
                                    {visitor.image_url && (
                                        <img src={visitor.image_url} alt="Vehicle" className="w-8 h-8 rounded object-cover border border-zinc-200" />
                                    )}
                                </div>
                                {visitor.purpose && (
                                    <span className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium bg-purple-50 dark:bg-purple-900/20 inline-block px-1.5 py-0.5 rounded">ธุระ: {visitor.purpose}</span>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col text-xs space-y-1">
                                {visitor.status === 'PRE' ? (
                                    <span className="text-blue-500 dark:text-blue-400 font-semibold animate-pulse">
                                        (รอเข้าพื้นที่)
                                    </span>
                                ) : visitor.status === 'INVITED' ? (
                                    <span className="text-amber-500 dark:text-amber-400 font-semibold animate-pulse">
                                        (รอลงทะเบียน)
                                    </span>
                                ) : visitor.status === 'CANCELLED' ? (
                                    <span className="text-rose-500 dark:text-rose-400 font-semibold line-through">
                                        (ยกเลิกแล้ว)
                                    </span>
                                ) : visitor.check_in_time ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                        ↓ {new Date(visitor.check_in_time).toLocaleTimeString('th-TH')}
                                    </span>
                                ) : null}
                                {visitor.status === 'OUT' && (
                                    <>
                                        <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                                            ↑ {new Date(visitor.check_out_time).toLocaleTimeString('th-TH')}
                                        </span>
                                        {visitor.check_in_time && visitor.check_out_time && (
                                            <span className="text-xs text-zinc-500 font-medium">
                                                (รวม {(() => {
                                                    const m = Math.floor((new Date(visitor.check_out_time).getTime() - new Date(visitor.check_in_time).getTime())/60000);
                                                    return m >= 60 ? `${Math.floor(m/60)} ชม. ${m%60} นาที` : `${m} นาที`;
                                                })()})
                                            </span>
                                        )}
                                    </>
                                )}
                                {visitor.status === 'IN' && (
                                    <>
                                        <span className="text-rose-500 dark:text-rose-400 animate-pulse font-semibold">
                                            (ยังอยู่ในพื้นที่)
                                        </span>
                                        {visitor.check_in_time && (
                                            <span className="text-xs text-rose-500/70 dark:text-rose-400/70 font-medium">
                                                ระยะเวลา: {(() => {
                                                    const m = Math.floor((Date.now() - new Date(visitor.check_in_time).getTime())/60000);
                                                    return m >= 60 ? `${Math.floor(m/60)} ชม. ${m%60} นาที` : `${m} นาที`;
                                                })()}
                                            </span>
                                        )}
                                        {(() => {
                                            const fee = calculateFee(visitor);
                                            const totalPaid = parseFloat(visitor.total_paid || '0');
                                            
                                            return (
                                                <>
                                                    {fee > 0 ? (
                                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-500/20">
                                                            ค้างชำระ: ฿{fee.toLocaleString()}
                                                        </span>
                                                    ) : visitor.check_in_time ? (
                                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">
                                                            จอดฟรี/เคลียร์ยอดแล้ว
                                                        </span>
                                                    ) : null}
                                                    
                                                    {totalPaid > 0 && (
                                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-500/20 whitespace-nowrap">
                                                            รับชำระแล้ว: ฿{totalPaid.toLocaleString()}
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()}
                                        {visitor.e_stamp ? (
                                            <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                E-Stamped แล้ว
                                            </span>
                                        ) : (
                                            <span className="text-amber-500 dark:text-amber-400 text-xs font-bold leading-tight">
                                                (ยังไม่ประทับตรา)
                                            </span>
                                        )}
                                     </>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2 items-center">
                                
                                {visitor.status === 'PRE' && (() => {
                                    const now = new Date();
                                    let isTooEarly = false;
                                    if (visitor.expected_in_time) {
                                        const exp = new Date(visitor.expected_in_time);
                                        const thaiExp = new Date(exp.getTime() + 7 * 3600000);
                                        const thaiNow = new Date(now.getTime() + 7 * 3600000);
                                        const isSameDay = thaiExp.getUTCDate() === thaiNow.getUTCDate() && thaiExp.getUTCMonth() === thaiNow.getUTCMonth() && thaiExp.getUTCFullYear() === thaiNow.getUTCFullYear();
                                        if (!isSameDay || now.getTime() < exp.getTime()) {
                                            isTooEarly = true;
                                        }
                                    }
                                    return (
                                        <form action={async () => {
                                            "use server";
                                            if (isTooEarly) return; // double check on server side
                                            await confirmVisitorIn(visitor.id);
                                        }}>
                                            <button 
                                                type="submit" 
                                                disabled={isTooEarly}
                                                className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-transform ${isTooEarly ? 'bg-slate-400 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}`}
                                                title={isTooEarly ? "เฉพาะภายในวันและหลังเวลานัดหมายเท่านั้น" : ""}
                                            >
                                                {isTooEarly ? 'ยังไม่ถึงเวลานัด' : 'ยืนยันเข้าพื้นที่'}
                                            </button>
                                        </form>
                                    );
                                })()}
                                {visitor.status === 'IN' && (() => {
                                    const fee = calculateFee(visitor);
                                    const isDisabled = !visitor.e_stamp || fee > 0;
                                    let titleMsg = "";
                                    let btnText = "รับบัตรคืน / ออก";
                                    
                                    if (!visitor.e_stamp) {
                                        titleMsg = "ต้องการ E-Stamp ก่อนจึงจะสามารถออกได้";
                                        btnText = "รอ E-Stamp ออกไม่ได้";
                                    } else if (fee > 0) {
                                        titleMsg = "มียอดค้างชำระค่าจอด หรือเกินเวลากันชน กรุณาชำระเงินก่อน";
                                        btnText = "ค้างชำระ ออกไม่ได้";
                                    }

                                    return (
                                        <form action={async () => {
                                            "use server";
                                            if (isDisabled) return;
                                            await checkoutVisitor(visitor.id);
                                        }}>
                                            <button 
                                                type="submit" 
                                                disabled={isDisabled}
                                                title={titleMsg}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-transform ${isDisabled ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed opacity-70' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105'}`}
                                            >
                                                {btnText}
                                            </button>
                                        </form>
                                    );
                                })()}

                                {parseFloat(visitor.total_paid || '0') > 0 && (
                                    <a href={`/receipt/${visitor.id}`} target="_blank" title="พิมพ์ใบเสร็จ" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 inline-flex border border-transparent">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </a>
                                )}

                                <a href={`/ticket/${visitor.id}`} target="_blank" title="พิมพ์บัตรจอดรถ" className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 inline-flex border border-transparent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                </a>

                                <Link href={`/visitor/${visitor.id}`} title="ดูรายละเอียด" className="text-zinc-400 hover:text-purple-600 dark:hover:text-purple-500 transition-colors p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 inline-flex border border-transparent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </Link>

                                <form action={async () => {
                                "use server";
                                await deleteVisitor(visitor.id);
                                }}>
                                <button type="submit" title="Remove Record" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex border border-transparent">
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
