import { getAccessLogs, getMonitorStats } from "@/app/actions/monitor";
import LiveMonitorClient from "./LiveMonitorClient";

export const dynamic = "force-dynamic";

export default async function MonitorPage() {
  let logs: any[] = [];
  let stats: any = { total_in: 0, total_out: 0, currently_inside: 0 };
  
  try {
    logs = await getAccessLogs(50);
    stats = await getMonitorStats();
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-full font-sans selection:bg-emerald-500/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">รายการเข้าออก</h1>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider relative flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              ตรวจสอบการเข้า-ออกสถานที่แบบเรียลไทม์ (Live Logs)
            </p>
          </div>
        </div>

        <LiveMonitorClient initialLogs={logs} initialStats={stats} />
      </main>
    </div>
  );
}
