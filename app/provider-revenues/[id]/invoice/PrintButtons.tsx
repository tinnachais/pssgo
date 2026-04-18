"use client";

export default function PrintButtons() {
    return (
        <div className="max-w-[21cm] mx-auto mb-6 flex justify-end gap-3 print:hidden">
            <button 
                onClick={() => window.close()} 
                className="px-4 py-2 bg-white text-zinc-600 font-bold rounded-lg shadow-sm border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
                ปิดหน้าต่าง
            </button>
            <button 
                onClick={() => window.print()} 
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                พิมพ์เอกสาร
            </button>
        </div>
    );
}
