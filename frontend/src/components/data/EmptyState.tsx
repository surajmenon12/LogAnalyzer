"use client";

import Link from "next/link";
import { Upload, Database } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showImportCTA?: boolean;
}

export function EmptyState({
  title = "No data yet",
  description = "Import your Plivo log files to get started with analytics and insights.",
  showImportCTA = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-6 shadow-sm">
        <Database size={36} className="text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {description}
      </p>
      {showImportCTA && (
        <Link
          href="/import"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Upload size={16} />
          Import Data
        </Link>
      )}
    </div>
  );
}
