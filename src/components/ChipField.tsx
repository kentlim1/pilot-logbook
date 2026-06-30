"use client";

interface ChipFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  recentValues: string[];
  placeholder?: string;
  uppercase?: boolean;
  maxLength?: number;
}

export function ChipField({
  label,
  value,
  onChange,
  recentValues,
  placeholder,
  uppercase,
  maxLength,
}: ChipFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-lg font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {recentValues.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {recentValues.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
                value === option
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-neutral-300 bg-neutral-50 text-neutral-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
