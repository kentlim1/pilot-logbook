import type { FlightRow } from "@/types/database";

interface Series {
  date: string;
  total: number;
  pic: number;
  sic: number;
}

// Cumulative running totals by calendar day, oldest first, so a simple line
// chart traces each pilot's career hours climbing over time.
function buildSeries(flights: FlightRow[]): Series[] {
  const byDate = new Map<string, { total: number; pic: number; sic: number }>();
  for (const f of flights) {
    const entry = byDate.get(f.flight_date) ?? { total: 0, pic: 0, sic: 0 };
    entry.total += f.block_time;
    entry.pic += f.pic_time;
    entry.sic += f.sic_time;
    byDate.set(f.flight_date, entry);
  }
  const dates = Array.from(byDate.keys()).sort();
  let total = 0;
  let pic = 0;
  let sic = 0;
  return dates.map((date) => {
    const day = byDate.get(date)!;
    total += day.total;
    pic += day.pic;
    sic += day.sic;
    return { date, total, pic, sic };
  });
}

function toPath(values: number[], max: number, width: number, height: number): string {
  if (values.length === 0) return "";
  if (values.length === 1) {
    const y = height - (values[0] / max) * height;
    return `M 0 ${y} L ${width} ${y}`;
  }
  const stepX = width / (values.length - 1);
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${height - (v / max) * height}`).join(" ");
}

const WIDTH = 320;
const HEIGHT = 140;

export function HoursChart({ flights }: { flights: FlightRow[] }) {
  const series = buildSeries(flights);

  if (series.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-neutral-500">
        Log a few more flights to see your hours trend.
      </p>
    );
  }

  const max = Math.max(...series.map((s) => s.total), 1);
  const totalPath = toPath(series.map((s) => s.total), max, WIDTH, HEIGHT);
  const picPath = toPath(series.map((s) => s.pic), max, WIDTH, HEIGHT);
  const sicPath = toPath(series.map((s) => s.sic), max, WIDTH, HEIGHT);
  const latest = series[series.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" preserveAspectRatio="none">
        <line x1={0} y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke="#e5e5e5" strokeWidth={1} />
        <path d={sicPath} fill="none" stroke="#a3a3a3" strokeWidth={2} />
        <path d={picPath} fill="none" stroke="#059669" strokeWidth={2} />
        <path d={totalPath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      </svg>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{series[0].date}</span>
        <span>{latest.date}</span>
      </div>
      <div className="flex justify-center gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-blue-600">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> Total {latest.total.toFixed(1)}h
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-600" /> PIC {latest.pic.toFixed(1)}h
        </span>
        <span className="flex items-center gap-1.5 text-neutral-500">
          <span className="h-2 w-2 rounded-full bg-neutral-400" /> SIC {latest.sic.toFixed(1)}h
        </span>
      </div>
    </div>
  );
}
