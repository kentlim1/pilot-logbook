"use client";

import Link from "next/link";
import { formatHours } from "@/lib/time";
import type { FlightRow } from "@/types/database";

interface FlightListProps {
  flights: FlightRow[];
  onLogSimilar?: (flight: FlightRow) => void;
}

export function FlightList({ flights, onLogSimilar }: FlightListProps) {
  if (flights.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-500">No flights logged yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-neutral-100">
      {flights.map((flight) => (
        <li key={flight.id} className="flex items-center gap-2 py-3.5">
          <Link href={`/flights/${flight.id}`} className="flex flex-1 items-center justify-between gap-3 active:bg-neutral-50">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-neutral-400">{flight.flight_date}</span>
              <span className="text-base font-semibold text-neutral-900">
                {flight.dep_airport} <span className="text-neutral-400">→</span> {flight.arr_airport}
              </span>
              <span className="text-sm text-neutral-500">
                {flight.aircraft_type}
                {flight.tail_number ? ` · ${flight.tail_number}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tabular-nums text-neutral-900">
                {formatHours(flight.block_time)}
              </span>
              <span className="text-neutral-300">›</span>
            </div>
          </Link>
          {onLogSimilar && (
            <button
              type="button"
              onClick={() => onLogSimilar(flight)}
              className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 active:bg-blue-100"
            >
              Log similar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
