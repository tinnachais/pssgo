"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";

export default function AddBillingForm({ sites, activePackages, addProviderRevenue }: { sites: any[], activePackages: any[], addProviderRevenue: any }) {
    const [selectedPackage, setSelectedPackage] = useState("");
    const [selectedSite, setSelectedSite] = useState("");
    const [billingCycle, setBillingCycle] = useState("MONTHLY");
    
    // Auto calculate auto-amount
    let amount = "";
    if (selectedPackage && activePackages && selectedSite) {
        const pkg = activePackages.find(p => p.id.toString() === selectedPackage);
        const site = sites.find(s => s.id.toString() === selectedSite);
        
        if (pkg && site) {
            const basePrice = billingCycle === "YEARLY" ? parseFloat(pkg.yearly_price) : parseFloat(pkg.monthly_price);
            
            // Calculate pro-rated price based on remaining days!
            const now = dayjs();
            if (billingCycle === "YEARLY") {
                const year = now.year();
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const daysInYear = isLeapYear ? 366 : 365;
                const daysRemaining = now.endOf('year').diff(now, 'day') + 1; // including today
                const proRated = (basePrice / daysInYear) * daysRemaining;
                amount = Math.round(proRated).toString(); // Standard THB rounding
            } else {
                const daysInMonth = now.daysInMonth();
                const daysRemaining = now.endOf('month').diff(now, 'day') + 1; // including today
                const proRated = (basePrice / daysInMonth) * daysRemaining;
                amount = Math.round(proRated).toString(); // Standard THB rounding
            }
        }
    }

    return (
        <form action={addProviderRevenue} className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="siteId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สถานที่ที่ชำระเงิน <span className="text-rose-500">*</span>
                    </label>
                    <select
                        name="siteId"
                        id="siteId"
                        required
                        value={selectedSite}
                        onChange={(e) => setSelectedSite(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium appearance-none"
                        style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239BA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1.25rem top 50%", backgroundSize: "0.65rem auto" }}
                    >
                        <option value="">-- เลือกสถานที่ --</option>
                        {sites.map((site: any) => (
                            <option key={site.id} value={site.id}>
                                {site.name} (ผู้มาติดต่อสะสม {site.total_vehicles || 0} คัน)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="packageId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            แพ็กเกจที่ต้องการใช้งาน <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="packageId"
                            id="packageId"
                            required
                            value={selectedPackage}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium appearance-none"
                            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239BA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1.25rem top 50%", backgroundSize: "0.65rem auto" }}
                        >
                            <option value="">-- เลือกแพ็กเกจ --</option>
                            {activePackages.map((pkg: any) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} (จำกัดรถ {pkg.max_vehicles} คัน)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="billingCycle" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            รอบบิล <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="billingCycle"
                            id="billingCycle"
                            required
                            value={billingCycle}
                            onChange={(e) => setBillingCycle(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium appearance-none"
                            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239BA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1.25rem top 50%", backgroundSize: "0.65rem auto" }}
                        >
                            <option value="MONTHLY">รายเดือน (Monthly)</option>
                            <option value="YEARLY">รายปี (Yearly)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            สถานะการชำระเงิน <span className="text-rose-500">*</span>
                        </label>
                        <select
                            name="status"
                            id="status"
                            required
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none"
                            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239BA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1.25rem top 50%", backgroundSize: "0.65rem auto" }}
                        >
                            <option value="PAID">ชำระเงินแล้ว (สร้างใบเสร็จรับเงิน)</option>
                            <option value="PENDING">รอชำระเงิน (สร้างใบแจ้งหนี้)</option>
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="amount" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            ยอดเงินสุทธิ (บาท) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            id="amount"
                            required
                            min="0"
                            placeholder="ระบุตัวเลขยอดเงิน (เพื่อให้ตรงกับราคาแพ็กเกจ)"
                            defaultValue={amount}
                            key={amount}
                            className="w-full rounded-2xl border border-emerald-300 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/10 px-5 py-3.5 text-sm font-black text-emerald-600 dark:text-emerald-400 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                    </div>
                </div>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-1 -mt-2 mb-6">
                    หมายเหตุ: ยอดเงินจะถูกคำนวณแบบ <b>Pro-rate</b> อัตโนมัติ โดยคิดเฉพาะจำนวนวันที่เหลือถึงสิ้นเดือน (หรือปี) สำหรับสถานที่ใหม่/หมดอายุ และระบบจะตั้งวันหมดอายุไปตกที่วันสิ้นเดือนเวลา 23:59 น. เสมอ
                </p>
            </div>
            
            <div className="pt-4 flex items-center gap-3">
                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg active:scale-[0.98]"
                >
                    บันทึกการรับชำระเงิน
                </button>
                <Link
                    href="/provider-revenues"
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3.5 px-8 rounded-xl transition-all"
                >
                    ยกเลิก
                </Link>
            </div>
        </form>
    );
}
