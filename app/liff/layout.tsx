import { LiffProvider } from "@/app/components/LiffProvider";
import PullToRefresh from "@/app/components/PullToRefresh";

export const metadata = {
  title: "PSS GO - LINE LIFF",
  description: "Property Security System LINE Application",
  other: {
    "cache-control": "no-cache, no-store, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
  }
};

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ค่า LIFF ID ต้องใส่ใน .env.local โดยตั้งชื่อ NEXT_PUBLIC_LIFF_ID
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "1234567890-AbcdEfgh";

  return (
    <LiffProvider liffId={liffId}>
      <PullToRefresh>
        {children}
      </PullToRefresh>
    </LiffProvider>
  );
}
