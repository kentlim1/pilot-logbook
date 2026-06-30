"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FlightForm } from "@/components/FlightForm";
import { deleteFlight, getFlight, updateFlight } from "@/lib/flights";
import { useFlights } from "@/lib/useFlights";
import type { FlightRow } from "@/types/database";

export default function EditFlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { flights } = useFlights();

  const [flight, setFlight] = useState<FlightRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFlight(id)
      .then((f) => {
        if (!cancelled) setFlight(f);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load flight");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this flight? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteFlight(id);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flight");
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-12 pt-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-blue-600">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">Edit flight</h1>
        <span className="w-10" />
      </div>

      {loading && <p className="py-8 text-center text-sm text-neutral-500">Loading...</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {flight && (
        <>
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <FlightForm
              flights={flights}
              flight={flight}
              submitLabel="Save changes"
              onSubmit={async (updated) => {
                await updateFlight(id, updated);
                router.push("/");
              }}
            />
          </section>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-base font-semibold text-red-600 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete flight"}
          </button>
        </>
      )}
    </main>
  );
}
