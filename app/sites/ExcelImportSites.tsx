"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { bulkAddSites } from "@/app/actions/sites";
import { useRouter } from "next/navigation";

export default function ExcelImportSites() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        name: "ตัวอย่างสถานที่ A",
        address: "123 ถ.สุขุมวิท กรุงเทพฯ",
        provider_id: "",
        max_vehicles: 50,
        lat: 13.7563,
        lng: 100.5018,
        contact_link: "https://lin.ee/example",
        package_id: "",
        type: "Tier 4 สาธารณะ (Others)",
        enable_appointments: 1,
        enable_visitor_id_exchange: 1,
        mock_slots_car: 20,
        mock_slots_motorcycle: 10,
        mock_free_time_car: "2 ชม. แรก",
        mock_free_time_motorcycle: "1 ชม. แรก",
        mock_fee_car: "ชม.ละ 20 บาท",
        mock_fee_motorcycle: "ชม.ละ 10 บาท",
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    const wscols = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
      { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sites");

    XLSX.writeFile(wb, "Sites_Template.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data && data.length > 0) {
            await bulkAddSites(data);
            alert("นำเข้าข้อมูลสถานที่สำเร็จ " + data.length + " รายการ");
            router.refresh();
          } else {
            alert("ไม่พบข้อมูลในไฟล์ Excel");
          }
        } catch (error) {
          console.error("Error parsing Excel:", error);
          alert("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel");
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="flex gap-2 items-center flex-shrink-0">
      <button 
        onClick={handleDownloadTemplate}
        className="text-indigo-600 hover:text-indigo-700 font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/10 hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        โหลด Template
      </button>

      <input 
        type="file" 
        accept=".xlsx, .xls" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        id="excel-upload"
      />
      <label 
        htmlFor="excel-upload"
        className={(isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]') + " bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
        อัปโหลด Excel
      </label>
    </div>
  );
}
