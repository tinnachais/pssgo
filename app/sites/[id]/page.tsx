import { getSite, updateSite } from "@/app/actions/sites";
import { getProviders } from "@/app/actions/providers";
import Link from "next/link";
import { notFound } from "next/navigation";
import MapPicker from "@/app/components/MapPicker";

export default async function SiteDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const site = await getSite(id);
  
  if (!site) {
    notFound();
  }

  const providers = await getProviders();
  const activeProviders = providers.filter(p => p.is_active || p.id === site.provider_id);

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/sites" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าสถานที่
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-3xl flex-shrink-0">
                    {site.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{site.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${site.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${site.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {site.is_active ? 'Active' : 'Disabled'}
                        </span>
                        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
                        <div className="flex flex-wrap gap-1.5">
                            {(() => {
                                const zones = typeof site.zones_data === 'string' ? JSON.parse(site.zones_data) : (site.zones_data || []);
                                return zones.length > 0 ? zones.map((z: any) => (
                                    <span key={z.id} className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">
                                        {z.name}
                                    </span>
                                )) : <span className="text-[10px] font-bold text-zinc-400">ยังไม่มีโซน</span>;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลสถานที่
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateSite(id, formData);
            }} className="space-y-6 max-w-2xl">
                
                <div className="space-y-2">
                    <label htmlFor="providerId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    นิติบุคคลที่ดูแลสถานที่ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="providerId"
                        id="providerId"
                        required
                        defaultValue={site.provider_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกนิติบุคคล --</option>
                        {activeProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                            {provider.name}
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ชื่อสถานที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={site.name}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ที่อยู่ / รายละเอียดของสถานที่
                    </label>
                    <textarea
                    name="address"
                    id="address"
                    rows={3}
                    defaultValue={site.address || ''}
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    ></textarea>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    พิกัดสถานที่ (คลิกเพื่อปักหมุด)
                    </label>
                    <MapPicker defaultLat={site.lat ? parseFloat(site.lat) : undefined} defaultLng={site.lng ? parseFloat(site.lng) : undefined} />
                </div>

                    <div className="space-y-2">
                        <label htmlFor="maxVehicles" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        จำนวนรถสูงสุดต่อบ้าน <span className="text-rose-500">*</span>
                        </label>
                        <input
                        type="number"
                        name="maxVehicles"
                        id="maxVehicles"
                        required
                        min="1"
                        defaultValue={site.max_vehicles || 1}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1.5 flex items-start gap-1">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span><strong className="block mb-0.5">ข้อควรระวัง:</strong>การตั้งจำนวนรถต่อบ้าน ควรคำนวณให้สัมพันธ์กับแพ็กเกจสถานที่ (เช่น ถ้าแพ็กเกจให้ 500 คัน บ้านมี 100 หลัง ไม่ควรตั้งให้เกินบ้านละ 5 คัน)</span>
                        </p>
                    </div>
                
                <div className="space-y-2">
                    <label htmlFor="contactLink" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ลิงก์ติดต่อเจ้าหน้าที่สถานที่ (เช่น LINE OA)
                    </label>
                    <input
                    type="url"
                    name="contactLink"
                    id="contactLink"
                    defaultValue={site.contact_link || ""}
                    placeholder="https://lin.ee/..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98]"
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
