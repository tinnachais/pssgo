"use client";

import { useState } from "react";
import { deleteLiffUserAndData } from "@/app/actions/residents";

export default function DeleteLiffUserButton({ id }: { id: number }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การลบจะทำให้ยานพาหนะและข้อมูลที่เกี่ยวข้องหายไปทั้งหมด")) return;
        
        setIsDeleting(true);
        try {
            await deleteLiffUserAndData(id);
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
            setIsDeleting(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 p-2 rounded-xl transition-colors disabled:opacity-50 ml-2"
            title="ลบผู้ใช้"
        >
            {isDeleting ? (
                <svg className="animate-spin w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            )}
        </button>
    );
}
