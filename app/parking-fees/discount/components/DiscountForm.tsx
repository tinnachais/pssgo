"use client";

import { useState } from "react";
import Link from "next/link";

export default function DiscountForm({ 
    action, 
    initialData = null 
}: { 
    action: (formData: FormData) => void, 
    initialData?: any 
}) {
    const [discountType, setDiscountType] = useState<string>(initialData?.discount_type || 'AMOUNT');

    return (
        <form action={action} className="space-y-6 relative z-10">
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                ชื่อส่วนลด <span className="text-rose-500">*</span>
                </label>
                <input
                type="text"
                name="name"
                id="name"
                required
                defaultValue={initialData?.name || ''}
                placeholder="เช่น ประทับตราร้านอาหาร A"
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รูปแบบส่วนลด <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                    <label className={`flex gap-3 px-5 py-3 border rounded-xl cursor-pointer transition-all ${discountType === 'AMOUNT' ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
                        <input type="radio" name="discount_type" value="AMOUNT" checked={discountType === 'AMOUNT'} onChange={() => setDiscountType('AMOUNT')} className="w-5 h-5 text-rose-600 focus:ring-rose-500 dark:focus:ring-rose-600 dark:-white dark:-zinc-800 dark:border-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none mt-0.5">ส่วนลดเป็นมูลค่า (บาท)</span>
                            <span className="text-xs text-zinc-500 mt-1">ใช้หักลบกับค่าจอดรถรวมเป็นจำนวนเงิน</span>
                        </div>
                    </label>
                    <label className={`flex gap-3 px-5 py-3 border rounded-xl cursor-pointer transition-all ${discountType === 'TIME' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'}`}>
                        <input type="radio" name="discount_type" value="TIME" checked={discountType === 'TIME'} onChange={() => setDiscountType('TIME')} className="w-5 h-5 text-amber-600 focus:ring-amber-500 dark:focus:ring-amber-600 dark:-white dark:-zinc-800 dark:border-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none mt-0.5">ส่วนลดเป็นระยะเวลา (นาที)</span>
                            <span className="text-xs text-zinc-500 mt-1">ใช้หักลบกับเวลาจอดก่อนคิดค่าบริการ</span>
                        </div>
                    </label>
                </div>
            </div>
            
            {discountType === 'AMOUNT' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="discount_amount" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    มูลค่าส่วนลด (บาท) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">฿</span>
                        <input
                        type="number"
                        name="discount_amount"
                        id="discount_amount"
                        required={discountType === 'AMOUNT'}
                        step="0.01"
                        min="0"
                        defaultValue={initialData?.discount_amount || ''}
                        placeholder="0.00"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-10 pr-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono"
                        />
                    </div>
                </div>
            )}

            {discountType === 'TIME' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="discount_minutes" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ระยะเวลาส่วนลด (นาที) <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs uppercase tracking-wider">Mins</span>
                        <input
                        type="number"
                        name="discount_minutes"
                        id="discount_minutes"
                        required={discountType === 'TIME'}
                        step="1"
                        min="1"
                        defaultValue={initialData?.discount_minutes || ''}
                        placeholder="เช่น 120 (สำหรับ 2 ชั่วโมง)"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-5 pr-14 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                        />
                    </div>
                </div>
            )}
            
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                รายละเอียดเพิ่มเติม
                </label>
                <textarea
                name="description"
                id="description"
                defaultValue={initialData?.description || ''}
                placeholder="อธิบายเงื่อนไขของส่วนลด..."
                rows={3}
                className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all resize-none"
                />
            </div>
            
            <div className="pt-4 flex items-center gap-3">
                <button
                    type="submit"
                    className={`${initialData ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'} text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md  hover:shadow-lg active:scale-[0.98]`}
                >
                    {initialData ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกข้อมูล'}
                </button>
                <Link href="/parking-fees/discount" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                    ยกเลิก
                </Link>
            </div>
        </form>
    );
}
