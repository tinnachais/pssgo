import { addVehicle } from "@/app/actions/vehicles";
import { getResidents } from "@/app/actions/residents";
import { getVehicleTypes } from "@/app/actions/vehicle-types";
import { getParkTypes } from "@/app/actions/park-types";
import Link from "next/link";

export default async function AddVehiclePage() {
  const residents = await getResidents();
  const vehicleTypes = await getVehicleTypes();
  const parkTypes = await getParkTypes();

  const activeResidents = residents.filter((r:any) => r.is_active);
  const activeVehiclesTypes = vehicleTypes.filter((t:any) => t.is_active);
  const activeParkTypes = parkTypes.filter((t:any) => t.is_active);

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/vehicles" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าแฟ้มยานพาหนะ
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">ลงทะเบียนยานพาหนะใหม่</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                เพิ่มข้อมูลยานพาหนะ ทะเบียนรถ โดยระบุผู้เช่า/ร้าน/บริษัทเจ้าของรถ
            </p>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <form action={addVehicle} className="space-y-6 relative z-10 max-w-2xl">
                <div className="space-y-2">
                    <label htmlFor="residentId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    เลือกผู้เช่า/ร้าน/บริษัท (บ้านเลขที่และเจ้าของรถ) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="residentId"
                        id="residentId"
                        required
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกผู้เช่า/ร้าน/บริษัทจากฐานข้อมูล --</option>
                        {activeResidents.map((r:any) => (
                            <option key={r.id} value={r.id}>
                            บ้านเลขที่ {r.house_number} {r.owner_name ? `(${r.owner_name})` : ''} {r.site_name ? `[${r.site_name}]` : ''}
                            </option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="licensePlate" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ป้ายทะเบียน <span className="text-rose-500">*</span>
                        </label>
                        <input
                        type="text"
                        name="licensePlate"
                        id="licensePlate"
                        required
                        placeholder="เช่น 1กข-1234"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-lg font-bold text-zinc-900 dark:text-white uppercase placeholder:text-zinc-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="province" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        จังหวัด (แยกฟิลด์)
                        </label>
                        <input
                        type="text"
                        name="province"
                        id="province"
                        placeholder="กรุงเทพมหานคร"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="typeId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ประเภทพาหนะ
                        </label>
                        <div className="relative">
                            <select
                            name="typeId"
                            id="typeId"
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                            >
                            <option value="">-- ไม่ระบุประเภท --</option>
                            {activeVehiclesTypes.map((t:any) => (
                                <option key={t.id} value={t.id}>
                                {t.code ? `[${t.code}] ` : ''}{t.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="parkTypeId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สิทธิ์จอดรถ
                        </label>
                        <div className="relative">
                            <select
                            name="parkTypeId"
                            id="parkTypeId"
                            className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                            >
                            <option value="">-- ไม่ระบุสิทธิ์ --</option>
                            {activeParkTypes.map((t:any) => (
                                <option key={t.id} value={t.id}>
                                {t.code ? `[${t.code}] ` : ''}{t.name}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="brand" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        ยี่ห้อรถ
                        </label>
                        <input
                        type="text"
                        name="brand"
                        id="brand"
                        placeholder="เช่น Toyota"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="color" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        สีรถ
                        </label>
                        <input
                        type="text"
                        name="color"
                        id="color"
                        placeholder="เช่น ดำ"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการลงทะเบียน
                    </button>
                    <Link href="/vehicles" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ยกเลิก
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
