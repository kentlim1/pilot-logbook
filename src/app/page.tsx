"use client";

import { useEffect, useState } from "react";
import { FlightForm } from "@/components/FlightForm";
import { FlightList } from "@/components/FlightList";
import { TotalsPanel } from "@/components/TotalsPanel";
import { createFlight, flushPendingFlights } from "@/lib/flights";
import { clearPendingFlights, listPendingFlights, onQueueChanged } from "@/lib/offlineQueue";
import { supabase } from "@/lib/supabase";
import { clearFlightsCache, useFlights } from "@/lib/useFlights";
import { useSession } from "@/lib/useSession";
import type { FlightRow } from "@/types/database";

export default function HomePage() {
  const { flights, loading, error, refresh } = useFlights();
  const { session } = useSession();
  const [duplicateOf, setDuplicateOf] = useState<FlightRow | null>(null);
  const [pendingCount, setPendingCount] = useState(() => listPendingFlights().length);

  useEffect(() => {
    return onQueueChanged(() => setPendingCount(listPendingFlights().length));
  }, []);

  useEffect(() => {
    function trySync() {
      flushPendingFlights().then((synced) => {
        if (synced > 0) refresh();
      });
    }
    window.addEventListener("online", trySync);
    trySync(); // catch up if the app was reopened already online with a leftover queue
    return () => window.removeEventListener("online", trySync);
  }, [refresh]);

  function handleLogSimilar(flight: FlightRow) {
    setDuplicateOf(flight);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSignOut() {
    if (pendingCount > 0) {
      const proceed = confirm(
        `${pendingCount} flight${pendingCount > 1 ? "s are" : " is"} still waiting to sync. ` +
          "Signing out now will discard them. Sign out anyway?"
      );
      if (!proceed) return;
      clearPendingFlights();
    }
    clearFlightsCache();
    await supabase.auth.signOut();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-12 pt-6">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logbook</h1>
          <p className="text-sm text-neutral-500">Log your flight below</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 pt-1">
          {session?.user.email && (
            <span className="max-w-[10rem] truncate text-xs text-neutral-400">{session.user.email}</span>
          )}
          <button type="button" onClick={handleSignOut} className="text-xs font-semibold text-blue-600">
            Sign out
          </button>
        </div>
      </header>

      {pendingCount > 0 && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          {pendingCount} flight{pendingCount > 1 ? "s" : ""} saved offline — will sync once you&apos;re back online.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        {duplicateOf && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <span>
              Logging similar to {duplicateOf.dep_airport} → {duplicateOf.arr_airport}
            </span>
            <button
              type="button"
              onClick={() => setDuplicateOf(null)}
              className="shrink-0 font-semibold underline"
            >
              Clear
            </button>
          </div>
        )}
        <FlightForm
          key={duplicateOf?.id ?? "new"}
          flights={flights}
          duplicateOf={duplicateOf ?? undefined}
          submitLabel="Log flight"
          onSubmit={async (flight) => {
            await createFlight(flight);
            setDuplicateOf(null);
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
          {loading && flights.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">Loading...</p>
          )}
          {error && <p className="px-1 pt-3 text-xs font-medium text-amber-600">{error}</p>}
          {(!loading || flights.length > 0) && (
            <FlightList flights={flights} onLogSimilar={handleLogSimilar} />
          )}
        </div>
      </section>
    </main>
  );
}
