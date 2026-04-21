import { getProvider, updateProvider } from "@/app/actions/providers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProviderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const provider = await getProvider(id);
  
  if (!provider) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/settings/providers" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้ให้บริการ
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 font-bold text-3xl flex-shrink-0">
                    {provider.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{provider.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${provider.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${provider.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {provider.is_active ? 'Active' : 'Disabled'}
                        </span>
                        {provider.tax_id && (
                            <span className="font-mono text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded border border-zinc-200 dark:border-zinc-700">
                                {provider.tax_id}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลผู้ให้บริการ
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateProvider(id, formData);
            }} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อบริษัท / นิติบุคคล <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={provider.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="taxId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    เลขประจำตัวผู้เสียภาษี
                    </label>
                    <input
                    type="text"
                    name="taxId"
                    id="taxId"
                    defaultValue={provider.tax_id || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ที่อยู่สำหรับออกใบเสร็จ
                    </label>
                    <textarea
                    name="address"
                    id="address"
                    rows={4}
                    defaultValue={provider.address || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label htmlFor="contactName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อผู้ติดต่อ
                    </label>
                    <input
                    type="text"
                    name="contactName"
                    id="contactName"
                    defaultValue={provider.contact_name || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        เบอร์โทรศัพท์
                        </label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        defaultValue={provider.phone_number || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        อีเมล์
                        </label>
                        <input
                        type="email"
                        name="email"
                        id="email"
                        defaultValue={provider.email || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="invoiceAdvanceDays" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    สร้างใบแจ้งหนี้อัตโนมัติล่วงหน้า (วัน)
                    </label>
                    <input
                    type="number"
                    name="invoiceAdvanceDays"
                    id="invoiceAdvanceDays"
                    defaultValue={provider.invoice_advance_days ?? 7}
                    min="1"
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        ระบบจะทำการออกใบแจ้งหนี้ (สถานะรอดำเนินการ) อัตโนมัติล่วงหน้าก่อนที่แพ็กเกจจะหมดอายุตามจำนวนวันที่ระบุ
                    </p>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
