"use client";

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function Stepper({ label, value, onChange, min = 0 }: StepperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 text-xl font-semibold text-neutral-700 active:bg-neutral-200"
        >
          −
        </button>
        <span className="w-8 text-center text-xl font-semibold tabular-nums text-neutral-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 text-xl font-semibold text-neutral-700 active:bg-neutral-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
