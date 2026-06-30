"use client";

import type { FlightInsert } from "@/types/database";

// A pilot logging a flight offline can't wait for a server round-trip, and iOS Safari
// doesn't support the Background Sync API, so we keep this dead simple: stash unsynced
// entries in localStorage and retry them in the foreground whenever the app detects it's
// back online (see page.tsx). No service worker involvement, no background wake-ups.
const STORAGE_KEY = "pilot-logbook:pending-flights";
const QUEUE_CHANGED_EVENT = "pilot-logbook:queue-changed";

export interface PendingFlight {
  localId: string;
  flight: FlightInsert;
}

function readQueue(): PendingFlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingFlight[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: PendingFlight[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
}

export function enqueueFlight(flight: FlightInsert): void {
  writeQueue([...readQueue(), { localId: crypto.randomUUID(), flight }]);
}

export function listPendingFlights(): PendingFlight[] {
  return readQueue();
}

export function removePendingFlight(localId: string): void {
  writeQueue(readQueue().filter((entry) => entry.localId !== localId));
}

// Called on sign-out. Any flights still queued at that point belong to whichever
// account logged them and haven't synced yet; this app doesn't carry them across accounts.
export function clearPendingFlights(): void {
  writeQueue([]);
}

export function onQueueChanged(callback: () => void): () => void {
  window.addEventListener(QUEUE_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(QUEUE_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
