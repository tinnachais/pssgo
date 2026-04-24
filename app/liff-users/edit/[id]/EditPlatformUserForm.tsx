"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePlatformUser } from "@/app/actions/residents";
import LicensePlateDisplay from "@/app/components/LicensePlateDisplay";

export default function EditPlatformUserForm({ user }: { user: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updatePlatformUser(user.line_user_id, { phone_number: phoneNumber });
            alert("บันทึกข้อมูลเรียบร้อยแล้ว");
            router.refresh();
            router.push("/liff-users");
        } catch (error) {
            console.error("Failed to update user", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="phone_number" className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                    เบอร์ติดต่อ (Phone Number)
                </label>
                <input
                    type="text"
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#1A1A1A] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                    placeholder="เช่น 0812345678"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                    รถที่ลงทะเบียนผูกกับผู้ใช้นี้ (Master Vehicles)
                </label>
                <div className="bg-zinc-50 dark:bg-[#1A1A1A] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    {user.vehicles && user.vehicles.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                            {user.vehicles.map((v: any) => (
                                <div key={v.id} className="relative group">
                                    <div className="transform scale-90 origin-center">
                                        <LicensePlateDisplay 
                                            licensePlate={v.license_plate} 
                                            province={v.province || 'กรุงเทพมหานคร'} 
                                        />
                                    </div>
                                    <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-zinc-500 font-medium">
                                        {v.is_active ? (
                                            <span className="text-emerald-500">ใช้งานได้</span>
                                        ) : (
                                            <span className="text-rose-500">ถูกระงับ</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">ไม่มีรถที่ผูกกับผู้ใช้นี้</p>
                    )}
                    <p className="text-xs text-zinc-500 mt-8">
                        * หมายเหตุ: การจัดการหรือลบรถ ควรไปทำที่เมนูจัดการรถ หรือจัดการสถานที่ (ถ้าเป็นรถของลูกบ้าน) เพราะระบบแยกความสัมพันธ์ของรถออกจากบัญชี LINE เป็นหลัก
                    </p>
                </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.push("/liff-users")}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    บันทึกข้อมูล
                </button>
            </div>
        </form>
    );
}
