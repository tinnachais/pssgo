"use client";

import { useState, useEffect } from "react";

export default function SimulatorClient({ gates = [] }: { gates?: any[] }) {
  const [licensePlate, setLicensePlate] = useState("");
  const [action, setAction] = useState("IN");
  const [type, setType] = useState("VISITOR");
  const [gateName, setGateName] = useState(gates.length > 0 ? gates[0].name : "GATE_MAIN_01");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [simulatedTime, setSimulatedTime] = useState(""); // empty means current time
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  // Update gateName if gates change
  useEffect(() => {
    if (gates.length > 0 && !gates.find(g => g.name === gateName)) {
      setGateName(gates[0].name);
    }
  }, [gates]);

  const handleSimulate = async () => {
    if (!licensePlate) {
      alert("กรุณากรอกป้ายทะเบียน");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        license_plate: licensePlate,
        action,
        type,
        gate_name: gateName,
      } as any;

      if (!useCurrentTime && simulatedTime) {
        payload.created_at = simulatedTime;
      }

      const response = await fetch("/api/lpr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      const newLog = {
        timestamp: useCurrentTime ? new Date().toLocaleTimeString() : new Date(simulatedTime).toLocaleTimeString(),
        request: payload,
        response: result,
        success: response.ok
      };

      setLogs([newLog, ...logs].slice(0, 10));
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full font-sans selection:bg-indigo-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">LPR Simulator</h1>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">เครื่องมือทดสอบ</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              จำลองการส่งข้อมูลเข้า-ออกจากกล้องอ่านป้ายทะเบียน (LPR) หรือเครื่อง Handheld ของ รปภ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800/80 p-8 ring-1 ring-zinc-900/5 dark:ring-white/5">
            <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              ข้อมูลจำลอง (Input Data)
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ป้ายทะเบียน (License Plate)</label>
                <input 
                  type="text" 
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="เช่น 1กข 1234"
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold tracking-wide placeholder:font-normal placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ทิศทาง (Action)</label>
                  <select 
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
                  >
                    <option value="IN">เข้า (IN)</option>
                    <option value="OUT">ออก (OUT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">ประเภทรถ (Type)</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
                  >
                    <option value="VISITOR">ผู้มาติดต่อ (Visitor)</option>
                    <option value="RESIDENT">ลูกบ้าน (Resident)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">เวลาที่บันทึก (Log Time)</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={useCurrentTime}
                      onChange={(e) => setUseCurrentTime(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                    />
                    <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">ใช้เวลาปัจจุบัน (Real-time)</span>
                  </label>
                </div>
                {!useCurrentTime && (
                  <input 
                    type="datetime-local" 
                    value={simulatedTime}
                    onChange={(e) => setSimulatedTime(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">จุดบริการ / ประตู (Gate)</label>
                <select 
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold"
                >
                  {gates.length === 0 ? (
                    <option value="">-- ไม่พบจุดบริการ --</option>
                  ) : (
                    gates.map((g) => (
                      <option key={g.id} value={g.name}>{g.name} ({g.site_name})</option>
                    ))
                  )}
                </select>
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                จำลองการส่งข้อมูล (Simulate)
              </button>
            </div>
          </div>

          {/* Result Logs */}
          <div className="bg-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-800 overflow-hidden flex flex-col h-[600px]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Simulator Output
                </h3>
                <button 
                  onClick={() => setLogs([])}
                  className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  Clear Logs
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                     <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <p className="text-sm font-medium italic">Waiting for simulation data...</p>
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 font-mono text-xs">
                       <div className="flex items-center justify-between mb-2">
                          <span className={`${log.success ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
                            {log.success ? '✓ SUCCESS' : '✗ FAILED'}
                          </span>
                          <span className="text-zinc-500">{log.timestamp}</span>
                       </div>
                       <div className="text-indigo-400 mb-1">REQ: {JSON.stringify(log.request)}</div>
                       <div className="text-zinc-300">RES: {JSON.stringify(log.response)}</div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
