"use client";

import { ReactNode } from "react";

interface MetricGridProps {
  children: ReactNode;
}

export function MetricGrid({ children }: MetricGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {children}
    </div>
  );
}
