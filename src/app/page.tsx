"use client";

import { FlightForm } from "@/components/FlightForm";
import { FlightList } from "@/components/FlightList";
import { TotalsPanel } from "@/components/TotalsPanel";
import { createFlight, recentValues } from "@/lib/flights";
import { useFlights } from "@/lib/useFlights";

export default function HomePage() {
  const { flights, loading, error, refresh } = useFlights();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-12 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Logbook</h1>
        <p className="text-sm text-neutral-500">Log your flight below</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <FlightForm
          recentAircraftTypes={recentValues(flights, (f) => f.aircraft_type)}
          recentTailNumbers={recentValues(flights, (f) => f.tail_number)}
          recentAirports={recentValues(flights, (f) => f.dep_airport).concat(
            recentValues(flights, (f) => f.arr_airport)
          )}
          submitLabel="Log flight"
          onSubmit={async (flight) => {
            await createFlight(flight);
            await refresh();
          }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Totals</h2>
        <TotalsPanel flights={flights} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Flights
        </h2>
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm">
          {loading && <p className="py-8 text-center text-sm text-neutral-500">Loading...</p>}
          {error && <p className="py-4 text-sm font-medium text-red-600">{error}</p>}
          {!loading && !error && <FlightList flights={flights} />}
        </div>
      </section>
    </main>
  );
}
