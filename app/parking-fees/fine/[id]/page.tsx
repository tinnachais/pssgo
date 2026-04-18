import { getParkingFine, updateParkingFine } from "@/app/actions/parking-fines";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FineDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const fine = await getParkingFine(id);
  
  if (!fine) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/parking-fees/fine" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าค่าปรับและข้อหา
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">แก้ไขข้อมูล {fine.name}</h1>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <form action={async (formData) => {
                "use server";
                await updateParkingFine(id, formData);
            }} className="space-y-6 relative z-10">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อข้อหา / รายการ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={fine.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="fine_amount" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ค่าปรับ (บาท) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">฿</span>
                        <input
                        type="number"
                        name="fine_amount"
                        id="fine_amount"
                        required
                        step="0.01"
                        min="0"
                        defaultValue={fine.fine_amount}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-10 pr-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    รายละเอียดเพิ่มเติม
                    </label>
                    <textarea
                    name="description"
                    id="description"
                    defaultValue={fine.description || ''}
                    rows={3}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all resize-none"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                    <Link href="/parking-fees/fine" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
