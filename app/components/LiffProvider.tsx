"use client";

import { useEffect, useState, createContext, useContext } from "react";
import Script from "next/script";

// สร้าง Context เพื่อแชร์ Profile ของผู้ใช้ LINE
interface LiffContextType {
  liffObject: any;
  profile: any;
  error: string | null;
  isLoading: boolean;
}

const LiffContext = createContext<LiffContextType>({
  liffObject: null,
  profile: null,
  error: null,
  isLoading: true,
});

export function LiffProvider({
  children,
  liffId,
}: {
  children: React.ReactNode;
  liffId: string;
}) {
  const [liffObject, setLiffObject] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันจะถูกเรียกหลังจากโหลดสคริปต์ LIFF SDK จาก LINE CDN เสร็จ
  const initLiff = async () => {
    try {
      const liff = (window as any).liff;
      await liff.init({ liffId });

      setLiffObject(liff);

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const userProfile = await liff.getProfile();
      setProfile(userProfile);
    } catch (err: any) {
      console.error("LIFF Init Error:", err);
      setError(err.message || "Something went wrong during LIFF init");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
        onLoad={initLiff}
        onError={(e) => setError("Failed to load LIFF SDK")}
      />
      <LiffContext.Provider value={{ liffObject, profile, error, isLoading }}>
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#06C755] font-bold">กำลังเชื่อมต่อ LINE...</p>
            </div>
          </div>
        ) : error ? (
          <div className="min-h-screen flex items-center justify-center p-4 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm">
              <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">พบข้อผิดพลาด</h2>
              <p className="text-slate-500 text-sm mt-2">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </LiffContext.Provider>
    </>
  );
}

export const useLiff = () => useContext(LiffContext);
