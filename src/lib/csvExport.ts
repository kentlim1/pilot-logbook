import type { FlightRow } from "@/types/database";

const COLUMNS: { key: keyof FlightRow; label: string }[] = [
  { key: "flight_date", label: "Date" },
  { key: "aircraft_type", label: "Aircraft" },
  { key: "tail_number", label: "Tail" },
  { key: "dep_airport", label: "From" },
  { key: "arr_airport", label: "To" },
  { key: "out_time", label: "Out" },
  { key: "in_time", label: "In" },
  { key: "block_time", label: "Block" },
  { key: "pic_time", label: "PIC" },
  { key: "sic_time", label: "SIC" },
  { key: "night_time", label: "Night" },
  { key: "multi_engine_time", label: "Multi-engine" },
  { key: "cross_country_time", label: "Cross-country" },
  { key: "instrument_time", label: "Instrument" },
  { key: "day_landings", label: "Day landings" },
  { key: "night_landings", label: "Night landings" },
  { key: "approaches", label: "Approaches" },
  { key: "is_turbine", label: "Turbine" },
  { key: "remarks", label: "Remarks" },
];

function escapeCsvField(value: FlightRow[keyof FlightRow]): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// Real paper logbooks are filled in chronologically, so exports go oldest-first
// regardless of the newest-first order the app displays on screen.
export function chronological(flights: FlightRow[]): FlightRow[] {
  return [...flights].sort(
    (a, b) => a.flight_date.localeCompare(b.flight_date) || a.created_at.localeCompare(b.created_at)
  );
}

export function flightsToCsv(flights: FlightRow[]): string {
  const header = COLUMNS.map((c) => c.label).join(",");
  const rows = chronological(flights).map((f) => COLUMNS.map((c) => escapeCsvField(f[c.key])).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(flights: FlightRow[]): void {
  const blob = new Blob([flightsToCsv(flights)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pilot-logbook-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
