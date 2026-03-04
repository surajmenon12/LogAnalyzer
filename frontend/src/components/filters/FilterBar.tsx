"use client";

import { SelectFilter } from "./SelectFilter";
import { REGIONS, CARRIERS } from "@/lib/constants";
import { FilterState } from "@/lib/types";
import { X } from "lucide-react";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | number) => void;
  onClear: () => void;
  statusOptions: string[];
}

export function FilterBar({
  filters,
  onFilterChange,
  onClear,
  statusOptions,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            From
          </label>
          <input
            type="datetime-local"
            value={filters.time_from || ""}
            onChange={(e) => onFilterChange("time_from", e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            To
          </label>
          <input
            type="datetime-local"
            value={filters.time_to || ""}
            onChange={(e) => onFilterChange("time_to", e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <SelectFilter
          label="Region"
          value={filters.region || ""}
          options={REGIONS}
          onChange={(v) => onFilterChange("region", v)}
        />

        <SelectFilter
          label="Carrier"
          value={filters.carrier || ""}
          options={CARRIERS}
          onChange={(v) => onFilterChange("carrier", v)}
        />

        <SelectFilter
          label="Status"
          value={filters.status || ""}
          options={statusOptions}
          onChange={(v) => onFilterChange("status", v)}
        />

        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      </div>
    </div>
  );
}
