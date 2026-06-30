import type { FlightRow } from "@/types/database";

function sum(flights: FlightRow[], pick: (f: FlightRow) => number): number {
  return flights.reduce((acc, f) => acc + pick(f), 0);
}

export interface MilestoneDef {
  id: string;
  label: string;
  defaultTarget: number;
  compute: (flights: FlightRow[]) => number;
}

// A fixed set of commonly-tracked career milestones; targets are editable per
// pilot (thresholds like ATP minimums vary by country/employer) and persist locally.
export const MILESTONE_DEFS: MilestoneDef[] = [
  { id: "total", label: "Total time", defaultTarget: 1500, compute: (fs) => sum(fs, (f) => f.block_time) },
  { id: "pic", label: "PIC time", defaultTarget: 1000, compute: (fs) => sum(fs, (f) => f.pic_time) },
  {
    id: "turbine_pic",
    label: "Turbine PIC",
    defaultTarget: 500,
    compute: (fs) => sum(fs.filter((f) => f.is_turbine), (f) => f.pic_time),
  },
  { id: "multi_engine", label: "Multi-engine", defaultTarget: 500, compute: (fs) => sum(fs, (f) => f.multi_engine_time) },
  { id: "instrument", label: "Instrument", defaultTarget: 40, compute: (fs) => sum(fs, (f) => f.instrument_time) },
];

const STORAGE_KEY = "pilot-logbook:milestone-targets";

export function readMilestoneTargets(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function writeMilestoneTarget(id: string, target: number): void {
  const current = readMilestoneTargets();
  current[id] = target;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}
