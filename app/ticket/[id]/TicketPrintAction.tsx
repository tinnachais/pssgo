"use client";

import { useEffect, useState } from "react";

export default function TicketPrintAction() {
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        // Automatically open print dialog after brief delay for images to load
        const timer = setTimeout(() => {
            window.print();
            setIsPrinting(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`mt-4 print:hidden w-full space-y-2 text-center`}>
            {isPrinting ? (
                <div className="text-xs text-slate-500 mb-2">กำลังพิมพ์... 🖨️</div>
            ) : null}
            <button 
                onClick={() => window.print()} 
                className="w-full bg-blue-600 text-white font-bold py-2 rounded text-xs"
            >
                พิมพ์อีกครั้ง (Print Again)
            </button>
            <button 
                onClick={() => window.close()} 
                className="w-full bg-slate-200 text-slate-700 font-bold py-2 rounded text-xs"
            >
                ปิดหน้าต่าง (Close)
            </button>
        </div>
    );
}
