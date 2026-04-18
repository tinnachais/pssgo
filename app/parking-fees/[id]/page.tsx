import { getParkingFee } from "@/app/actions/parking-fees";
import { getParkTypes } from "@/app/actions/park-types";
import ParkingFeeForm from "../components/ParkingFeeForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditParkingFeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const feeId = parseInt(resolvedParams.id, 10);
  const data = await getParkingFee(feeId);
  const parkTypes = await getParkTypes();
  const { getRevenueTypes } = await import("@/app/actions/revenue-types");
  const revenueTypes = await getRevenueTypes();
  
  if (!data) return notFound();

  return (
    <div className="min-h-full font-sans selection:bg-amber-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link href="/parking-fees" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าอัตราค่าจอดรถ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">แก้ไขกฎและอัตราค่าจอดรถ</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                แก้ไขรายการ "{data.name}"
            </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <ParkingFeeForm initialData={data} parkTypes={parkTypes} revenueTypes={revenueTypes} />
        </div>
      </main>
    </div>
  );
}
