import { getVisitor } from "@/app/actions/visitors";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import ReceiptActions from "./ReceiptActions";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const revenueId = parseInt(resolvedParams.id, 10);
    if (isNaN(revenueId)) return notFound();

    // Fetch the specific revenue record by its ID
    const revenueRes = await query("SELECT * FROM revenues WHERE id = $1 AND payment_status = 'PAID'", [revenueId]);
    if (revenueRes.rows.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p className="text-slate-500 mb-2">à¹„à¸¡à¹ˆà¸žà¸šà¸›à¸£à¸°à¸§à¸±à¸•à¸´à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™ à¸«à¸£à¸·à¸­à¸šà¸´à¸¥à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™</p>
                </div>
            </div>
        );
    }
    
    const receipt = revenueRes.rows[0];
    const visitorId = receipt.visitor_id;
    
    const visitor = await getVisitor(visitorId);
    if (!visitor) return notFound();

    let siteName = "GP";
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

    // Embed logo as base64 to prevent html-to-image from timing out or having CORS issues with heavy images
    let base64Logo = "";
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const logoBuffer = fs.readFileSync(logoPath);
        base64Logo = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (e) {
        console.error("Failed to load logo.png as base64");
    }

    return (
        <div className="bg-slate-200 min-h-screen flex justify-center py-10 print:py-0 print:bg-white print:block">
            <div className="flex flex-col items-center">
                {/* The Receipt Itself, 58mm (220px) width */}
                <div id="receipt-container" className="bg-white p-3 w-[220px] mx-auto text-black print:w-full print:max-w-none print:p-0 print:m-0 print:shadow-none shadow-md overflow-hidden flex flex-col items-center ticket-container">
                                    
                    <div className="flex flex-row items-center justify-center gap-1.5 w-full mb-1">
                        {base64Logo ? (
                            <img src={base64Logo} alt="Logo" className="w-5 h-5 object-contain grayscale" />
                        ) : (
                            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                               <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.5 14H11V17H9V7H13.5C15.43 7 17 8.57 17 10.5C17 12.43 15.43 14 13.5 14ZM13.5 9H11V12H13.5C14.33 12 15 11.33 15 10.5C15 9.67 14.33 9 13.5 9Z" />
                            </svg>
                        )}
                        <span className="font-black text-[13px] tracking-tight">GP</span>
                    </div>
                    
                    <h1 className="text-sm font-black tracking-tighter text-center uppercase pb-1 w-full truncate">
                        {siteName}
                    </h1>
                    
                    <div className="text-[12px] text-center font-black mb-1 tracking-wider border-b border-black pb-1 w-full">
                        à¹ƒà¸šà¹€à¸ªà¸£à¹‡à¸ˆà¸£à¸±à¸šà¹€à¸‡à¸´à¸™à¸­à¸¢à¹ˆà¸²à¸‡à¸¢à¹ˆà¸­
                    </div>

                    <div className="w-full text-[10px] mt-1 space-y-0.5">
                        <div className="flex justify-between">
                            <span className="font-bold">à¹€à¸¥à¸‚à¸—à¸µà¹ˆà¹ƒà¸šà¹€à¸ªà¸£à¹‡à¸ˆ:</span>
                            <span>{receipt.receipt_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">à¸§à¸±à¸™à¸—à¸µà¹ˆ/à¹€à¸§à¸¥à¸²:</span>
                            <span>{new Date(receipt.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        {visitor.house_number && (
                            <div className="flex justify-between">
                                <span className="font-bold">à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ/à¸«à¹‰à¸­à¸‡:</span>
                                <span>{visitor.house_number}</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full bg-black text-white text-center py-1.5 my-2 rounded-sm border-2 border-black print:border-none print:border-black">
                        <div className="text-xl font-black tracking-widest">{visitor.vehicle_plate || "à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸"}</div>
                    </div>

                    <div className="w-full text-[10px] mt-1 border-t border-black/50 border-dotted pt-1">
                        <div className="flex justify-between py-1">
                            <span>à¸„à¹ˆà¸²à¸šà¸£à¸´à¸à¸²à¸£à¸ˆà¸­à¸”à¸£à¸– (Parking Fee)</span>
                            <span className="font-bold">à¸¿{parseFloat(receipt.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    
                    <div className="w-full text-[11px] flex justify-between font-black border-t border-b border-black py-1 my-2">
                        <span>à¸¢à¸­à¸”à¸£à¸§à¸¡à¸ªà¸¸à¸—à¸˜à¸´ (TOTAL)</span>
                        <span>à¸¿{parseFloat(receipt.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="w-full text-[10px] space-y-0.5 mb-3">
                        <div className="flex justify-between">
                            <span className="font-bold">à¸§à¸´à¸˜à¸µà¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™:</span>
                            <span>{receipt.payment_method || "à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">à¸ªà¸–à¸²à¸™à¸°:</span>
                            <span>à¸Šà¸³à¸£à¸°à¹à¸¥à¹‰à¸§ (PAID)</span>
                        </div>
                    </div>

                    <div className="w-full text-center flex flex-col items-center gap-0.5 mt-2 mb-2">
                        <div className="text-[9px] font-medium tracking-tight">à¸‚à¸­à¸šà¸„à¸¸à¸“à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸šà¸£à¸´à¸à¸²à¸£ / THANK YOU</div>
                    </div>
                </div>

                <div className="w-[220px]">
                    <ReceiptActions visitorId={visitorId} />
                </div>
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

