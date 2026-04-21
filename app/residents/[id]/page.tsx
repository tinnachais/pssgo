import { getResident, updateResidentProfile, updateHouseData } from "@/app/actions/residents";
import { getSites } from "@/app/actions/sites";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ResidentDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const resident = await getResident(id);
  const sites = await getSites();
  
  if (!resident) {
    notFound();
  }

  return (
    <div className="min-h-full font-sans selection:bg-blue-500/30">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/residents" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าข้อมูลผู้เช่า/ร้าน/บริษัท
            </Link>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-2xl flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{resident.house_number}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${resident.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${resident.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {resident.is_active ? 'Active' : 'Disabled'}
                        </span>
                        {resident.site_name && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-500/20">
                                {resident.site_name}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {resident.is_owner && (
        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลสถานที่/ห้อง
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateHouseData(id, formData);
            }} className="space-y-6 relative z-10">
                <input type="hidden" name="siteId" value={resident.site_id || ""} />

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="houseNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        รหัสสถานที่ / ห้อง <span className="text-rose-500">*</span>
                        </label>
                        <input
                        type="text"
                        name="houseNumber"
                        id="houseNumber"
                        required
                        defaultValue={resident.house_number}
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกข้อมูลบ้าน
                    </button>
                </div>
            </form>
        </div>
        )}

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                แก้ไขข้อมูลส่วนตัว (Profile)
            </h2>
            <form action={async (formData) => {
                "use server";
                await updateResidentProfile(id, formData);
            }} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="ownerName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {resident.is_owner ? 'ชื่อ-นามสกุล / เจ้าบ้าน' : 'ชื่อสมาชิก'} <span className="text-zinc-400 font-normal">(ตัวเลือก)</span>
                        </label>
                        <input
                        type="text"
                        name="ownerName"
                        id="ownerName"
                        defaultValue={resident.owner_name || ''}
                        placeholder="ชื่อผู้บัญชีรายนี้"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        เบอร์โทรติดต่อ <span className="text-zinc-400 font-normal">(ตัวเลือก)</span>
                        </label>
                        <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        defaultValue={resident.phone_number || ''}
                        placeholder="08X-XXX-XXXX"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="maxVehicles" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        โควต้ารถรายบุคคล <span className="text-zinc-400 font-normal">(ใส่เฉพาะรอกรณีต้องการแยกโควต้าต่อคน)</span>
                        </label>
                        <input
                        type="number"
                        name="maxVehicles"
                        id="maxVehicles"
                        min="0"
                        defaultValue={resident.max_vehicles !== null ? resident.max_vehicles : ''}
                        placeholder="ปล่อยว่างเพื่อยึดตามค่าบ้านและสถานที่"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-[0.98]"
                    >
                        บันทึกโปรไฟล์
                    </button>
                    <Link href="/residents" className="py-3.5 px-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold transition-all">
                        ย้อนกลับ
                    </Link>
                </div>
            </form>
        </div>
      </main>
    </div>
  );
}
