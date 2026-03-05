"use client";

import { Download } from "lucide-react";
import { getExportUrl } from "@/lib/api";
import { FilterState } from "@/lib/types";

interface ExportButtonProps {
  type: "calls" | "messages";
  filters: FilterState;
}

export function ExportButton({ type, filters }: ExportButtonProps) {
  const handleExport = () => {
    const url = getExportUrl(type, filters);
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Download size={16} />
      Export CSV
    </button>
  );
}
