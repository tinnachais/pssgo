import { getGates } from "@/app/actions/gates";
import SimulatorClient from "./SimulatorClient";

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  let gates: any[] = [];
  
  try {
    gates = await getGates();
  } catch (err) {
    console.error("Failed to fetch gates for simulator:", err);
  }

  return <SimulatorClient gates={gates} />;
}
