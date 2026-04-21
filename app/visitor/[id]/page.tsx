import { getVisitor, checkoutVisitor } from "@/app/actions/visitors";
import { query } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function VisitorDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const visitor = await getVisitor(id);
  
  if (!visitor) {
    notFound();
  }

  // Fetch Payment History
  let payments: any[] = [];
  try {
      await query("ALTER TABLE revenues ADD COLUMN IF NOT EXISTS visitor_id INT DEFAULT NULL"); // Ensure safety
      const paymentRes = await query("SELECT * FROM revenues WHERE visitor_id = $1 AND payment_status = 'PAID' ORDER BY created_at ASC", [id]);
      payments = paymentRes.rows;
  } catch (e) {
      console.error(e);
  }

  // Build Unified Timeline
  const timeline: { type: string, title: string, subtitle?: string, time: Date, icon?: string, color: string }[] = [];
  
  if (visitor.check_in_time) {
      timeline.push({ type: 'CHECKIN', title: 'Check In (เข้าพื้นที่)', time: new Date(visitor.check_in_time), color: 'bg-emerald-500' });
  }

  if (visitor.e_stamp_date) {
      // Check if e_stamp_date is not exactly same as a payment's created_at (WebPay)
      // Usually WebPay updates both closely. To be beautiful, just show it.
      timeline.push({ type: 'ESTAMP', title: 'E-Stamp (ประทับตราออนไลน์)', time: new Date(visitor.e_stamp_date), color: 'bg-sky-500' });
  }

  payments.forEach(p => {
      let isWebpay = p.description?.includes('WebPay') || p.receipt_no?.startsWith('RC-WEB');
      timeline.push({ 
          type: 'PAYMENT', 
          title: `ชำระเงินค่าจอดรถ (${isWebpay ? 'WebPay' : 'เงินสด'})`, 
          subtitle: `ยอด: ฿${parseFloat(p.amount).toLocaleString()} • ${p.payment_method === 'PROMPTPAY' ? 'สแกนจ่าย QR' : 'บัตรเครดิต/อื่นๆ'}`,
          time: new Date(p.created_at || p.issued_at), 
          color: 'bg-amber-500' 
      });
  });

  if (visitor.check_out_time) {
      timeline.push({ type: 'CHECKOUT', title: 'Check Out (คืนบัตร / ออกพื้นที่)', time: new Date(visitor.check_out_time), color: 'bg-zinc-400' });
  }

  timeline.sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <div className="min-h-full font-sans selection:bg-purple-500/30">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/visitor" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                กลับไปหน้าผู้มาติดต่อ
            </Link>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 font-bold text-3xl flex-shrink-0">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white line-clamp-1">{visitor.full_name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-semibold text-zinc-500">{visitor.card_type} {visitor.id_card_number && `• ${visitor.id_card_number}`}</span>
                        </div>
                    </div>
                </div>
                {visitor.status === 'IN' && (
                    <form action={async () => {
                        "use server";
                        await checkoutVisitor(visitor.id);
                    }}>
                        <button type="submit" className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                            รับบัตรคืน / ออกพื้นที่
                        </button>
                    </form>
                )}
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 mt-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                รายละเอียดการเข้าพบ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                <div>
                    <div className="text-sm text-zinc-500 mb-1">สถานที่ติดต่อ (บ้านเลขที่)</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{visitor.house_number || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-zinc-500 mb-1">ทะเบียนรถ</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{visitor.vehicle_plate || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-zinc-500 mb-1">จังหวัด</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{visitor.vehicle_province || '-'}</div>
                </div>
                <div>
                    <div className="text-sm text-zinc-500 mb-1">สีรถ</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">{visitor.vehicle_color || '-'}</div>
                </div>
                <div className="md:col-span-2 lg:col-span-4">
                    <div className="text-sm text-zinc-500 mb-1">จุดประสงค์ในการติดต่อ</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">{visitor.purpose || '-'}</div>
                </div>
                {visitor.image_url && (
                    <div className="md:col-span-2 lg:col-span-4">
                        <div className="text-sm text-zinc-500 mb-2">รูปรถที่ใช้เข้าสถานที่</div>
                        <img src={visitor.image_url} alt="Vehicle" className="w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm object-cover" />
                    </div>
                )}
            </div>
        </div>

        <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 md:p-10 ring-1 ring-zinc-900/5 dark:ring-white/5 mt-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                ประวัติเวลาเข้า-ออก และการชำระเงิน
            </h2>
            <div className="space-y-0">
                {timeline.map((item, index) => {
                    const isLast = index === timeline.length - 1 && visitor.check_out_time;
                    return (
                        <div key={index} className={`relative pl-6 ${!isLast ? 'border-l-2 border-zinc-200 dark:border-zinc-800 pb-8' : 'pt-2'}`}>
                            <div className={`absolute w-4 h-4 ${item.color} rounded-full -left-[9px] top-1 outline outline-4 outline-white dark:outline-[#121212]`}></div>
                            <div className={`font-bold mb-0.5 ${item.type === 'CHECKIN' ? 'text-emerald-600 dark:text-emerald-400' : item.type === 'ESTAMP' ? 'text-sky-600 dark:text-sky-400' : item.type === 'PAYMENT' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {item.title}
                            </div>
                            {item.subtitle && <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">{item.subtitle}</div>}
                            <div className="text-zinc-500 dark:text-zinc-400 font-mono text-sm">{item.time.toLocaleString('th-TH')}</div>
                        </div>
                    );
                })}

                {!visitor.check_out_time && (
                    <div className="relative border-l-2 border-transparent ml-0 pl-6 mt-2">
                        <div className="absolute w-4 h-4 bg-rose-500 rounded-full -left-[9px] top-1 outline outline-4 outline-white dark:outline-[#121212] animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                        <div className="text-rose-600 dark:text-rose-400 font-bold mb-1">สถานะปัจจุบัน</div>
                        <div className="text-zinc-600 dark:text-zinc-300">ยังอยู่ภายในพื้นที่สถานที่</div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
