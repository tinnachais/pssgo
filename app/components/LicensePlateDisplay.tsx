export default function LicensePlateDisplay({ 
    licensePlate, 
    province, 
    className = "" 
}: { 
    licensePlate: string; 
    province?: string; 
    className?: string;
}) {
    return (
        <div className={`inline-flex flex-col items-center justify-center bg-white border-2 border-black shadow-[0_2px_4px_rgba(0,0,0,0.1)] px-4 py-1.5 rounded-[6px] relative overflow-hidden ${className}`} style={{ minWidth: "130px" }}>
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/10 to-black/5 pointer-events-none"></div>
            
            {/* Inner border (emboss effect) */}
            <div className="absolute inset-0 border border-black/20 rounded-[4px] pointer-events-none m-[2px]"></div>
            
            {/* License plate characters */}
            <div className="font-black text-black tracking-widest text-xl leading-none relative z-10 font-sans" style={{ textShadow: "0px 1px 0px rgba(255,255,255,0.8)" }}>
                {licensePlate}
            </div>
            
            {/* Province name */}
            <div className="text-[11px] text-black font-bold mt-1 leading-none relative z-10 tracking-widest">
                {province || 'กรุงเทพมหานคร'}
            </div>
            
            {/* Plate screws */}
            <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]"></div>
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400 border border-zinc-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]"></div>
        </div>
    );
}
