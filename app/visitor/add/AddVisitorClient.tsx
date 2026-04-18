"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { addVisitor } from "@/app/actions/visitors";
import { analyzeIdImage } from "@/app/actions/ocr";
import { HouseSelect } from "./HouseSelect";

export default function AddVisitorClient({ houses }: { houses: any[] }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ocrData, setOcrData] = useState<{ fullName?: string; cardType?: string; idCardNumber?: string } | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const max_dim = 1600;

                    if (width > height) {
                        if (width > max_dim) {
                            height = Math.round((height *= max_dim / width));
                            width = max_dim;
                        }
                    } else {
                        if (height > max_dim) {
                            width = Math.round((width *= max_dim / height));
                            height = max_dim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("react") as any; // Ignore type
                    const actualCtx = canvas.getContext("2d");
                    if (actualCtx) actualCtx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() });
                            resolve(newFile);
                        } else {
                            resolve(file); // fallback
                        }
                    }, "image/jpeg", 0.7);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        try {
            // COMPRESS IMAGE CLIEN-SIDE TO AVOID PAYLOAD TOO LARGE
            const compressedFile = await compressImage(file);
            
            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(compressedFile);

            const formData = new FormData();
            formData.append("image", compressedFile);
            const res = await analyzeIdImage(formData);
            if (res.success && res.data) {
                setOcrData({
                    fullName: res.data.fullName || "",
                    cardType: res.data.cardType || "บัตรประชาชน",
                    idCardNumber: res.data.idNumber || ""
                });
            } else {
                alert("เกิดข้อผิดพลาด: " + (res.message || "ไม่สามารถอ่านข้อมูลบัตรได้รบกวนกรอกเองครับ"));
            }
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการอ่านข้อมูล");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <form action={addVisitor} className="space-y-6 relative z-10 max-w-2xl">
            {/* Image Upload for OCR */}
            <div className="space-y-3 p-5 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300">อ่านข้อมูลอัตโนมัติ (OCR)</h3>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">แนบรูปบัตรประชาชน, ใบขับขี่ หรือพาสปอร์ต เพื่อดึงข้อมูล</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-800/50 dark:hover:bg-purple-800 dark:text-purple-300 text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="animate-spin h-3.5 w-3.5 text-purple-700 dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                กำลังอ่านข้อมูล...
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                ถ่ายรูป / อัปโหลดบัตร
                            </>
                        )}
                    </button>
                    <input 
                        type="file"
                        name="image"
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                    />
                </div>
                {imagePreview && (
                    <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800 shadow-sm">
                        <img src={imagePreview} alt="Card Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setImagePreview(null); setOcrData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    defaultValue={ocrData?.fullName}
                    key={`name-${ocrData?.fullName}`}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="cardType" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ประเภทบัตร
                    </label>
                    <div className="relative">
                        <select
                            name="cardType"
                            id="cardType"
                            defaultValue={ocrData?.cardType || "บัตรประชาชน"}
                            key={`type-${ocrData?.cardType}`}
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                        >
                            <option value="บัตรประชาชน">บัตรประชาชน (ID)</option>
                            <option value="ใบขับขี่">ใบขับขี่ (License)</option>
                            <option value="พาสปอร์ต">พาสปอร์ต (Passport)</option>
                            <option value="อื่นๆ">อื่นๆ (Other)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="idCardNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        หมายเลขบัตร (ย่อหรือเต็ม)
                    </label>
                    <input
                        type="text"
                        name="idCardNumber"
                        id="idCardNumber"
                        defaultValue={ocrData?.idCardNumber}
                        key={`id-${ocrData?.idCardNumber}`}
                        placeholder="เช่น 1234"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label htmlFor="vehiclePlate" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ป้ายทะเบียน
                    </label>
                    <input
                        type="text"
                        name="vehiclePlate"
                        id="vehiclePlate"
                        placeholder="เช่น 1กข 1234"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="vehicleProvince" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        จังหวัด
                    </label>
                    <input
                        type="text"
                        name="vehicleProvince"
                        id="vehicleProvince"
                        placeholder="เช่น กรุงเทพมหานคร"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="vehicleColor" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สีรถ
                    </label>
                    <input
                        type="text"
                        name="vehicleColor"
                        id="vehicleColor"
                        placeholder="เช่น ขาว, ดำ"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="houseNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    บ้านที่เข้าพบ
                </label>
                <HouseSelect houses={houses} />
            </div>

            <div className="space-y-2">
                <label htmlFor="purpose" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ติดต่อเรื่อง
                </label>
                <input
                    type="text"
                    name="purpose"
                    id="purpose"
                    placeholder="เช่น ส่งพัสดุ / ช่างซ่อม"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
            </div>
            
            {/* OCR image will be passed via the file input above */}

            <div className="pt-4 flex items-center gap-3">
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98]"
                >
                    บันทึกเข้าพื้นที่ (Check In)
                </button>
                <Link href="/visitor" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                    ยกเลิก
                </Link>
            </div>
        </form>
    );
}
