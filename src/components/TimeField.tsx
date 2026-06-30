"use client";

import { formatDigitsAsClock } from "@/lib/time";

interface TimeFieldProps {
  label: string;
  value: string; // raw digits, up to 4
  onChange: (raw: string) => void;
}

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  // The input keeps raw digits as its actual value (never reformatted while typing) so
  // injecting a ":" mid-string can't desync the cursor and silently drop keystrokes.
  // The parsed "HH:MM" is shown alongside the label as confirmation once it's complete.
  const formatted = value.length === 4 ? formatDigitsAsClock(value) : null;

  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {formatted && <span className="text-xs font-medium text-neutral-400">{formatted}</span>}
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="----"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-center text-2xl font-semibold tabular-nums tracking-wide text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}
