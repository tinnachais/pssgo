"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function SimulatorClient({ parkingFees, specialDays = [] }: { parkingFees: any[], specialDays?: any[] }) {
  const [selectedFeeId, setSelectedFeeId] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string>("2024-01-01T08:00");
  const [checkOut, setCheckOut] = useState<string>("2024-01-01T12:00");
  const [hasStamp, setHasStamp] = useState<boolean>(false);

  const calculateFee = () => {
    if (!selectedFeeId) return null;
    const rule = parkingFees.find(f => f.id.toString() === selectedFeeId);
    if (!rule) return null;

    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    if (outTime <= inTime) return { error: "เวลาออกต้องมากกว่าเวลาเข้า" };

    const totalMinutes = Math.floor((outTime.getTime() - inTime.getTime()) / 60000);
    const logs: string[] = [];
    let fee = 0;

    logs.push(`เวลาจอดทั้งหมด: ${Math.floor(totalMinutes / 60)} ชม. ${totalMinutes % 60} นาที (${totalMinutes} นาที)`);

    // 0. Applicable Days Check
    if (rule.applicable_days && rule.applicable_days !== 'ALL') {
        const isWeekend = inTime.getDay() === 0 || inTime.getDay() === 6;
        const mm = String(inTime.getMonth() + 1).padStart(2, '0');
        const dd = String(inTime.getDate()).padStart(2, '0');
        const yyyy = inTime.getFullYear();
        const localDateStr = `${yyyy}-${mm}-${dd}`;

        const isSpecialHoliday = specialDays.some(sd => {
            if (!sd.is_active) return false;
            if (sd.is_recurring) {
                return sd.date.includes(`${mm}-${dd}`);
            }
            return sd.date === localDateStr;
        });

        const isHoliday = isWeekend || isSpecialHoliday;

        if (rule.applicable_days === 'NORMAL_ONLY' && isHoliday) {
            logs.push(`กฎค่าจอดรถนี้ใช้เฉพาะวันทำงานปกติ (จันทร์ - ศุกร์) แต่เข้ามาในเวลาวันหยุด -> ไม่คิดเงิน`);
            return { fee: 0, logs };
        }
        
        if (rule.applicable_days === 'HOLIDAY_ONLY' && !isHoliday) {
            logs.push(`กฎค่าจอดรถนี้ใช้เฉพาะวันหยุด (เสาร์-อาทิตย์ และวันหยุดพิเศษ) แต่เข้ามาในเวลาทำงานปกติ -> ไม่คิดเงิน`);
            return { fee: 0, logs };
        }
        
        const dayTypeStr = isHoliday ? "วันหยุด" : "วันทำงานปกติ";
        logs.push(`ตรงเงื่อนไขวันของกฎหมายกำหนด (${dayTypeStr})`);
    }

    // 1. Subscription Check
    if (rule.is_subscription) {
      logs.push(`กฎนี้เป็นแบบรายเดือน (เหมาจ่าย ${rule.monthly_rate} บาท/เดือน) ไม่คิดเป็นรายครั้ง`);
      return { fee: 0, logs };
    }

    // 2. Grace Period
    if (rule.grace_period_minutes && totalMinutes <= rule.grace_period_minutes) {
      logs.push(`จอดฟรี (อยู่ในช่วง Grace Period ${rule.grace_period_minutes} นาทีแรก)`);
      return { fee: 0, logs };
    }

    // 3. E-Stamp deduction
    let chargeableMinutes = totalMinutes;
    if (hasStamp && rule.free_hours_with_stamp) {
      const freeMins = rule.free_hours_with_stamp * 60;
      chargeableMinutes -= freeMins;
      logs.push(`ใช้ E-Stamp: ลดเวลาจอดไป ${rule.free_hours_with_stamp} ชม. (เหลือเวลาคิดเงิน ${Math.max(0, chargeableMinutes)} นาที)`);
      if (chargeableMinutes <= 0) return { fee: 0, logs };
    }

    // 4. Time Rounding
    let chargeableHours = 0;
    if (rule.is_flat_rate) {
       const hoursExact = Math.floor(chargeableMinutes / 60);
       const remainingMins = chargeableMinutes % 60;
       chargeableHours = hoursExact;
       
       const roundingTarget = rule.rounding_minutes || 60; // defaults to round up at > 1 min
       // If remaining minutes exceed the rounding threshold (or is exactly 1 depending on common logic, let's say >= threshold triggers full hour)
       // Usually rounding_minutes means "if fractional minutes > rounding_minutes -> count as 1 hr". Wait, "เกิน 15 นาที ปัดเป็น 1 ชม" means > 15
       if (remainingMins > 0) {
         if (remainingMins > roundingTarget || roundingTarget === 1) { // 1 means >0 is 1hr
           chargeableHours += 1;
           logs.push(`เศษเวลา ${remainingMins} นาที (เกิน ${roundingTarget} นาที) ปัดขึ้นเป็น 1 ชม. -> รวมคิดเงิน ${chargeableHours} ชม.`);
         } else {
           logs.push(`เศษเวลา ${remainingMins} นาที (ไม่เกิน ${roundingTarget} นาที) ปัดทิ้ง -> รวมคิดเงิน ${chargeableHours} ชม.`);
         }
       } else {
           logs.push(`รวมคิดเงิน ${chargeableHours} ชม. พอดี`);
       }
    }

    // 5. Hourly & Tiered Calculation
    if (rule.is_flat_rate) {
       // Hourly fee calculation
       const tiers = Array.isArray(rule.tiered_rates) ? rule.tiered_rates.sort((a: any, b: any) => a.startHour - b.startHour) : [];
       let currentFee = 0;
       
       for (let h = 1; h <= chargeableHours; h++) {
          let rateForThisHour = Number(rule.base_hourly_rate) || 0;
          let method = "อัตราพื้นฐาน";
          
          if (rule.has_tiered_rates) {
             // Find matching tier
             let matchedTier = null;
             for (const t of tiers) {
                if (h >= t.startHour) {
                   matchedTier = t;
                }
             }
             if (matchedTier) {
                 rateForThisHour = Number(matchedTier.rate);
                 method = `ขั้นบันไดชั่วโมงที่ ${matchedTier.startHour}`;
             }
          }

          if (rule.has_time_interval_rates && rule.time_interval_rates && rule.time_interval_rates.length > 0) {
              // Calculate the rough start time of this parking hour
              // Note: For simplicity, we just use the starting minute of this specific hour chunk
              const activeHourTime = new Date(inTime.getTime() + (h - 1) * 3600000);
              const hrStr = activeHourTime.getHours().toString().padStart(2, '0') + ":" + activeHourTime.getMinutes().toString().padStart(2, '0');
              
              for (const interval of rule.time_interval_rates) {
                  const check = hrStr;
                  const st = interval.startTime;
                  const et = interval.endTime;
                  let isInside = false;
                  
                  if (st <= et) {
                      isInside = check >= st && check <= et;
                  } else {
                      // cross midnight intervals (e.g. 18:00 to 06:00)
                      isInside = check >= st || check <= et;
                  }
                  
                  if (isInside) {
                      rateForThisHour = Number(interval.rate);
                      method = `ช่วงเวลา ${st}-${et}`;
                      break; // Priority to the first matched interval
                  }
              }
          }

          currentFee += rateForThisHour;
          logs.push(`- ชั่วโมงที่ ${h}: คิดเงิน ฿${rateForThisHour} [${method}]`);
       }

       // 6. Daily Max Capping
       // Note: A true daily capping calculates per calendar day. For simplicity in simulation, we check total if less than 24 hrs, or chunk by 24h.
       // Here we implement a simple chunking by 24h or simple overall cap depending on logic.
       if (rule.daily_max_rate) {
          const days = Math.ceil(chargeableHours / 24) || 1;
          const maxPossibleFee = days * rule.daily_max_rate;
          if (currentFee > maxPossibleFee) {
             logs.push(`ราคา ${currentFee} บาท เกินเพดานสูงสุดต่อวัน (฿${rule.daily_max_rate}/วัน จำนวน ${days} วัน) -> ปรับลดเหลือ ฿${maxPossibleFee}`);
             currentFee = maxPossibleFee;
          }
       }
       fee += currentFee;
    }

    // 7. Overnight Penalty
    if (rule.has_overnight_penalty && rule.overnight_penalty_rate && rule.overnight_start_time) {
        // very basic logic: check how many nights crossed
        // counting midnights crossed between inTime and outTime
        let penaltyCount = 0;
        let curr = new Date(inTime);
        curr.setHours(0,0,0,0);
        curr.setDate(curr.getDate() + 1); // first midnight
        while (curr < outTime) {
           penaltyCount++;
           curr.setDate(curr.getDate() + 1);
        }

        if (penaltyCount > 0) {
            const extra = penaltyCount * rule.overnight_penalty_rate;
            logs.push(`ตรวจพบข้ามคืน ${penaltyCount} คืน โดนปรับค้างคืนคืนละ ฿${rule.overnight_penalty_rate} -> คิดเพิ่ม ฿${extra}`);
            fee += extra;
        }
    }

    if (!rule.is_flat_rate && !rule.has_overnight_penalty) {
       logs.push(`กฎนี้ไม่ได้เปิดใช้งานคิดเงินรายชั่วโมงและไม่มีค่าปรับข้ามคืน`);
    }

    logs.push(`สรุปราคาสุทธิ: ฿${fee}`);
    return { fee, logs };
  };

  const simulation = calculateFee();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Inputs */}
      <div className="bg-white dark:bg-[#121212] rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800/80">
        <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">เครื่องมือจำลอง (Simulator)</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">เลือกกฎค่าจอดรถ</label>
            <select 
              value={selectedFeeId} onChange={e => setSelectedFeeId(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">-- เลือกรายการ --</option>
              {parkingFees.map(f => (
                 <option key={f.id} value={f.id}>{f.name} (ID: {f.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">เวลาเข้า (In)</label>
              <input 
                type="datetime-local" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold">เวลาออก (Out)</label>
              <input 
                type="datetime-local" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-500/5">
            <input type="checkbox" className="w-5 h-5 text-sky-600 rounded" checked={hasStamp} onChange={e => setHasStamp(e.target.checked)} />
            <div>
              <div className="text-sm font-bold text-sky-900 dark:text-sky-400">ใช้ E-Stamp?</div>
              <div className="text-xs text-sky-700 dark:text-sky-500">จำลองกรณีลูกบ้านสแกนอนุมัติแล้ว</div>
            </div>
          </label>
        </div>
      </div>

      {/* Right: Results */}
      <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-800 text-white relative overflow-hidden flex flex-col h-full min-h-[400px]">
         <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
         
         <h2 className="text-xl font-bold mb-4 z-10 flex items-center gap-2">
           <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
           </svg>
           ผลการคำนวณ
         </h2>

         {!selectedFeeId ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm z-10">
               โปรดเลือกกฎค่าจอดรถเพื่อดูการคำนวณ
            </div>
         ) : simulation?.error ? (
            <div className="flex-1 flex items-center justify-center text-rose-400 text-sm font-semibold z-10">
               {simulation.error}
            </div>
         ) : (
            <div className="z-10 flex flex-col h-full">
               <div className="flex-1 space-y-3 font-mono text-sm mb-6">
                 {(simulation?.logs || []).slice(0, -1).map((log, i) => (
                    <div key={i} className="text-zinc-300 border-l-2 border-zinc-700 pl-3 py-1 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                      {log}
                    </div>
                 ))}
               </div>
               
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center animate-in zoom-in duration-500 delay-500 fill-mode-both">
                 <div className="text-zinc-400 text-sm mb-1 uppercase tracking-widest font-bold">Total Fee</div>
                 <div className="text-5xl font-bold text-amber-400 font-mono tracking-tight">
                    ฿{simulation?.fee?.toLocaleString() || 0}
                 </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
