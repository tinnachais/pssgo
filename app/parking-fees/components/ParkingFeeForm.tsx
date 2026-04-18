"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addParkingFee, updateParkingFee } from "@/app/actions/parking-fees";
import Link from "next/link";

export default function ParkingFeeForm({ initialData, parkTypes = [], revenueTypes = [] }: { initialData?: any, parkTypes?: any[], revenueTypes?: any[] }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    revenue_type_id: initialData?.revenue_type_id || "",
    applicable_park_type_ids: initialData?.applicable_park_type_ids || [],
    fee_type: initialData?.fee_type || "GENERAL",
    grace_period_minutes: initialData?.grace_period_minutes || 0,
    free_hours_with_stamp: initialData?.free_hours_with_stamp || 0,
    buffer_time_minutes: initialData?.buffer_time_minutes === undefined ? 15 : initialData.buffer_time_minutes,
    is_flat_rate: initialData?.is_flat_rate || false,
    base_hourly_rate: initialData?.base_hourly_rate || 0,
    has_tiered_rates: initialData?.has_tiered_rates || false,
    tiered_rates: initialData?.tiered_rates || [], // array of { startHour, rate }
    rounding_minutes: initialData?.rounding_minutes || 15,
    daily_max_rate: initialData?.daily_max_rate || "",
    has_overnight_penalty: initialData?.has_overnight_penalty || false,
    overnight_penalty_rate: initialData?.overnight_penalty_rate || "",
    overnight_start_time: initialData?.overnight_start_time || "00:00",
    overnight_end_time: initialData?.overnight_end_time || "06:00",
    is_subscription: initialData?.is_subscription || false,
    monthly_rate: initialData?.monthly_rate || "",
    has_time_interval_rates: initialData?.has_time_interval_rates || false,
    time_interval_rates: initialData?.time_interval_rates || [], // array of { startTime, endTime, rate }
    applicable_days: initialData?.applicable_days || "ALL",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tiered Rates Handlers
  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      tiered_rates: [...prev.tiered_rates, { startHour: prev.tiered_rates.length + 2, rate: 0 }]
    }));
  };

  const handleUpdateTier = (index: number, field: string, value: any) => {
    const newTiers = [...formData.tiered_rates];
    newTiers[index][field] = value === '' ? 0 : Number(value);
    setFormData(prev => ({ ...prev, tiered_rates: newTiers }));
  };

  const handleRemoveTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tiered_rates: prev.tiered_rates.filter((_: any, i: number) => i !== index)
    }));
  };

  // Time Interval Handlers
  const handleAddInterval = () => {
    setFormData(prev => ({
      ...prev,
      time_interval_rates: [...prev.time_interval_rates, { startTime: "18:00", endTime: "06:00", rate: 0 }]
    }));
  };

  const handleUpdateInterval = (index: number, field: string, value: any) => {
    const newIntervals = [...formData.time_interval_rates];
    if (field === 'rate') {
        newIntervals[index][field] = value === '' ? 0 : Number(value);
    } else {
        newIntervals[index][field] = value;
    }
    setFormData(prev => ({ ...prev, time_interval_rates: newIntervals }));
  };

  const handleRemoveInterval = (index: number) => {
    setFormData(prev => ({
      ...prev,
      time_interval_rates: prev.time_interval_rates.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        revenue_type_id: formData.revenue_type_id === "" ? null : Number(formData.revenue_type_id),
        daily_max_rate: formData.daily_max_rate === "" ? null : Number(formData.daily_max_rate),
        overnight_penalty_rate: formData.overnight_penalty_rate === "" ? null : Number(formData.overnight_penalty_rate),
        monthly_rate: formData.monthly_rate === "" ? null : Number(formData.monthly_rate),
      };

      let result;
      if (isEdit) {
        result = await updateParkingFee(initialData.id, payload);
      } else {
        result = await addParkingFee(payload);
      }

      if (result && result.error) {
         alert("Error saving: " + result.error);
         return;
      }
      
      router.push("/parking-fees");
    } catch (err) {
      console.error(err);
      alert("Error saving parking fee config");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-6 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700 pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="space-y-10 relative z-10 text-zinc-800 dark:text-zinc-200">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-900 dark:text-white">ข้อมูลพื้นฐาน</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">ชื่อรายการเก็บเงิน <span className="text-rose-500">*</span></label>
              <input
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="เช่น ผู้มาติดต่อทั่วไป, ลูกบ้านรายเดือน"
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold">ประเภทค่าบริการ (อ้างอิงภายใน)</label>
              <select 
                value={formData.fee_type} onChange={e => setFormData({...formData, fee_type: e.target.value})}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              >
                <option value="GENERAL">ทั่่วไป (ผู้มาติดต่อ)</option>
                <option value="VIP">VIP</option>
                <option value="DELIVERY">ขนส่ง / Delivery</option>
                <option value="TAXI">แท็กซี่ (Drop-off)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">ผูกกับประเภทรายได้ (Revenue Type) <span className="text-zinc-500 font-normal text-xs">(ตัวเลือก)</span></label>
              <select 
                value={formData.revenue_type_id} onChange={e => setFormData({...formData, revenue_type_id: e.target.value})}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              >
                <option value="">-- ไม่ระบุ (บันทึกเข้าระบบจอดรถปกติ) --</option>
                {revenueTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold flex items-center gap-2">เงื่อนไขวันหยุดพิเศษ <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] rounded-full uppercase tracking-widest">New</span></label>
              <select 
                value={formData.applicable_days} onChange={e => setFormData({...formData, applicable_days: e.target.value})}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              >
                <option value="ALL">ใช้งานทุกวัน (ค่าเริ่มต้น)</option>
                <option value="NORMAL_ONLY">เฉพาะวันทำงานปกติ (จันทร์ - ศุกร์)</option>
                <option value="HOLIDAY_ONLY">เฉพาะวันเสาร์-อาทิตย์ และวันหยุดพิเศษ</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="block text-sm font-semibold">ใช้กับประเภทรถ/การจอด (Park Types) <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                {parkTypes.map(pt => (
                  <label key={pt.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={formData.applicable_park_type_ids.includes(pt.id)}
                        onChange={(e) => {
                          const ids = [...formData.applicable_park_type_ids];
                          if (e.target.checked) {
                            ids.push(pt.id);
                          } else {
                            const idx = ids.indexOf(pt.id);
                            if (idx > -1) ids.splice(idx, 1);
                          }
                          setFormData({...formData, applicable_park_type_ids: ids});
                        }}
                        className="w-5 h-5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 transition-all cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {pt.name}
                    </span>
                  </label>
                ))}
                {parkTypes.length === 0 && <p className="col-span-full text-xs text-zinc-500 italic">กรุณาเพิ่มประเภทพการจอดที่เมนูตั้งค่าก่อน</p>}
              </div>
              <p className="text-[10px] text-zinc-500 italic">* ระบุกฎเกณฑ์นี้ให้มีผลเฉพาะกับประเภทการจอดที่เลือก</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold">คำอธิบายรายละเอียด</label>
            <textarea
              rows={2}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="เช่น จอดฟรี 30 นาทีแรก เพื่ออำนวยความสะดวกให้ Delivery"
              className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
            ></textarea>
          </div>
        </div>

        {/* Section 2: Grace Period / Stamp */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-900 dark:text-white">ให้เวลาจอดฟรี (Grace Period / E-Stamp)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-amber-50/50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/10">
              <label className="block text-sm font-semibold text-amber-900 dark:text-amber-400">จอดฟรี (X นาทีแรก)</label>
              <p className="text-xs text-amber-700/70 dark:text-amber-500/70 mb-3">เมื่อขับรถเข้ามา จะได้ให้เวลาเข้าออกฟรี</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" value={formData.grace_period_minutes} onChange={e => setFormData({...formData, grace_period_minutes: Number(e.target.value)})}
                  className="w-full rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-zinc-800/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
                <span className="text-sm font-bold text-amber-800 dark:text-amber-500">นาที</span>
              </div>
            </div>

            <div className="space-y-2 bg-sky-50/50 dark:bg-sky-500/5 p-4 rounded-2xl border border-sky-100 dark:border-sky-500/10">
              <label className="block text-sm font-semibold text-sky-900 dark:text-sky-400">เมื่อ E-Stamp (ได้จอดฟรี X ชั่วโมง)</label>
              <p className="text-xs text-sky-700/70 dark:text-sky-500/70 mb-3">เมื่อลูกบ้านสแกน QR อนุมัติการเข้าพบ</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" value={formData.free_hours_with_stamp} onChange={e => setFormData({...formData, free_hours_with_stamp: Number(e.target.value)})}
                  className="w-full rounded-xl border border-sky-200 dark:border-sky-900/50 bg-white dark:bg-zinc-800/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                />
                <span className="text-sm font-bold text-sky-800 dark:text-sky-500">ชั่วโมง</span>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2 bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
              <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-400">เวลากันชนออกพื้นที่ (Buffer Time)</label>
              <p className="text-xs text-indigo-700/70 dark:text-indigo-500/70 mb-3">เมื่อประทับตรา E-Stamp หรือชำระเงินค่าจอดรถแล้ว ต้องนำรถออกภายในกี่นาที หากเกินจะคิดค่าปรับล่วงเวลา (แนะนำ: 15-30 นาที)</p>
              <div className="flex items-center gap-2 md:w-1/2">
                <input
                  type="number" min="0" value={formData.buffer_time_minutes} onChange={e => setFormData({...formData, buffer_time_minutes: Number(e.target.value)})}
                  className="w-full rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-zinc-800/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-500">นาที</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Hourly Fees */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">คิดเงินรายชั่วโมง (Hourly Rate)</h2>
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <input type="checkbox" className="w-4 h-4 text-amber-600 rounded" checked={formData.is_flat_rate} onChange={e => setFormData({...formData, is_flat_rate: e.target.checked})} />
              <span className="text-sm font-bold">เปิดใช้งานเก็บเงิน</span>
            </label>
          </div>

          {formData.is_flat_rate && (
            <div className="bg-zinc-50 dark:bg-[#1A1A1A] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 animate-in fade-in zoom-in duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2">อัตราพื้นฐานชั่วโมงละ (บาท)</label>
                  <input
                    type="number" min="0" value={formData.base_hourly_rate} onChange={e => setFormData({...formData, base_hourly_rate: Number(e.target.value)})}
                    className="w-full text-xl font-bold rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                  <p className="text-xs text-zinc-500 mt-2">อัตราคงที่ หากยังไม่ถึงขั้นบันได (ด้านขวา)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">ปัดเศษเวลา (Time Rounding)</label>
                  <select 
                    value={formData.rounding_minutes} onChange={e => setFormData({...formData, rounding_minutes: Number(e.target.value)})}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  >
                    <option value={1}>คิดตามนาทีจริง เศษปัดขึ้น</option>
                    <option value={15}>เกิน 15 นาที ปัดเป็น 1 ชั่วโมงเต็ม</option>
                    <option value={30}>เกิน 30 นาที ปัดเป็น 1 ชั่วโมงเต็ม</option>
                    <option value={60}>เศษนาที ปัดเป็น 1 ชั่วโมงเต็มทันที</option>
                  </select>
                </div>
              </div>

              {/* Tiered Rate Toggle */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input type="checkbox" className="w-4 h-4 text-amber-600 rounded" checked={formData.has_tiered_rates} onChange={e => setFormData({...formData, has_tiered_rates: e.target.checked})} />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">ใช้อัตราก้าวหน้า (Tiered Hourly) แบบขั้นบันได ตามจำนวนชั่วโมงที่จอด</span>
                </label>

                {formData.has_tiered_rates && (
                  <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
                    <p className="text-xs text-zinc-500">ตัวอย่าง: เพื่อป้องกันรถมาจอดแช่ เช่น ชั่วโมงที่ 4 เป็นต้นไป คิดร้อยละ 50</p>
                    {formData.tiered_rates.map((tier: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <span className="text-sm font-semibold pl-2">ตั้งแต่ชั่วโมงที่</span>
                        <input type="number" min="2" value={tier.startHour} onChange={e => handleUpdateTier(index, 'startHour', e.target.value)} className="w-20 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-white dark:bg-zinc-800" />
                        <span className="text-sm font-semibold">คิดราคา</span>
                        <input type="number" min="0" value={tier.rate} onChange={e => handleUpdateTier(index, 'rate', e.target.value)} className="w-24 text-right rounded-lg border border-amber-300 dark:border-amber-700 px-2 py-1 text-sm bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-500 font-bold" />
                        <span className="text-sm font-semibold text-zinc-500">บาท/ชม.</span>
                        <button type="button" onClick={() => handleRemoveTier(index)} className="ml-auto text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddTier} className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                      + เพิ่มขั้นบันได
                    </button>
                  </div>
                )}
              </div>

              {/* Time Interval Rate Toggle (Day/Night shifting) */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" checked={formData.has_time_interval_rates} onChange={e => setFormData({...formData, has_time_interval_rates: e.target.checked})} />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">ใช้อัตราแปรผันตามช่วงเวลา (เช่น แยกเรทกลางวัน-กลางคืน)</span>
                </label>

                {formData.has_time_interval_rates && (
                  <div className="space-y-3 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">กำหนดช่วงเวลาที่อัตราค่าจอดรถเปลี่ยนไปจากอัตราพื้นฐาน</p>
                    {formData.time_interval_rates.map((interval: any, index: number) => (
                      <div key={index} className="flex items-center flex-wrap gap-3 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">ช่วง</span>
                            <input type="time" value={interval.startTime} onChange={e => handleUpdateInterval(index, 'startTime', e.target.value)} className="w-24 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-900" />
                            <span className="text-xs text-zinc-400">-</span>
                            <input type="time" value={interval.endTime} onChange={e => handleUpdateInterval(index, 'endTime', e.target.value)} className="w-24 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-900" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold ml-2">คิดราคา</span>
                            <input type="number" min="0" value={interval.rate} onChange={e => handleUpdateInterval(index, 'rate', e.target.value)} className="w-20 text-right rounded-lg border border-emerald-300 dark:border-emerald-600 px-2 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold" />
                            <span className="text-xs font-semibold text-zinc-500">บาท/ชม.</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveInterval(index)} className="ml-auto text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddInterval} className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      + เพิ่มช่วงเวลา
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Daily Max & Overnight Penalty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2 text-zinc-900 dark:text-white">เพดานเหมาจ่ายรายวัน (Daily Max Rate)</h2>
            <div className="space-y-2 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
              <label className="block text-sm font-semibold text-emerald-900 dark:text-emerald-400">ราคาสูงสุดต่อวัน (บาท)</label>
              <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70 mb-3">เว้นว่างไว้ หากไม่มีการคิดแบบเหมาจ่ายสูงสุด</p>
              <input
                type="number" min="0" value={formData.daily_max_rate} onChange={e => setFormData({...formData, daily_max_rate: e.target.value})}
                placeholder="เช่น 200"
                className="w-full text-lg font-bold rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-zinc-800/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">ค่าปรับจอดค้างคืน (Overnight Penalty)</h2>
              <input type="checkbox" className="w-4 h-4 text-rose-600 rounded" checked={formData.has_overnight_penalty} onChange={e => setFormData({...formData, has_overnight_penalty: e.target.checked})} />
            </div>
            
            {formData.has_overnight_penalty && (
              <div className="space-y-4 bg-rose-50/50 dark:bg-rose-500/5 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/10 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">เวลาเริ่ม</label>
                    <input type="time" value={formData.overnight_start_time} onChange={e => setFormData({...formData, overnight_start_time: e.target.value})} className="w-full rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-zinc-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">เวลาสิ้นสุด</label>
                    <input type="time" value={formData.overnight_end_time} onChange={e => setFormData({...formData, overnight_end_time: e.target.value})} className="w-full rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-zinc-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-rose-900 dark:text-rose-400">ค่าปรับต่อคืน (บาท/คืน)</label>
                  <input type="number" min="0" value={formData.overnight_penalty_rate} onChange={e => setFormData({...formData, overnight_penalty_rate: e.target.value})} placeholder="เหมาจ่าย เช่น 500" className="mt-2 w-full text-lg font-bold rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-zinc-800/50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Member Subscription */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">แบบสมาชิก / รายเดือน (Subscription)</h2>
            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" checked={formData.is_subscription} onChange={e => setFormData({...formData, is_subscription: e.target.checked})} />
          </div>

          {formData.is_subscription && (
            <div className="space-y-4 bg-purple-50/50 dark:bg-purple-500/5 p-4 rounded-2xl border border-purple-100 dark:border-purple-500/10 animate-in fade-in duration-300">
              <label className="block text-sm font-semibold text-purple-900 dark:text-purple-400">เหมาจ่ายรายเดือน (บาท/เดือน)</label>
              <p className="text-xs text-purple-700/70 dark:text-purple-500/70 mb-3">เช่น ค่าเช่าที่จอดรถคันที่ 2 ของลูกบ้าน เดือนละ 1000 บาท</p>
              <input
                type="number" min="0" value={formData.monthly_rate} onChange={e => setFormData({...formData, monthly_rate: e.target.value})}
                placeholder="เช่น 1500"
                className="w-1/2 text-lg font-bold rounded-xl border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-zinc-800/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
              />
            </div>
          )}
        </div>

        <div className="pt-8 mb-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <Link href="/parking-fees" className="py-3 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                ยกเลิก
            </Link>
            <button
                type="submit" disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-amber-600/20 hover:shadow-lg active:scale-[0.98] flex items-center gap-2"
            >
                {isSubmitting ? (
                  <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                  </>
                ) : 'บันทึกอัตราค่าบริการ'}
            </button>
        </div>

      </form>
    </div>
  );
}
