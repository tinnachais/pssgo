import { getVehicle, updateVehicle } from "@/app/actions/vehicles";
import { getResidents } from "@/app/actions/residents";
import { getVehicleTypes } from "@/app/actions/vehicle-types";
import { getParkTypes } from "@/app/actions/park-types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VehicleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const vehicle = await getVehicle(id);
  
  if (!vehicle) {
    notFound();
  }

  const residents = await getResidents();
  const vehicleTypes = await getVehicleTypes();
  const parkTypes = await getParkTypes();

  const activeResidents = residents.filter((r:any) => r.is_active || r.id === vehicle.resident_id);
  const activeVehiclesTypes = vehicleTypes.filter((t:any) => t.is_active || t.id === vehicle.type_id);
  const activeParkTypes = parkTypes.filter((t:any) => t.is_active || t.id === vehicle.park_type_id);

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
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 font-bold text-lg flex-shrink-0 flex-col p-2 text-center uppercase">
                    <span className="text-xl tracking-wider leading-none mt-auto">{vehicle.license_plate}</span>
                    <span className="text-[10px] opacity-80 mt-1 border-t border-white/20 pt-1 w-full mb-auto">{vehicle.province || '—'}</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{vehicle.owner_name || 'ไม่ระบุชื่อเจ้าของ'}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${vehicle.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${vehicle.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {vehicle.is_active ? 'Active' : 'Disabled'}
                        </span>
                        {vehicle.house_number && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                                บ้าน: {vehicle.house_number}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {vehicle.image_url && (
            <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
                <h2 className="text-xl font-bold mb-6">ภาพถ่ายยานพาหนะ</h2>
                <div className="max-w-2xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                    <img 
                      src={vehicle.image_url} 
                      alt="หน้าตารถ" 
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลยานพาหนะ
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateVehicle(id, formData);
            }} className="space-y-6 max-w-2xl">
                
                <div className="space-y-2">
                    <label htmlFor="residentId" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    เลือกผู้เช่า/ร้าน/บริษัท (รหัสสถานที่/ห้องและเจ้าของรถ) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                        name="residentId"
                        id="residentId"
                        required
                        defaultValue={vehicle.resident_id || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
                        >
                        <option value="">-- เลือกผู้เช่า/ร้าน/บริษัทจากฐานข้อมูล --</option>
                        {activeResidents.map((r:any) => (
                            <option key={r.id} value={r.id}>
                            สถานที่/ห้อง {r.house_number} {r.owner_name ? `(${r.owner_name})` : ''} {r.site_name ? `[${r.site_name}]` : ''}
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
                        defaultValue={vehicle.license_plate}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-lg font-bold text-zinc-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
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
                        defaultValue={vehicle.province || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-medium"
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
                            defaultValue={vehicle.type_id || ''}
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
                            defaultValue={vehicle.park_type_id || ''}
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
                        defaultValue={vehicle.brand || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
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
                        defaultValue={vehicle.color || ''}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-rose-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกการเปลี่ยนแปลง
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
