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

export async function createFlight(flight: FlightInsert): Promise<FlightRow> {
  const { data, error } = await supabase.from("flights").insert(flight).select().single();
  if (error) throw error;
  return data;
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

// Most-recently-used values for quick-pick chips, derived from already-loaded flights.
export function recentValues(flights: FlightRow[], pick: (f: FlightRow) => string | null, limit = 6): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const flight of flights) {
    const value = pick(flight);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= limit) break;
  }
  return result;
}
