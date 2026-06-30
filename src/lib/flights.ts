import { enqueueFlight, listPendingFlights, removePendingFlight } from "@/lib/offlineQueue";
import { supabase } from "@/lib/supabase";
import type { FlightInsert, FlightRow, FlightUpdate } from "@/types/database";

export async function listFlights(): Promise<FlightRow[]> {
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .order("flight_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFlight(id: string): Promise<FlightRow | null> {
  const { data, error } = await supabase.from("flights").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function insertFlightRemote(flight: FlightInsert): Promise<FlightRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to log a flight.");
  const { data, error } = await supabase
    .from("flights")
    .insert({ ...flight, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Returns the saved row, or null if the device is offline and the flight was
// queued locally instead (see lib/offlineQueue.ts).
export async function createFlight(flight: FlightInsert): Promise<FlightRow | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enqueueFlight(flight);
    return null;
  }
  return insertFlightRemote(flight);
}

// Retries queued offline entries one at a time, stopping at the first failure
// (still offline, or a real error) so the rest stay queued for the next attempt.
export async function flushPendingFlights(): Promise<number> {
  let synced = 0;
  for (const entry of listPendingFlights()) {
    try {
      await insertFlightRemote(entry.flight);
      removePendingFlight(entry.localId);
      synced++;
    } catch {
      break;
    }
  }
  return synced;
}

export async function updateFlight(id: string, flight: FlightUpdate): Promise<FlightRow> {
  const { data, error } = await supabase.from("flights").update(flight).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFlight(id: string): Promise<void> {
  const { error } = await supabase.from("flights").delete().eq("id", id);
  if (error) throw error;
}

// Quick-pick chip values ranked by frequency, ties broken by recency. `flights` is assumed
// sorted most-recent-first (as listFlights returns it), so first occurrence = most recent.
export function rankedValues(flights: FlightRow[], pick: (f: FlightRow) => string | null, limit = 6): string[] {
  const stats = new Map<string, { count: number; mostRecentIndex: number }>();
  flights.forEach((flight, index) => {
    const value = pick(flight);
    if (!value) return;
    const entry = stats.get(value);
    if (entry) entry.count += 1;
    else stats.set(value, { count: 1, mostRecentIndex: index });
  });
  return Array.from(stats.entries())
    .sort(([, a], [, b]) => b.count - a.count || a.mostRecentIndex - b.mostRecentIndex)
    .slice(0, limit)
    .map(([value]) => value);
}

// The single most-used value for a field, or null if no flights have it set.
export function mostFrequentValue(flights: FlightRow[], pick: (f: FlightRow) => string | null): string | null {
  return rankedValues(flights, pick, 1)[0] ?? null;
}

// Tail number most recently flown on the given aircraft type.
export function mostRecentTailNumber(flights: FlightRow[], aircraftType: string): string | null {
  return flights.find((f) => f.aircraft_type === aircraftType && f.tail_number)?.tail_number ?? null;
}

// Arrival airports most often paired with the given departure, ranked by frequency/recency.
export function rankedArrivalsForDeparture(flights: FlightRow[], depAirport: string, limit = 4): string[] {
  const flownFromDep = flights.filter((f) => f.dep_airport === depAirport);
  return rankedValues(flownFromDep, (f) => f.arr_airport, limit);
}
