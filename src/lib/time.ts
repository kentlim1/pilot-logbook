// Time fields are entered as raw "HHMM" digit strings (numeric-keypad friendly)
// and stored in the DB as "HH:MM:SS". Durations are stored as decimal hours.

export function digitsToTimeString(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 4) return null;
  const hours = Number(digits.slice(0, 2));
  const minutes = Number(digits.slice(2, 4));
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

export function timeStringToDigits(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  return `${h}${m}`;
}

export function formatDigitsAsClock(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

// Computes block hours from out/in "HH:MM:SS" time strings, handling
// flights that cross midnight.
export function computeBlockHours(outTime: string | null, inTime: string | null): number | null {
  if (!outTime || !inTime) return null;
  const [outH, outM] = outTime.split(":").map(Number);
  const [inH, inM] = inTime.split(":").map(Number);
  let minutes = inH * 60 + inM - (outH * 60 + outM);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

export function formatHours(value: number): string {
  return (value || 0).toFixed(1);
}

export function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}
