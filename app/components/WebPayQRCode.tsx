"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function WebPayQRCode({ visitorId }: { visitorId: number }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    setUrl(`${baseUrl}/webpay/${visitorId}`);
  }, [visitorId]);

  if (!url) return <div className="animate-pulse h-5 w-24 bg-slate-100 rounded"></div>;

  return (
    <div className="relative group inline-block mt-0.5">
      <div className="text-[10px] text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white border border-blue-200 group-hover:border-blue-600 px-2 py-0.5 rounded cursor-pointer font-bold flex items-center gap-1 transition-all duration-300 w-max shadow-sm">
        <svg className="w-3 h-3 block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        QR Scan to Pay
      </div>
      
      {/* Tooltip Content */}
      <div className="absolute top-[120%] left-0 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
        <div className="bg-white p-3 rounded-xl shadow-2xl border border-slate-200 flex flex-col items-center">
            <div className="bg-white p-1 rounded-lg">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
                    alt="Scan to Pay WebPay"
                    className="w-28 h-28"
                />
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Scan via Mobile
            </div>
        </div>
      </div>
    </div>
  );
}
