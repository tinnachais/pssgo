import { getParkingFees } from "@/app/actions/parking-fees";
import { getSpecialDays } from "@/app/actions/special-days";
import SimulatorClient from "../components/SimulatorClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SimulateParkingFeePage() {
  const parkingFees = await getParkingFees();
  const specialDays = await getSpecialDays();
  
  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/parking-fees" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าอัตราค่าจอดรถ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">ทดสอบคำนวณค่าจอดรถ</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                จำลองการเข้า-ออกของยานพาหนะ เพื่อตรวจสอบว่ากฎที่ตั้งไว้สามารถคำนวณออกมาได้อย่างถูกต้อง
            </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <SimulatorClient parkingFees={parkingFees} specialDays={specialDays} />
        </div>
      </main>
    </div>
  );
}
