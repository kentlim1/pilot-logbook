"use client";

import { useCallback, useEffect, useState } from "react";
import { listFlights } from "@/lib/flights";
import type { FlightRow } from "@/types/database";

export function useFlights() {
  const [flights, setFlights] = useState<FlightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setFlights(await listFlights());
      setError(null);
    } catch (err) {
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
