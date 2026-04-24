import { getVisitor } from "@/app/actions/visitors";
import { query } from "@/lib/db";
import { getPublicParkingFees } from "@/app/actions/parking-fees";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function WebPayPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const visitorId = parseInt(resolvedParams.id, 10);
    if (isNaN(visitorId)) return notFound();

    const visitor = await getVisitor(visitorId);
    if (!visitor) return notFound();

    let siteName = "GP";
    let effectiveSiteId = visitor.site_id;

    if (!effectiveSiteId && visitor.house_number) {
        const joinRes = await query("SELECT r.site_id, s.name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 LIMIT 1", [visitor.house_number]);
        if (joinRes.rows.length > 0) {
            effectiveSiteId = joinRes.rows[0].site_id;
            if (joinRes.rows[0].name) {
                siteName = joinRes.rows[0].name;
            }
        }
    } else if (effectiveSiteId) {
        const siteRes = await query("SELECT name FROM sites WHERE id = $1", [effectiveSiteId]);
        if (siteRes.rows.length > 0) {
            siteName = siteRes.rows[0].name;
        }
    }

    const parkingFees = await getPublicParkingFees(effectiveSiteId);
    
    // Calculate fee exactly the same as in guard UI
    const calculateFeeData = () => {
        if (!visitor.check_in_time) return { fee: 0, maxAllowedDuration: 0, exitByTime: null, rule: null };
        const rule = parkingFees.find((f: any) => f.name.includes("à¸•à¸´à¸”à¸•à¹ˆà¸­") || f.name.includes("Visitor")) || parkingFees[0];
        if (!rule) return { fee: 0, maxAllowedDuration: 0, exitByTime: null, rule: null };

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

            const maxAllowedDuration = entitledMins + bufferMins;
            const exitTime = new Date(new Date(visitor.check_in_time).getTime() + maxAllowedDuration * 60000);

            if (durationMinsNow <= maxAllowedDuration) {
                return { fee: 0, maxAllowedDuration, exitByTime: exitTime, rule };
            } else {
                const overstayMins = durationMinsNow - entitledMins;
                const rateBase = Number(rule.base_hourly_rate) || 0;
                const billableIntervals = Math.ceil(overstayMins / rounding);
                const ratePerInterval = rateBase * (rounding / 60);
                let computedFee = billableIntervals * ratePerInterval;
                const maxRate = Number(rule.daily_max_rate) || 0;
                if (maxRate > 0 && computedFee > maxRate) computedFee = maxRate;
                return { fee: computedFee, maxAllowedDuration, exitByTime: exitTime, rule };
            }
        } else {
            let billableMins = durationMinsNow;
            
            if (visitor.e_stamp && rule.free_hours_with_stamp) {
                if (billableMins <= rule.free_hours_with_stamp * 60) return { fee: 0, maxAllowedDuration: 0, exitByTime: null, rule };
                billableMins -= rule.free_hours_with_stamp * 60;
            } else if (rule.grace_period_minutes && billableMins <= rule.grace_period_minutes) {
                return { fee: 0, maxAllowedDuration: 0, exitByTime: null, rule };
            }

            if (billableMins <= 0) return { fee: 0, maxAllowedDuration: 0, exitByTime: null, rule };

            const rounding = rule.rounding_minutes || 60;
            const rateBase = Number(rule.base_hourly_rate) || 0;
            const billableIntervals = Math.ceil(billableMins / rounding);
            
            const ratePerInterval = rateBase * (rounding / 60);

            let computedFee = billableIntervals * ratePerInterval;
            const maxRate = Number(rule.daily_max_rate) || 0;
            if (maxRate > 0 && computedFee > maxRate) computedFee = maxRate;
            return { fee: computedFee, maxAllowedDuration: 0, exitByTime: null, rule };
        }
    };

    let { fee: rawFee, exitByTime, rule } = calculateFeeData();

    await query("ALTER TABLE revenues ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL");
    
    // à¸«à¸²à¸¢à¸­à¸”à¸—à¸µà¹ˆà¹€à¸„à¸¢à¸ˆà¹ˆà¸²à¸¢à¹„à¸›à¹à¸¥à¹‰à¸§ (à¸–à¹‰à¸²à¸¡à¸µà¸ˆà¹ˆà¸²à¸¢à¸«à¸¥à¸²à¸¢à¸£à¸­à¸šà¸«à¸£à¸·à¸­ WebPay à¹„à¸›à¹à¸¥à¹‰à¸§)
    const paidRes = await query("SELECT id, amount, created_at, receipt_no FROM revenues WHERE payment_status = 'PAID' AND visitor_id = $1 ORDER BY created_at DESC", [visitorId]);
    const paidReceipts = paidRes.rows;
    const totalPaid = paidReceipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    // à¸–à¹‰à¸²à¸¡à¸µà¸à¸²à¸£ E-Stamp à¹à¸¥à¹‰à¸§ (à¸ˆà¹ˆà¸²à¸¢à¹à¸¥à¹‰à¸§ à¸«à¸£à¸·à¸­ à¸›à¸£à¸°à¸—à¸±à¸šà¸•à¸£à¸²à¹à¸¥à¹‰à¸§) rawFee à¸ˆà¸°à¸„à¸³à¸™à¸§à¸“à¹€à¸‰à¸žà¸²à¸° "à¸ªà¹ˆà¸§à¸™à¹€à¸à¸´à¸™" à¹€à¸£à¸´à¹ˆà¸¡à¸™à¸±à¸šà¸ˆà¸²à¸ e_stamp_date
    // à¸”à¸±à¸‡à¸™à¸±à¹‰à¸™à¹„à¸¡à¹ˆà¸•à¹‰à¸­à¸‡à¸™à¸³à¹„à¸›à¸«à¸±à¸à¸¥à¸šà¸à¸±à¸š totalPaid à¹ƒà¸™à¸­à¸”à¸µà¸•à¹à¸¥à¹‰à¸§ (à¹€à¸žà¸£à¸²à¸°à¹€à¸›à¹‡à¸™à¸šà¸´à¸¥à¸£à¸­à¸šà¹ƒà¸«à¸¡à¹ˆ)
    let fee = visitor.e_stamp_date ? rawFee : Math.max(0, rawFee - totalPaid);

    // KIOSK AUTO-CHECKOUT LOGIC: If checking WebPay yields 0 fee, but they are lacking e_stamp_date (not stamped yet)
    // we explicitly grant them the time they stayed + buffer limit automatically by updating the DB!
    if (fee === 0 && !visitor.e_stamp_date && visitor.check_in_time) {
        // à¸­à¸±à¸›à¹€à¸”à¸•à¹€à¸‰à¸žà¸²à¸° e_stamp_date à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸Šà¹‰à¹€à¸à¹‡à¸šà¹€à¸›à¹‡à¸™à¹€à¸§à¸¥à¸²à¹€à¸£à¸´à¹ˆà¸¡à¸™à¸±à¸š Buffer Time à¹‚à¸”à¸¢à¹„à¸¡à¹ˆà¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸„à¹ˆà¸² e_stamp (à¹€à¸žà¸£à¸²à¸°à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆà¸à¸²à¸£à¸›à¸£à¸°à¸—à¸±à¸šà¸•à¸£à¸²à¸ˆà¸²à¸à¸œà¸¹à¹‰à¹€à¸Šà¹ˆà¸²/à¸£à¹‰à¸²à¸™/à¸šà¸£à¸´à¸©à¸±à¸—)
        await query("UPDATE visitors SET e_stamp_date = CURRENT_TIMESTAMP WHERE id = $1", [visitorId]);
        visitor.e_stamp_date = new Date(); // Re-assign for local re-calculation
        const recalcData = calculateFeeData();
        fee = recalcData.fee;
        exitByTime = recalcData.exitByTime;
        rule = recalcData.rule;
    }

    const handlePayment = async (formData: FormData) => {
        "use server";
        const method = formData.get("method") as string;
        
        let receiptNo = "RC-WEB-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
            const siteIdStr = (effectiveSiteId || 0).toString().padStart(5, '0');
            const now = new Date();
            const yearStr = now.getFullYear().toString();
            const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
            const prefix = `${siteIdStr}${yearStr}${monthStr}`;
            
            const maxRes = await query(`SELECT MAX(receipt_no) as max_no FROM revenues WHERE receipt_no LIKE $1`, [prefix + '%']);
            let runningNoNum = 1;
            if (maxRes.rows[0]?.max_no) {
                const maxNo = maxRes.rows[0].max_no as string;
                const last6 = maxNo.slice(-6);
                const parsed = parseInt(last6, 10);
                if (!isNaN(parsed)) {
                    runningNoNum = parsed + 1;
                }
            }
            receiptNo = `${prefix}${runningNoNum.toString().padStart(6, '0')}`;
        } catch (e) {
            console.error("Failed to generate formatted receipt no", e);
        }
        
        await query(`
            INSERT INTO revenues (site_id, receipt_no, license_plate, description, amount, payment_method, payment_status, visitor_id, type_id)
            VALUES ($1, $2, $3, $4, $5, $6, 'PAID', $7, $8)
        `, [effectiveSiteId || null, receiptNo, visitor.vehicle_plate || 'UNKNOWN', 'à¸Šà¸³à¸£à¸°à¸„à¹ˆà¸²à¸ˆà¸­à¸”à¸£à¸– (WebPay)', fee, method, visitorId, rule?.revenue_type_id || null]);

        // à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¹„à¸¡à¹ˆà¹€à¸›à¹‡à¸™à¸à¸²à¸£ E-Stamp (à¸ˆà¸°à¸šà¸±à¸™à¸—à¸¶à¸à¹à¸„à¹ˆ e_stamp_date à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸™à¸±à¸šà¹€à¸§à¸¥à¸²à¸à¸±à¸™à¸Šà¸™à¸­à¸­à¸à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ)
        await query("UPDATE visitors SET e_stamp_date = CURRENT_TIMESTAMP WHERE id = $1", [visitorId]);

        revalidatePath(`/webpay/${visitorId}`);
    };

    const isPaidOutright = totalPaid > 0 && fee === 0;
    const endTimeForDisplay = visitor.check_out_time ? new Date(visitor.check_out_time).getTime() : Date.now();
    const durationMins = visitor.check_in_time ? Math.floor((endTimeForDisplay - new Date(visitor.check_in_time).getTime()) / 60000) : 0;
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col pt-6 px-4">
            <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex flex-col items-center justify-center text-white text-center">
                    <div className="flex items-center">
                        <div className="shrink-0 mr-4">
                            <Image 
                                src="/logo.png" 
                                alt="GP Logo" 
                                width={24}
                                height={24}
                                unoptimized
                                className="object-contain drop-shadow-sm"
                            />
                        </div>
                        <h1 className="text-lg font-black flex items-center tracking-tight gap-1.5">
                            GP <span className="font-medium text-white/50">|</span> Pay
                        </h1>
                    </div>
                    <p className="text-blue-100/90 text-[11px] font-medium tracking-wide mt-0.5">à¸Šà¸³à¸£à¸°à¸„à¹ˆà¸²à¸šà¸£à¸´à¸à¸²à¸£à¸¥à¸²à¸™à¸ˆà¸­à¸”à¸£à¸–à¸­à¸­à¸™à¹„à¸¥à¸™à¹Œ</p>
                </div>
                <div className="bg-indigo-700/5 px-4 py-2 border-b border-slate-100 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-900/70 shadow-inner">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <span className="opacity-70 font-medium">à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ:</span> {siteName}
                </div>
                
                <div className="p-5">
                    <div className="flex flex-col items-center mb-5">
                        {/* Thai License Plate styling */}
                        <div className="relative bg-white border-2 border-slate-900 rounded-lg shadow-md flex flex-col items-center justify-center w-[220px] h-[85px] mb-2 overflow-hidden bg-gradient-to-b from-white to-slate-50">
                            {/* Inner Pressed Metal Border */}
                            <div className="absolute inset-1 border border-slate-300/60 rounded pointer-events-none"></div>
                            
                            {/* Screws */}
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner flex items-center justify-center pointer-events-none">
                                <div className="w-full h-[1px] bg-slate-400 rotate-45"></div>
                            </div>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner flex items-center justify-center pointer-events-none">
                                <div className="w-full h-[1px] bg-slate-400 -rotate-12"></div>
                            </div>

                            {/* Plate Number */}
                            <div className="text-3xl font-black text-slate-800 tracking-[0.05em] drop-shadow-sm font-sans z-10">
                                {visitor.vehicle_plate || "à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸"}
                            </div>
                            
                            {/* Province */}
                            <div className="text-[11px] font-bold text-slate-700 tracking-widest mt-0.5 z-10 font-sans">
                                {visitor.vehicle_province || "à¸à¸£à¸¸à¸‡à¹€à¸—à¸žà¸¡à¸«à¸²à¸™à¸„à¸£"}
                            </div>
                        </div>

                        {/* Car Color Tag */}
                        {visitor.vehicle_color && (
                            <div className="bg-slate-100/80 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-inner tracking-wide flex items-center gap-1 uppercase mt-1">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4.28a2 2 0 011.897 1.368L13 10m0 0l-3 3m3-3l5 5m-5-5l5-5" /></svg>
                                à¸ªà¸µ{visitor.vehicle_color}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5 mb-5">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">à¹€à¸§à¸¥à¸²à¹€à¸‚à¹‰à¸²à¸ˆà¸­à¸”</span>
                            <span className="font-semibold text-slate-800 text-sm">
                                {visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleString('th-TH') : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">à¸£à¸°à¸¢à¸°à¹€à¸§à¸¥à¸²à¸—à¸µà¹ˆà¸ˆà¸­à¸”à¹„à¸›à¹à¸¥à¹‰à¸§</span>
                            <span className="font-semibold text-slate-800 text-sm">
                                {hours > 0 ? `${hours} à¸Šà¸¡. ` : ''}{mins} à¸™à¸²à¸—à¸µ
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-xs">à¸ªà¸–à¸²à¸™à¸° E-Stamp</span>
                            {visitor.e_stamp ? (
                                <span className="font-bold text-emerald-600 flex items-center gap-1 text-xs">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    à¸›à¸£à¸°à¸—à¸±à¸šà¸•à¸£à¸²à¹à¸¥à¹‰à¸§
                                </span>
                            ) : (
                                <span className="font-bold text-amber-500 text-xs">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸›à¸£à¸°à¸—à¸±à¸šà¸•à¸£à¸²</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-5 text-center border border-slate-100 shadow-inner relative overflow-hidden">
                        {isPaidOutright && (
                           <div className="absolute -right-8 top-4 bg-emerald-500 text-white text-[10px] font-bold py-0.5 px-10 rotate-45">
                               PAID
                           </div>
                        )}
                        <div className="text-slate-500 text-xs mb-1.5">à¸¢à¸­à¸”à¸Šà¸³à¸£à¸°à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”</div>
                        <div className={`text-4xl font-black font-mono ${fee === 0 ? 'text-emerald-500' : 'text-rose-600'}`}>
                            à¸¿{fee.toLocaleString()}
                        </div>
                        {fee === 0 && !isPaidOutright && (
                            <div className="text-emerald-500 text-[11px] font-bold mt-1.5 bg-emerald-50 inline-block px-2.5 py-1 rounded-full border border-emerald-100">
                                à¸ˆà¸­à¸”à¸Ÿà¸£à¸µ / à¸£à¸§à¸¡à¸ªà¸´à¸—à¸˜à¸´à¹Œà¸ªà¹ˆà¸§à¸™à¸¥à¸”à¹à¸¥à¹‰à¸§
                            </div>
                        )}
                        {isPaidOutright && (
                            <div className="flex flex-col items-center gap-1.5 mt-2">
                                <div className="text-emerald-600 text-[11px] font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm animate-pulse">
                                    âœ… à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ
                                </div>
                                {paidReceipts.map((receipt) => (
                                    <a key={receipt.id} href={`/receipt/${receipt.id}`} target="_blank" className="text-blue-600 text-[12px] font-bold flex items-center gap-1 mt-1 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm w-full justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        à¸”à¸¹à¹ƒà¸šà¹€à¸ªà¸£à¹‡à¸ˆ {receipt.receipt_no}
                                    </a>
                                ))}
                            </div>
                        )}
                        
                        {fee === 0 && exitByTime && (
                            <div className="mt-3.5 p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-lg border border-sky-200 dark:border-sky-500/20 text-left">
                                <p className="text-sky-800 dark:text-sky-400 text-xs font-semibold mb-1">à¹€à¸§à¸¥à¸²à¸à¸³à¸«à¸™à¸”à¸­à¸­à¸ (Exit By)</p>
                                <p className="text-sky-700 dark:text-sky-300 text-[11px]">
                                    à¸™à¸³à¸£à¸–à¸­à¸­à¸à¸ à¸²à¸¢à¹ƒà¸™à¹€à¸§à¸¥à¸² <span className="font-bold text-[13px] text-rose-600 dark:text-rose-400 mx-1 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-rose-100">{exitByTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} à¸™.</span>
                                    à¹€à¸žà¸·à¹ˆà¸­à¹€à¸¥à¸µà¹ˆà¸¢à¸‡à¸„à¹ˆà¸²à¸ˆà¸­à¸”à¸ªà¹ˆà¸§à¸™à¹€à¸žà¸´à¹ˆà¸¡
                                </p>
                            </div>
                        )}

                        {totalPaid > 0 && fee > 0 && (
                            <div className="text-amber-500 text-[11px] font-bold mt-2">
                                (à¸«à¸±à¸à¸¢à¸­à¸”à¸—à¸µà¹ˆà¸Šà¸³à¸£à¸°à¹„à¸›à¹à¸¥à¹‰à¸§ à¸¿{totalPaid.toLocaleString()})
                            </div>
                        )}
                        {!isPaidOutright && paidReceipts.length > 0 && (
                            <div className="flex flex-col items-center gap-1.5 mt-3">
                                {paidReceipts.map((receipt) => (
                                    <a key={receipt.id} href={`/receipt/${receipt.id}`} target="_blank" className="text-blue-600 text-[12px] font-bold flex items-center gap-1 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm w-full justify-center">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        à¸”à¸¹à¹ƒà¸šà¹€à¸ªà¸£à¹‡à¸ˆ {receipt.receipt_no}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {fee > 0 ? (
                        <div className="space-y-2">
                            <form action={handlePayment}>
                                <input type="hidden" name="method" value="CREDIT_CARD" />
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    à¸Šà¸³à¸£à¸°à¸”à¹‰à¸§à¸¢à¸šà¸±à¸•à¸£à¹€à¸„à¸£à¸”à¸´à¸•/à¹€à¸”à¸šà¸´à¸•
                                </button>
                            </form>
                            <form action={handlePayment}>
                                <input type="hidden" name="method" value="PROMPTPAY" />
                                <button type="submit" className="w-full bg-[#113566] hover:bg-[#0a2347] text-white text-sm font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                                    à¸ªà¹à¸à¸™à¸ˆà¹ˆà¸²à¸¢à¸”à¹‰à¸§à¸¢ PromptPay (QR Code)
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-pulse bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                            <p className="text-emerald-700 text-sm font-bold">à¸ªà¸²à¸¡à¸²à¸£à¸–à¸‚à¸±à¸šà¸£à¸–à¸­à¸­à¸à¸ˆà¸²à¸à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¹„à¸”à¹‰à¹€à¸¥à¸¢ ðŸš—</p>
                            <p className="text-emerald-600/80 text-[11px] mt-0.5">à¸‚à¸­à¸šà¸„à¸¸à¸“à¸—à¸µà¹ˆà¸¡à¸²à¹€à¸¢à¸µà¹ˆà¸¢à¸¡à¹€à¸¢à¸µà¸¢à¸™à¸à¸£à¸¸à¸“à¸²à¸‚à¸±à¸šà¸‚à¸µà¹ˆà¸­à¸¢à¹ˆà¸²à¸‡à¸›à¸¥à¸­à¸”à¸ à¸±à¸¢</p>
                        </div>
                    )}
                </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-4 pb-4">
                GP &copy; Powered by PSS
            </p>
        </div>
    );
}

