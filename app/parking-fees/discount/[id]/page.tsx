import { getParkingDiscount, updateParkingDiscount } from "@/app/actions/parking-discounts";
import Link from "next/link";
import { notFound } from "next/navigation";
import DiscountForm from "../components/DiscountForm";

export default async function DiscountDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const discount = await getParkingDiscount(id);
  
  if (!discount) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/parking-fees/discount" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าส่วนลดค่าจอดรถ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">แก้ไขข้อมูล {discount.name}</h1>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <DiscountForm 
                initialData={discount}
                action={async (formData: FormData) => {
                    "use server";
                    await updateParkingDiscount(id, formData);
                }} 
            />
        </div>
      </main>
    </div>
  );
}
