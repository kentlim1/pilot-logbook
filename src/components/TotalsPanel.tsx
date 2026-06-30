import { formatHours } from "@/lib/time";
import type { FlightRow } from "@/types/database";

export function TotalsPanel({ flights }: { flights: FlightRow[] }) {
  const totals = flights.reduce(
    (acc, f) => {
      acc.total += f.block_time;
      acc.pic += f.pic_time;
      acc.sic += f.sic_time;
      acc.night += f.night_time;
      acc.landings += f.day_landings + f.night_landings;
      return acc;
    },
    { total: 0, pic: 0, sic: 0, night: 0, landings: 0 }
  );

  const items = [
    { label: "Total time", value: formatHours(totals.total) },
    { label: "PIC", value: formatHours(totals.pic) },
    { label: "SIC", value: formatHours(totals.sic) },
    { label: "Night", value: formatHours(totals.night) },
    { label: "Landings", value: String(totals.landings) },
  ];

  return (
    <div className="grid grid-cols-5 divide-x divide-neutral-200 rounded-2xl border border-neutral-200 bg-white py-3 shadow-sm">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-bold tabular-nums text-neutral-900">{item.value}</span>
          <span className="text-[11px] text-neutral-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
