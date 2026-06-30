"use client";

import { useCallback, useEffect, useState } from "react";
import { listFlights } from "@/lib/flights";
import type { FlightRow } from "@/types/database";

// Cached so the list (and totals computed from it) still render immediately when the
// app is reopened offline, instead of going blank until a network request resolves.
const CACHE_KEY = "pilot-logbook:flights-cache";

function readCache(): FlightRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as FlightRow[]) : [];
  } catch {
    return [];
  }
}

function writeCache(flights: FlightRow[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(flights));
  } catch {
    // Best-effort cache; ignore quota/availability errors.
  }
}

// Called on sign-out so a second pilot signing in on the same device never
// sees a flash of the previous account's cached flights.
export function clearFlightsCache(): void {
  window.localStorage.removeItem(CACHE_KEY);
}

export function useFlights() {
  const [flights, setFlights] = useState<FlightRow[]>(() => readCache());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFlights();
      setFlights(data);
      writeCache(data);
      setError(null);
    } catch (err) {
      // Keep showing whatever we last had (cache or previous state) rather than
      // clearing the list just because a background refresh failed offline.
      setError(err instanceof Error ? err.message : "Failed to load flights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetching on mount to sync with Supabase, the external data source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { flights, loading, error, refresh };
}
