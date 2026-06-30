"use client";

import Link from "next/link";
import { HoursChart } from "@/components/HoursChart";
import { MilestonesPanel } from "@/components/MilestonesPanel";
import { chronological, downloadCsv } from "@/lib/csvExport";
import { formatHours } from "@/lib/time";
import { useFlights } from "@/lib/useFlights";

export default function StatsPage() {
  const { flights, loading, error } = useFlights();
  const printable = chronological(flights);
  const totalHours = flights.reduce((acc, f) => acc + f.block_time, 0);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-12 pt-6">
      <div className="flex flex-col gap-5 print:hidden">
        <header className="flex items-center justify-between gap-2">
          <Link href="/" className="text-sm font-medium text-blue-600">
            ← Back
          </Link>
          <h1 className="text-lg font-bold">Stats &amp; export</h1>
          <span className="w-10" />
        </header>

        {loading && flights.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500">Loading...</p>
        )}
        {error && <p className="text-xs font-medium text-amber-600">{error}</p>}

        {flights.length > 0 && (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Hours over time
              </h2>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <HoursChart flights={flights} />
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Milestones
              </h2>
              <MilestonesPanel flights={flights} />
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Export</h2>
              <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => downloadCsv(flights)}
                  className="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full rounded-xl border border-neutral-300 bg-white py-3 text-base font-semibold text-neutral-700"
                >
                  Export PDF (Print)
                </button>
                <p className="px-1 text-xs text-neutral-400">
                  &quot;Export PDF&quot; opens your browser&apos;s print dialog — choose &quot;Save as PDF&quot; as
                  the destination for a clean, printable copy of your logbook.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Printable logbook — hidden on screen, shown only when printing. */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">Pilot Logbook</h1>
        <p className="mb-4 text-sm text-neutral-600">
          Generated {new Date().toLocaleDateString()} — Total time: {formatHours(totalHours)}h
        </p>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr>
              {["Date", "Aircraft", "Tail", "From", "To", "Block", "PIC", "SIC", "Night", "Ldg", "Remarks"].map(
                (label) => (
                  <th key={label} className="border border-neutral-400 px-1 py-0.5 text-left">
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {printable.map((f) => (
              <tr key={f.id}>
                <td className="border border-neutral-300 px-1 py-0.5">{f.flight_date}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.aircraft_type}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.tail_number}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.dep_airport}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.arr_airport}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{formatHours(f.block_time)}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{formatHours(f.pic_time)}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{formatHours(f.sic_time)}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{formatHours(f.night_time)}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.day_landings + f.night_landings}</td>
                <td className="border border-neutral-300 px-1 py-0.5">{f.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
