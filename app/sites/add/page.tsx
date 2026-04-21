import { addSite } from "@/app/actions/sites";
import { getProviders } from "@/app/actions/providers";
import { getPackages } from "@/app/actions/packages";
import Link from "next/link";
import MapPicker from "@/app/components/MapPicker";

export default async function AddSitePage() {
  const [providers, packages] = await Promise.all([getProviders(), getPackages()]);
  const activeProviders = providers.filter((p: any) => p.is_active);
  const activePackages = packages.filter((p: any) => p.is_active !== false);

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/sites" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าสถานที่เป้าหมาย
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">เพิ่มสถานที่ใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                ตั้งค่าและจัดการสถานที่ต่างๆ รวมถึงคอนโด หรือหมู่บ้านในระบบ เพื่อใช้แยกสิทธิ์และรายได้
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addSite} className="space-y-6 relative z-10 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="providerId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    นิติบุคคลที่ดูแลสถานที่ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="providerId"
                        id="providerId"
                        required
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
                    {activeProviders.length === 0 && (
                        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ต้องเพิ่มข้อมูลนิติบุคคล/ผู้ให้บริการก่อน
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="packageId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    แพ็กเกจ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="packageId"
                        id="packageId"
                        required
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกแพ็กเกจ --</option>
                        {activePackages.map((pkg: any) => (
                            <option key={pkg.id} value={pkg.id}>
                            {pkg.name} (สูงสุด {pkg.max_vehicles} คัน)
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
                    placeholder="เช่น สถานที่หมู่บ้านพฤกษา..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <label htmlFor="type" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ประเภทของสถานที่ <span className="text-rose-500">*</span>
                        </label>
                        <select
                        name="type"
                        id="type"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium appearance-none"
                        >
                            <option value="PRIVATE">ส่วนตัว (หมู่บ้าน, คอนโด, โฮมออฟฟิศ)</option>
                            <option value="PUBLIC">สาธารณะ (ลานจอดรถ, ห้างสรรพสินค้า, ตลาด)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    ที่อยู่ / รายละเอียดของสถานที่
                    </label>
                    <textarea
                    name="address"
                    id="address"
                    rows={3}
                    placeholder="เช่น พระราม 3 บางคอแหลม กทม..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                    ></textarea>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    พิกัดสถานที่ (คลิกเพื่อปักหมุด)
                    </label>
                    <MapPicker defaultLat={13.7563} defaultLng={100.5018} />
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
                        min="0"
                        defaultValue="1"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                        />
                        <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1.5 flex items-start gap-1">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span><strong className="block mb-0.5">ข้อควรระวัง:</strong>การตั้งจำนวนรถต่อบ้าน ควรคำนวณให้สัมพันธ์กับแพ็กเกจ (ใส่เลข 0 เพื่อไปกำหนดแยกตามแต่ละผู้เช่า/ร้าน/บริษัทเอง)</span>
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
                    placeholder="https://lin.ee/..."
                    className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
                <div className="space-y-3 pt-2">
                    <label className="relative flex items-start gap-3 cursor-pointer group">
                        <div className="flex items-center h-6">
                            <input
                                type="checkbox"
                                name="autoSetup"
                                defaultChecked
                                className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">สร้างข้อมูลเริ่มต้นอัตโนมัติ</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">ระบบจะสร้าง โซนหลัก, ประตูหลัก, และนำข้อมูลผู้ให้บริการมาบันทึกเป็นผู้เช่า/ร้าน/บริษัท ให้อัตโนมัติ เพื่อให้สถานที่พร้อมใช้งานทันที</span>
                        </div>
                    </label>
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={activeProviders.length === 0}
                        className={`font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeProviders.length > 0
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98]"
                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        บันทึกสถานที่
                    </button>
                    <Link href="/sites" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
