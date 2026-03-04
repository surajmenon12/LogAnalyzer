"use client";

import { useCallLogs } from "@/hooks/useCallLogs";
import { useFilters } from "@/hooks/useFilters";
import { FilterBar } from "@/components/filters/FilterBar";
import { DataTable, Column } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { ExportButton } from "@/components/export/ExportButton";
import { StatusBadge } from "@/components/StatusBadge";
import { CALL_STATUSES } from "@/lib/constants";
import { CallLog } from "@/lib/types";
import { format, parseISO } from "date-fns";

const columns: Column<CallLog>[] = [
  {
    key: "uuid",
    label: "UUID",
    render: (value) => (
      <span className="font-mono text-xs">{String(value).slice(0, 8)}...</span>
    ),
  },
  { key: "from_number", label: "From" },
  { key: "to_number", label: "To" },
  {
    key: "direction",
    label: "Direction",
    render: (value) => (
      <span
        className={`text-xs font-medium ${
          value === "inbound" ? "text-blue-600" : "text-purple-600"
        }`}
      >
        {String(value)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
  { key: "error_code", label: "Error Code" },
  {
    key: "duration",
    label: "Duration",
    sortable: true,
    render: (value) => (value ? `${value}s` : "-"),
  },
  { key: "region", label: "Region", sortable: true },
  { key: "carrier", label: "Carrier", sortable: true },
  {
    key: "initiated_at",
    label: "Initiated At",
    sortable: true,
    render: (value) => {
      try {
        return format(parseISO(String(value)), "MMM dd, yyyy HH:mm");
      } catch {
        return String(value);
      }
    },
  },
];

export default function CallsPage() {
  const { filters, updateFilter, clearFilters, filterParams } = useFilters();
  const { data, loading, error } = useCallLogs(filterParams);

  const handleSort = (key: string) => {
    if (filters.sort_by === key) {
      updateFilter(
        "sort_order" as keyof typeof filters,
        filters.sort_order === "asc" ? "desc" : "asc"
      );
    } else {
      updateFilter("sort_by" as keyof typeof filters, key);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
        <ExportButton type="calls" filters={filters} />
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClear={clearFilters}
        statusOptions={CALL_STATUSES}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error loading data: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading call logs...</div>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            sortBy={filters.sort_by}
            sortOrder={filters.sort_order}
            onSort={handleSort}
          />
          {data && data.total > 0 && (
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={data.page_size}
              onPageChange={(p) => updateFilter("page", p)}
            />
          )}
        </>
      )}
    </div>
  );
}
