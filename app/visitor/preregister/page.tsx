"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useRef, useEffect } from 'react';
import { preRegisterVisitor, getVisitorInvite } from '@/app/actions/visitors';
import { analyzeCarImage } from "@/app/actions/liff";

function PreRegisterForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [isLoading, setIsLoading] = useState(true);
    const [inviteData, setInviteData] = useState<any>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // AI Form fields
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [detectedPlate, setDetectedPlate] = useState("");
    const [detectedProvince, setDetectedProvince] = useState("");
    const [detectedColor, setDetectedColor] = useState("");

    const formRef = useRef<HTMLFormElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        getVisitorInvite(token).then(data => {
            setInviteData(data);
            setIsLoading(false);
        });
    }, [token]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const originalFile = e.target.files[0];
          setIsAnalyzing(true);
    
          try {
            const compressedFile = await new Promise<File>((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(originalFile);
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.src = event.target?.result as string;
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const MAX_WIDTH = 1000;
                        const MAX_HEIGHT = 1000;
                        let width = img.width;
                        let height = img.height;
    
                        if (width > height) {
                            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                        } else {
                            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0, width, height);
                        
                        canvas.toBlob((blob) => {
                            if (blob) { resolve(new File([blob], "compressed_" + originalFile.name, { type: "image/jpeg" })); }
                            else { resolve(originalFile); }
                        }, "image/jpeg", 0.7);
                    };
                };
            });
    
            setImageFile(compressedFile);
            const formData = new FormData();
            formData.append("image", compressedFile);
            
            const res = await analyzeCarImage(formData);
            
            if (res.success && res.data) {
                setDetectedPlate(res.data.licensePlate || "");
                setDetectedProvince(res.data.province || "");
                setDetectedColor(res.data.color || "");
            } else {
                alert("AI ไม่สามารถอ่านป้ายทะเบียนได้ กรุณากรอกด้วยตัวเอง");
            }
          } catch (err: any) {
            console.error("Compression/Upload Error:", err);
            alert("เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ");
          } finally {
            setIsAnalyzing(false);
          }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;
        
        setIsSubmitting(true);
        try {
            const formData = new FormData(formRef.current);
            if (token) formData.append('inviteToken', token);
            if (!formData.get('purpose') && inviteData?.purpose) formData.append('purpose', inviteData.purpose);
            if (imageFile) formData.append('image', imageFile);
            
            // Send vehicle data separately instead of concatenating
            formData.set('vehiclePlate', detectedPlate.trim());
            formData.set('vehicleProvince', detectedProvince.trim());
            formData.set('vehicleColor', detectedColor.trim());
            
            const result = await preRegisterVisitor(formData);
            if (result.success) {
                setIsSuccess(true);
            } else {
                alert(result.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">กำลังตรวจสอบข้อมูล...</div>;
    }

    if (!inviteData) {
        return (
            <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">ลิงก์ไม่ถูกต้อง หรือหมดอายุ</h2>
                    <p className="text-sm text-slate-500">ลิงก์คำเชิญนี้ถูกใช้งานไปแล้ว หรือไม่มีอยู่จริงในระบบ กรุณาติดต่อผู้ให้คำเชิญ</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">ลงทะเบียนเรียบร้อย</h2>
                    <p className="text-sm text-slate-500 mb-6">กรุณาแจ้ง รปภ. ว่าลงทะเบียนล่วงหน้าเรียบร้อยแล้ว เมื่อถึงป้อมหน้าสถานที่</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center py-10 px-4 font-sans text-slate-800">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 relative z-10">
                        <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full -mt-7 z-20 shadow-sm border-2 border-slate-50">
                        คำเชิญพิเศษ
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mt-4 text-center">ลงทะเบียนล่วงหน้า</h1>
                    <p className="text-sm text-slate-500 text-center mt-2 px-6">
                        กรุณากรอกข้อมูลของท่านเพื่อความสะดวกรวดเร็วในการแลกบัตรเข้าสถานที่
                    </p>
                </div>

                <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                    {inviteData?.expected_in_time && (
                        <div className="mb-4 bg-sky-50 border border-sky-100 p-3 rounded-xl text-sm text-sky-800 break-words">
                            <span className="font-bold">วันที่เข้ามา:</span> {new Date(inviteData.expected_in_time).toLocaleString('th-TH')}
                        </div>
                    )}
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ชื่อ - นามสกุล ผู้ติดต่อ<span className="text-red-500 ml-1">*</span></label>
                            <input 
                                type="text"
                                name="fullName"
                                defaultValue={inviteData?.full_name || ''}
                                required
                                placeholder="เชน: สมชาย ใจดี"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เบอร์โทรศัพท์ติดต่อ</label>
                            <input 
                                type="tel"
                                name="phoneNumber"
                                placeholder="เช่น: 0812345678"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ติดต่อเรื่อง / ธุระ<span className="text-red-500 ml-1">*</span></label>
                            <input 
                                type="text"
                                name="purpose"
                                defaultValue={inviteData?.purpose || ''}
                                required
                                placeholder="เช่น: ส่งพัสดุ, ต่อเติมบ้าน, ซ่อมแอร์"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">อัปโหลดรูปรถ (เติมข้อมูลอัตโนมัติ)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                    {isAnalyzing ? (
                                        <svg className="animate-spin h-8 w-8 text-sky-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8 text-slate-400 mb-2 group-hover:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                    <p className="mb-1 text-sm text-slate-500"><span className="font-semibold text-sky-600">กดเพื่อถ่ายรูป</span> บริเวณหน้ารถ</p>
                                    <p className="text-xs text-slate-400">ระบบ AI จะอ่านทะเบียนรถให้อัตโนมัติ</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isAnalyzing} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ทะเบียนรถ</label>
                                <input 
                                    type="text"
                                    value={detectedPlate}
                                    onChange={(e) => setDetectedPlate(e.target.value)}
                                    placeholder="กข 1234"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all uppercase placeholder:normal-case"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">จังหวัด</label>
                                <input 
                                    type="text"
                                    value={detectedProvince}
                                    onChange={(e) => setDetectedProvince(e.target.value)}
                                    placeholder="กรุงเทพมหานคร"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all uppercase placeholder:normal-case"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">สีรถ</label>
                            <input 
                                type="text"
                                value={detectedColor}
                                onChange={(e) => setDetectedColor(e.target.value)}
                                placeholder="ขาว"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 p-3.5 outline-none font-medium transition-all"
                            />
                        </div>
                        <div className="pt-2">
                           <button type="submit" disabled={isSubmitting} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-md px-5 py-4 text-center shadow-lg shadow-sky-500/30 transition-all active:scale-[0.98] disabled:opacity-50">
                              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการลงทะเบียน'}
                           </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">ระบบบริหารจัดการผู้มาติดต่อ PSS GO</p>
                </div>
            </div>
        </div>
    );
}

export default function PreRegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>}>
            <PreRegisterForm />
        </Suspense>
    );
}
