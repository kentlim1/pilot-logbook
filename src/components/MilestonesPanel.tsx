"use client";

import { useState } from "react";
import { MILESTONE_DEFS, readMilestoneTargets, writeMilestoneTarget } from "@/lib/milestones";
import type { FlightRow } from "@/types/database";

export function MilestonesPanel({ flights }: { flights: FlightRow[] }) {
  const [targets, setTargets] = useState<Record<string, number>>(() => {
    const saved = readMilestoneTargets();
    return Object.fromEntries(MILESTONE_DEFS.map((m) => [m.id, saved[m.id] ?? m.defaultTarget]));
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleTargetCommit(id: string, value: string) {
    const num = parseFloat(value);
    if (Number.isFinite(num) && num > 0) {
      setTargets((prev) => ({ ...prev, [id]: num }));
      writeMilestoneTarget(id, num);
    }
    setEditingId(null);
  }

  return (
    <div className="flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm">
      {MILESTONE_DEFS.map((milestone) => {
        const current = milestone.compute(flights);
        const target = targets[milestone.id];
        const pct = Math.min(100, (current / target) * 100);
        return (
          <div key={milestone.id} className="flex flex-col gap-1.5 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-neutral-700">{milestone.label}</span>
              <span className="shrink-0 text-xs text-neutral-400">
                {current.toFixed(1)} /{" "}
                {editingId === milestone.id ? (
                  <input
                    type="number"
                    autoFocus
                    defaultValue={target}
                    onBlur={(e) => handleTargetCommit(milestone.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="w-14 rounded border border-neutral-300 px-1 text-right text-xs"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(milestone.id)}
                    className="underline decoration-dotted"
                  >
                    {target}
                  </button>
                )}
                h
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
