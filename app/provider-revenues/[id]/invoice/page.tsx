import { getProviderRevenueById } from "@/app/actions/provider_revenues";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";

import PrintButtons from "./PrintButtons";

dayjs.locale("th");

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const revenue = await getProviderRevenueById(parseInt(id, 10));

    if (!revenue) {
        notFound();
    }

    const { site_name, provider_name, provider_address, provider_tax_id, package_name, billing_cycle, amount, created_at, status } = revenue;
    const prefix = status === 'PENDING' ? 'INV' : 'REC';
    const invoiceNo = `${prefix}-${dayjs(created_at).format('YYYYMMDD')}-${id.padStart(4, '0')}`;
    const formattedAmount = parseFloat(amount).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const vatAmount = (parseFloat(amount) * 7 / 107).toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const preVatAmount = (parseFloat(amount) * 100 / 107).toLocaleString('th-TH', { minimumFractionDigits: 2 });

    return (
        <div className="bg-zinc-200/50 min-h-screen py-10 font-sans print:bg-white print:py-0 selection:bg-indigo-500/30 text-zinc-800">
            {/* Top Toolbar (Hidden in Print) */}
            <PrintButtons />

            {/* A4 Paper Container */}
            <div className="max-w-[21cm] min-h-[29.7cm] mx-auto bg-white p-[2cm] shadow-xl ring-1 ring-zinc-900/5 print:shadow-none print:ring-0 print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <div className="w-16 h-16 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-2xl mb-4">
                            {provider_name ? provider_name.charAt(0).toUpperCase() : 'PSS'}
                        </div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-1">
                            {revenue.status === 'PENDING' ? 'à¹ƒà¸šà¹à¸ˆà¹‰à¸‡à¸«à¸™à¸µà¹‰' : 'à¹ƒà¸šà¹€à¸ªà¸£à¹‡à¸ˆà¸£à¸±à¸šà¹€à¸‡à¸´à¸™'}
                        </h1>
                        <p className="text-zinc-500 font-medium">
                            {revenue.status === 'PENDING' ? 'INVOICE' : 'RECEIPT'}
                        </p>
                    </div>
                    <div className="text-right max-w-sm">
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">{provider_name || 'GP Platform'}</h2>
                        <div className="text-sm text-zinc-500 space-y-1">
                            {provider_address ? (
                                <p className="whitespace-pre-wrap">{provider_address}</p>
                            ) : (
                                <p>à¸šà¸£à¸´à¸©à¸±à¸— à¸žà¸µà¹€à¸­à¸ªà¹€à¸­à¸ª à¹‚à¸ à¸ˆà¸³à¸à¸±à¸”</p>
                            )}
                            {provider_tax_id && (
                                <p>à¹€à¸¥à¸‚à¸›à¸£à¸°à¸ˆà¸³à¸•à¸±à¸§à¸œà¸¹à¹‰à¹€à¸ªà¸µà¸¢à¸ à¸²à¸©à¸µ: {provider_tax_id}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">à¸¥à¸¹à¸à¸„à¹‰à¸² / à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ (Customer/Site)</h3>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-5">
                            <p className="font-bold text-zinc-900 text-lg mb-1">{site_name || '-'}</p>
                            <p className="text-sm text-zinc-600">à¸Šà¸³à¸£à¸°à¸„à¹ˆà¸²à¸šà¸£à¸´à¸à¸²à¸£à¸£à¸°à¸šà¸šà¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ GP</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹€à¸­à¸à¸ªà¸²à¸£ (Document Details)</h3>
                        <div className="space-y-3 p-5">
                            <div className="flex justify-between">
                                <span className="text-sm text-zinc-500">à¹€à¸¥à¸‚à¸—à¸µà¹ˆà¹€à¸­à¸à¸ªà¸²à¸£ (Invoice No.):</span>
                                <span className="text-sm font-bold text-zinc-900">{invoiceNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-zinc-500">à¸§à¸±à¸™à¸—à¸µà¹ˆà¸­à¸­à¸à¹€à¸­à¸à¸ªà¸²à¸£ (Date):</span>
                                <span className="text-sm font-bold text-zinc-900">{dayjs(created_at).format('DD MMM YYYY')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-zinc-900">
                                <th className="py-3 text-sm font-bold text-zinc-900">à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸” (Description)</th>
                                <th className="py-3 text-sm font-bold text-zinc-900 text-center w-32">à¸£à¸­à¸šà¸šà¸´à¸¥ (Cycle)</th>
                                <th className="py-3 text-sm font-bold text-zinc-900 text-right w-40">à¸ˆà¸³à¸™à¸§à¸™à¹€à¸‡à¸´à¸™ (Amount)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <tr>
                                <td className="py-5">
                                    <p className="font-bold text-zinc-900 mb-1">à¸„à¹ˆà¸²à¸šà¸£à¸´à¸à¸²à¸£à¸£à¸°à¸šà¸š GP: {package_name || 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸'}</p>
                                    <p className="text-xs text-zinc-500">
                                        à¸•à¹ˆà¸­à¸­à¸²à¸¢à¸¸à¹à¸žà¹‡à¸à¹€à¸à¸ˆà¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´ 
                                        {revenue.period_start && revenue.period_end && (
                                            <span className="ml-1 text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                à¸„à¸£à¸­à¸šà¸„à¸¥à¸¸à¸¡à¸§à¸±à¸™à¸—à¸µà¹ˆ {dayjs(revenue.period_start).format('DD MMM')} - {dayjs(revenue.period_end).format('DD MMM YYYY')}
                                            </span>
                                        )}
                                    </p>
                                </td>
                                <td className="py-5 text-center">
                                    <span className="text-sm font-medium text-zinc-700">
                                        {billing_cycle === 'YEARLY' ? 'à¸£à¸²à¸¢à¸›à¸µ (Yearly)' : 'à¸£à¸²à¸¢à¹€à¸”à¸·à¸­à¸™ (Monthly)'}
                                    </span>
                                </td>
                                <td className="py-5 text-right font-bold text-zinc-900">
                                    {formattedAmount}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-600">
                                <span>à¸¡à¸¹à¸¥à¸„à¹ˆà¸²à¸à¹ˆà¸­à¸™à¸ à¸²à¸©à¸µ (Pre-VAT):</span>
                                <span>{preVatAmount}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                                <span>à¸ à¸²à¸©à¸µà¸¡à¸¹à¸¥à¸„à¹ˆà¸²à¹€à¸žà¸´à¹ˆà¸¡ (VAT 7%):</span>
                                <span>{vatAmount}</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-zinc-900 pt-3 text-lg font-black text-zinc-900">
                                <span>à¸¢à¸­à¸”à¸£à¸§à¸¡à¸—à¸±à¹‰à¸‡à¸ªà¸´à¹‰à¸™ (Grand Total):</span>
                                <span>{formattedAmount} THB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signature/Footer */}
                <div className="grid grid-cols-2 gap-12 mt-24">
                    <div className="text-center">
                        <div className="border-b border-zinc-300 mx-10 mb-2 h-10"></div>
                        <p className="text-sm font-bold text-zinc-800">à¸œà¸¹à¹‰à¸£à¸±à¸šà¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™ (Receiver)</p>
                        <p className="text-xs text-zinc-500 mt-1">à¸§à¸±à¸™à¸—à¸µà¹ˆ (Date) ........................................</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-zinc-300 mx-10 mb-2 h-10 flex items-end justify-center pb-1">
                            {/* Auto System Signature */}
                            <span className="text-xs text-zinc-400 italic font-medium">Auto-generated via System</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-800">à¸œà¸¹à¹‰à¸­à¸­à¸à¹€à¸­à¸à¸ªà¸²à¸£ (Issuer)</p>
                        <p className="text-xs text-zinc-500 mt-1">à¸§à¸±à¸™à¸—à¸µà¹ˆ (Date) {dayjs(created_at).format('DD/MM/YYYY')}</p>
                    </div>
                </div>

                {/* Print Footer Notice */}
                <div className="mt-16 text-center text-xs text-zinc-400 font-medium pb-8 border-b-[8px] border-indigo-600">
                    <p>à¸‚à¸­à¸šà¸„à¸¸à¸“à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸šà¸£à¸´à¸à¸²à¸£ GP: Smart Security Platform</p>
                </div>

            </div>
        </div>
    );
}

