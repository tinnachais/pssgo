import { getParkingFees, addParkingFee, toggleParkingFeeStatus, deleteParkingFee, updateParkingFee } from "@/app/actions/parking-fees";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ParkingFeesPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams;
  const editId = searchParams?.edit ? parseInt(searchParams.edit, 10) : null;

  let parkingFees: any[] = [];
  
  try {
    parkingFees = await getParkingFees();
  } catch (err) {
    console.error("Failed to fetch parking fees:", err);
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    const id = formData.get("feeId");
    if (id) {
       await updateParkingFee(parseInt(id.toString(), 10), formData);
       redirect("/settings/parking-fees");
    }
  }

  return (
    <div className="min-h-full font-sans selection:bg-rose-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Parking Fees</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Settings &gt; Define base rates for different parking durations or conditions (e.g. Standard, VIP, Penalty).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-6 md:p-8 ring-1 ring-zinc-900/5 dark:ring-white/5 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Register Rate
              </h2>
              <form action={async (formData) => { "use server"; await addParkingFee(formData); }} className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Rate Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="e.g. Standard Hourly Rate"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all font-mono"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="amount" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Amount (THB)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    id="amount"
                    defaultValue={0}
                    required
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Description / Conditions
                  </label>
                  <input
                    type="text"
                    name="description"
                    id="description"
                    placeholder="e.g. 20 THB per hour after 3 hours"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:shadow-lg active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Register Rate
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
             <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ring-1 ring-zinc-900/5 dark:ring-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/50 dark:bg-[#1A1A1A]/50 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">Fee Name / Amount</th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/3">Description</th>
                        <th className="px-6 py-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-widest w-1/6">Status</th>
                        <th className="px-6 py-5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-widest">Options</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {parkingFees.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-24 text-center">
                             <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 outline outline-8 outline-zinc-50 dark:outline-zinc-900/50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">No Rates Set</p>
                              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Add parking fee rates to calculate revenues.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        parkingFees.map((fee: any) => (
                           fee.id === editId ? (
                             <tr key={`edit-${fee.id}`} className="bg-zinc-50 dark:bg-zinc-800/30">
                              <td colSpan={4} className="px-6 py-4">
                                <form action={handleUpdate} className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
                                  <input type="hidden" name="feeId" value={fee.id} />
                                  <div className="flex-1 space-y-3 w-full">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                          type="text"
                                          name="name"
                                          defaultValue={fee.name}
                                          required
                                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                                          placeholder="Rate Name"
                                        />
                                        <input
                                          type="number"
                                          step="0.01"
                                          name="amount"
                                          defaultValue={fee.amount}
                                          required
                                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                                          placeholder="Amount (THB)"
                                        />
                                      </div>
                                      <input
                                          type="text"
                                          name="description"
                                          defaultValue={fee.description || ''}
                                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                                          placeholder="Description / Conditions"
                                        />
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                                    <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm">Save</button>
                                    <Link href="/settings/parking-fees" className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-sm font-bold rounded-lg transition-colors">Cancel</Link>
                                  </div>
                                </form>
                              </td>
                            </tr>
                           ) : (
                            <tr key={fee.id} className="hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/20 shadow-sm font-bold flex-shrink-0">
                                    ฿
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 font-mono">
                                      {fee.name} <span className="text-emerald-600 dark:text-emerald-500 ml-2">[{Number(fee.amount).toLocaleString()} THB]</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{fee.description || '—'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <form action={async () => {
                                   "use server";
                                   await toggleParkingFeeStatus(fee.id, !fee.is_active);
                                 }}>
                                    <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${fee.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${fee.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      {fee.is_active ? 'Enabled' : 'Disabled'}
                                    </button>
                                 </form>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex justify-end gap-1">
                                  <Link href={`/settings/parking-fees?edit=${fee.id}`} title="Edit Rate" className="text-zinc-400 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2-2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Link>
                                  <form action={async () => {
                                    "use server";
                                    await deleteParkingFee(fee.id);
                                  }}>
                                    <button type="submit" title="Remove Rate" className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                           )
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
