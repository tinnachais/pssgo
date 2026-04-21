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
                            {revenue.status === 'PENDING' ? 'ใบแจ้งหนี้' : 'ใบเสร็จรับเงิน'}
                        </h1>
                        <p className="text-zinc-500 font-medium">
                            {revenue.status === 'PENDING' ? 'INVOICE' : 'RECEIPT'}
                        </p>
                    </div>
                    <div className="text-right max-w-sm">
                        <h2 className="text-xl font-bold text-zinc-900 mb-1">{provider_name || 'PSS GO Platform'}</h2>
                        <div className="text-sm text-zinc-500 space-y-1">
                            {provider_address ? (
                                <p className="whitespace-pre-wrap">{provider_address}</p>
                            ) : (
                                <p>บริษัท พีเอสเอส โก จำกัด</p>
                            )}
                            {provider_tax_id && (
                                <p>เลขประจำตัวผู้เสียภาษี: {provider_tax_id}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">ลูกค้า / สถานที่ (Customer/Site)</h3>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-5">
                            <p className="font-bold text-zinc-900 text-lg mb-1">{site_name || '-'}</p>
                            <p className="text-sm text-zinc-600">ชำระค่าบริการระบบจัดการสถานที่ PSS GO</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">รายละเอียดเอกสาร (Document Details)</h3>
                        <div className="space-y-3 p-5">
                            <div className="flex justify-between">
                                <span className="text-sm text-zinc-500">เลขที่เอกสาร (Invoice No.):</span>
                                <span className="text-sm font-bold text-zinc-900">{invoiceNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-zinc-500">วันที่ออกเอกสาร (Date):</span>
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
                                <th className="py-3 text-sm font-bold text-zinc-900">รายละเอียด (Description)</th>
                                <th className="py-3 text-sm font-bold text-zinc-900 text-center w-32">รอบบิล (Cycle)</th>
                                <th className="py-3 text-sm font-bold text-zinc-900 text-right w-40">จำนวนเงิน (Amount)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <tr>
                                <td className="py-5">
                                    <p className="font-bold text-zinc-900 mb-1">ค่าบริการระบบ PSS GO: {package_name || 'ไม่ระบุ'}</p>
                                    <p className="text-xs text-zinc-500">
                                        ต่ออายุแพ็กเกจสถานที่อัตโนมัติ 
                                        {revenue.period_start && revenue.period_end && (
                                            <span className="ml-1 text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                                                ครอบคลุมวันที่ {dayjs(revenue.period_start).format('DD MMM')} - {dayjs(revenue.period_end).format('DD MMM YYYY')}
                                            </span>
                                        )}
                                    </p>
                                </td>
                                <td className="py-5 text-center">
                                    <span className="text-sm font-medium text-zinc-700">
                                        {billing_cycle === 'YEARLY' ? 'รายปี (Yearly)' : 'รายเดือน (Monthly)'}
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
                                <span>มูลค่าก่อนภาษี (Pre-VAT):</span>
                                <span>{preVatAmount}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                                <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                <span>{vatAmount}</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-zinc-900 pt-3 text-lg font-black text-zinc-900">
                                <span>ยอดรวมทั้งสิ้น (Grand Total):</span>
                                <span>{formattedAmount} THB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signature/Footer */}
                <div className="grid grid-cols-2 gap-12 mt-24">
                    <div className="text-center">
                        <div className="border-b border-zinc-300 mx-10 mb-2 h-10"></div>
                        <p className="text-sm font-bold text-zinc-800">ผู้รับชำระเงิน (Receiver)</p>
                        <p className="text-xs text-zinc-500 mt-1">วันที่ (Date) ........................................</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-zinc-300 mx-10 mb-2 h-10 flex items-end justify-center pb-1">
                            {/* Auto System Signature */}
                            <span className="text-xs text-zinc-400 italic font-medium">Auto-generated via System</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-800">ผู้ออกเอกสาร (Issuer)</p>
                        <p className="text-xs text-zinc-500 mt-1">วันที่ (Date) {dayjs(created_at).format('DD/MM/YYYY')}</p>
                    </div>
                </div>

                {/* Print Footer Notice */}
                <div className="mt-16 text-center text-xs text-zinc-400 font-medium pb-8 border-b-[8px] border-indigo-600">
                    <p>ขอบคุณที่ใช้บริการ PSS GO: Smart Security Platform</p>
                </div>

            </div>
        </div>
    );
}
