"use client";

import * as htmlToImage from 'html-to-image';
import { useState } from "react";

export default function ReceiptActions({ visitorId }: { visitorId: number }) {
    const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSaveImage = async () => {
        try {
            setIsGenerating(true);
            const receiptElement = document.getElementById("receipt-container");
            if (!receiptElement) {
                alert("เกิดข้อผิดพลาด: ไม่พบส่วนใบเสร็จ");
                return;
            }

            // html-to-image doesn't crash on modern CSS formats like oklch/oklab from Tailwind v4
            const dataUrl = await htmlToImage.toPng(receiptElement, {
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                style: {
                    margin: "0",
                }
            });
            
            // Check if it's likely a desktop or we just want to show the modal anyway.
            // Showing modal with instruction is the safest cross-platform method for webapps (LIFF / iOS).
            setSnapshotUrl(dataUrl);
            
        } catch (error: any) {
            console.error("html-to-image Error:", error);
            alert(`บันทึกรูปภาพไม่สำเร็จ: ${error?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'} กรุณาลองใช้วิธีจับภาพหน้าจอแทนครับ`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualDownload = () => {
        if (!snapshotUrl) return;
        const link = document.createElement("a");
        link.download = `receipt_${visitorId}.png`;
        link.href = snapshotUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        window.location.href = `/webpay/${visitorId}`;
    };

    return (
        <div className="w-full flex-col flex gap-2 mt-4 print:hidden">
            <button 
                onClick={handleSaveImage}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded shadow flex justify-center items-center gap-1.5 transition-colors"
            >
                {isGenerating ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                )}
                {isGenerating ? "กำลังสร้างรูปภาพ..." : "บันทึกเป็นรูปภาพ"}
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrint}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded shadow flex justify-center items-center gap-1.5 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    พิมพ์
                </button>
                <button 
                    onClick={handleBack}
                    className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold py-2 px-4 rounded shadow flex justify-center items-center gap-1.5 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    WebPay
                </button>
            </div>

            {/* Modal for Cross-Platform Image Saving */}
            {snapshotUrl && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
                    <p className="text-white font-bold mb-4 bg-zinc-800/80 px-5 py-2.5 rounded-full text-sm shadow-xl animate-bounce border border-zinc-700 flex items-center gap-2">
                        👇 แตะค้างที่รูปภาพใบเสร็จเพื่อบันทึกลงเครื่อง
                    </p>
                    
                    <div className="bg-white p-2 rounded-xl shadow-2xl relative">
                        <img 
                            src={snapshotUrl} 
                            alt="Receipt Snapshot" 
                            className="max-h-[60vh] md:max-h-[70vh] object-contain rounded border border-slate-200" 
                        />
                    </div>
                    
                    <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                        <button 
                            onClick={handleManualDownload}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors text-sm text-center flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            บังคับโหลด (สำหรับบางหน้าเว็บ)
                        </button>
                        <button 
                            onClick={() => setSnapshotUrl(null)} 
                            className="bg-zinc-500 hover:bg-zinc-600 text-white font-bold py-2.5 px-6 rounded-full flex items-center justify-center transition-colors text-sm shadow-lg gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ปิดหน้าต่าง
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
