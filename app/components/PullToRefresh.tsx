"use client";

import { useState } from "react";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
    const [pullY, setPullY] = useState(0);
    const [startY, setStartY] = useState(0);
    const [isPulling, setIsPulling] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY <= 0) {
            setStartY(e.touches[0].clientY);
        } else {
            setStartY(0);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY > 0 && window.scrollY <= 0) {
            const y = e.touches[0].clientY;
            // เพิ่มความฝืด (resistance) ต้องลากยาวขึ้นถึงจะรีเฟรช
            const diff = (y - startY) * 0.4;
            if (diff > 0) {
                // Prevent default scrolling when pulling to refresh
                if (e.cancelable) {
                    e.preventDefault();
                }
                setPullY(diff > 100 ? 100 : diff);
                setIsPulling(true);
            }
        }
    };

    const handleTouchEnd = () => {
        if (pullY >= 80) {
            window.location.reload();
        } else {
            setPullY(0);
            setIsPulling(false);
        }
    };

    return (
        <div 
            className="w-full min-h-screen relative" 
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull Indicator */}
            <div 
                className="absolute top-0 left-0 w-full flex items-center justify-center overflow-hidden z-50 pointer-events-none" 
                style={{ 
                    height: pullY > 0 ? '50px' : '0px', 
                    opacity: Math.min(pullY / 100, 1), 
                    transition: isPulling ? 'none' : 'height 0.3s, opacity 0.3s' 
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-sm border border-slate-100 flex items-center justify-center mt-2">
                    <svg className={`w-5 h-5 text-[#06C755] ${pullY >= 80 ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
            </div>

            {/* Content Wrapper */}
            <div 
                className="w-full min-h-screen" 
                style={{ 
                    transform: `translateY(${pullY}px)`, 
                    transition: isPulling ? 'none' : 'transform 0.3s ease-out' 
                }}
            >
                {children}
            </div>
        </div>
    );
}
