"use client";

import { DateRange } from "@/lib/types";

interface Props {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

const RANGES: DateRange[] = ["1m", "3m", "1y", "max"];

export default function DateRangeToggle({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            selected === r
              ? "bg-emerald-600 text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          }`}
        >
          {r.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
