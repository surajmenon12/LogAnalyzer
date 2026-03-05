"use client";

import { useCallLogs } from "@/hooks/useCallLogs";
import { useFilters } from "@/hooks/useFilters";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column, DetailField, ExpandableDataTable } from "@/components/data/ExpandableDataTable";
import { EmptyState } from "@/components/data/EmptyState";
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
        className={`text-xs font-medium capitalize ${value === "inbound" ? "text-blue-600" : "text-purple-600"
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
  {
    key: "duration",
    label: "Duration",
    sortable: true,
    render: (value) => (value ? `${value}s` : "-"),
  },
  {
    key: "amount",
    label: "Amount",
    render: (value) => (value ? `₹${Number(value).toFixed(4)}` : "-"),
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

const detailFields: DetailField[] = [
  { key: "uuid", label: "Call UUID" },
  { key: "call_id", label: "Call ID" },
  { key: "from_number", label: "From Number" },
  { key: "to_number", label: "To Number" },
  { key: "direction", label: "Direction", render: (v) => <span className="capitalize">{String(v)}</span> },
  { key: "status", label: "Status" },
  { key: "error_code", label: "Hangup Code" },
  { key: "hangup_initiator", label: "Hangup Initiator" },
  { key: "duration", label: "Duration", render: (v) => (v ? `${v}s` : "") },
  { key: "bill_duration", label: "Bill Duration", render: (v) => (v ? `${v}s` : "") },
  { key: "rate", label: "Rate (INR)", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "amount", label: "Total Amount (INR)", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "carrier", label: "Trunk Domain / Carrier" },
  { key: "region", label: "Region" },
  { key: "from_country", label: "From Country" },
  { key: "to_country", label: "To Country" },
  { key: "transport_protocol", label: "Transport Protocol" },
  { key: "srtp", label: "SRTP Enabled" },
  { key: "secure_trunking", label: "Secure Trunking" },
  { key: "secure_trunking_rate", label: "Secure Trunking Rate", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "stir_verification", label: "STIR Verification" },
  { key: "attestation_indicator", label: "Attestation Indicator" },
  { key: "cnam_lookup_number_config", label: "CNAM Lookup Config" },
  { key: "cnam_lookup_customer_rate", label: "CNAM Customer Rate", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "initiated_at", label: "Initiation Time" },
  { key: "answer_time", label: "Answer Time" },
  { key: "ended_at", label: "End Time" },
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

  const hasNoData = !loading && !error && data?.total === 0 && Object.keys(filterParams).length === 2; // only page/page_size

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
        {data && data.total > 0 && <ExportButton type="calls" filters={filters} />}
      </div>

      {!hasNoData && (
        <FilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onClear={clearFilters}
          statusOptions={CALL_STATUSES}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error loading data: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading call logs...</div>
        </div>
      ) : hasNoData ? (
        <EmptyState
          title="No call logs found"
          description="It looks like you haven't imported any call data yet. Import a Plivo call log CSV to start analyzing your traffic."
        />
      ) : (
        <>
          <ExpandableDataTable
            columns={columns}
            data={data?.items ?? []}
            detailFields={detailFields}
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
