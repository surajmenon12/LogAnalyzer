"use client";

import { useState, useCallback } from "react";
import { FilterState } from "@/lib/types";

const defaultFilters: FilterState = {
  page: 1,
  page_size: 25,
};

export function useFilters(initial?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initial,
  });

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | number) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filterParams = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== "" && v !== null
    )
  );

  return { filters, updateFilter, clearFilters, filterParams };
}
