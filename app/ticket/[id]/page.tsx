import { getVisitor } from "@/app/actions/visitors";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import TicketPrintAction from "./TicketPrintAction";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const visitorId = parseInt(resolvedParams.id, 10);
    if (isNaN(visitorId)) return notFound();

    const visitor = await getVisitor(visitorId);
    if (!visitor) return notFound();

    let siteName = "PSS GO";
    let effectiveSiteId = visitor.site_id;

    if (!effectiveSiteId && visitor.house_number) {
        const joinRes = await query("SELECT r.site_id, s.name FROM residents r LEFT JOIN sites s ON r.site_id = s.id WHERE r.house_number = $1 LIMIT 1", [visitor.house_number]);
        if (joinRes.rows.length > 0) {
            effectiveSiteId = joinRes.rows[0].site_id;
            if (joinRes.rows[0].name) {
                siteName = joinRes.rows[0].name;
            }
        }
    } else if (effectiveSiteId) {
        const siteRes = await query("SELECT name FROM sites WHERE id = $1", [effectiveSiteId]);
        if (siteRes.rows.length > 0) {
            siteName = siteRes.rows[0].name;
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pssgo.com";
    const webPayUrl = `${baseUrl}/webpay/${visitorId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(webPayUrl)}&margin=0`;

    return (
        <div className="bg-slate-200 min-h-screen flex justify-center py-10 print:py-0 print:bg-white print:block">
            {/* The Ticket Itself, constrained to approx 58mm (220px) width for testing, auto scales for thermal printer */}
            <div className="bg-white p-3 w-[220px] mx-auto text-black print:w-full print:max-w-none print:p-0 print:m-0 print:shadow-none shadow-md overflow-hidden flex flex-col items-center ticket-container">
                                
                <div className="flex flex-row items-center justify-center gap-1.5 w-full mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain grayscale" />
                    <span className="font-black text-[13px] tracking-tight">PSS GO</span>
                </div>
                
                <h1 className="text-sm font-black tracking-tighter text-center uppercase border-b border-black pb-1 mb-2 w-full truncate">
                    {siteName}
                </h1>
                
                <div className="text-[11px] text-center font-extrabold mb-1 tracking-wider">
                    บัตรจอดรถ
                </div>

                <div className="w-full bg-black text-white text-center py-2 my-2 rounded-sm border-2 border-black print:border-none print:border-black">
                    <div className="text-2xl font-black tracking-widest">{visitor.vehicle_plate || "ไม่ระบุ"}</div>
                    <div className="text-[10px] font-bold mt-0.5 tracking-wider">{visitor.vehicle_province || "กรุงเทพมหานคร"}</div>
                </div>

                <div className="w-full mt-1">
                    {visitor.house_number && (
                        <div className="w-full text-[12px] flex justify-between font-bold border-b border-black/50 border-dotted pb-0.5 mb-1.5">
                            <span>สถานที่/ห้อง:</span>
                            <span>{visitor.house_number}</span>
                        </div>
                    )}
                    <div className="w-full text-[12px] flex justify-between font-bold border-b border-black/50 border-dotted pb-0.5 mb-1.5">
                        <span>ประเภท:</span>
                        <span>{visitor.card_type || "Walk-in"}</span>
                    </div>
                </div>
                
                <div className="w-full text-[12px] flex justify-between font-bold border-b border-black/50 border-dotted pb-0.5 mb-3">
                    <span>IN:</span>
                    <span>{visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleTimeString('th-TH') : "-"}</span>
                </div>

                <div className="flex flex-col items-center justify-center w-full mb-3">
                    <div className="p-1 border-[3px] border-black rounded-sm print:border-[2px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl} alt="WebPay QR" className="w-[110px] h-[110px] grayscale" />
                    </div>
                    <div className="text-[10px] text-center font-bold tracking-tight mt-2 px-1 leading-tight">
                        สแกน QR Code นี้<br/>เพื่อเช็คยอดชำระออนไลน์
                    </div>
                </div>

                <div className="w-full text-center flex flex-col items-center gap-0.5 mt-2 mb-1">
                    <div className="text-[10px] font-bold tracking-tight">ไม่ต้องประทับตรากระดาษ</div>
                    <div className="text-[9px] font-bold tracking-tight bg-black text-white px-2 py-0.5 mt-0.5 uppercase">E-Stamp Only</div>
                </div>
                
                <TicketPrintAction />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; size: 58mm auto; }
                    body { margin: 0; background: white; }
                    .ticket-container { width: 58mm !important; padding: 2mm !important; }
                }
            `}} />
        </div>
    );
}
