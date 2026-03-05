"use client";

import { useMessageLogs } from "@/hooks/useMessageLogs";
import { useFilters } from "@/hooks/useFilters";
import { FilterBar } from "@/components/filters/FilterBar";
import { Column, DetailField, ExpandableDataTable } from "@/components/data/ExpandableDataTable";
import { EmptyState } from "@/components/data/EmptyState";
import { Pagination } from "@/components/data/Pagination";
import { ExportButton } from "@/components/export/ExportButton";
import { StatusBadge } from "@/components/StatusBadge";
import { MESSAGE_STATUSES } from "@/lib/constants";
import { MessageLog } from "@/lib/types";
import { format, parseISO } from "date-fns";

const columns: Column<MessageLog>[] = [
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
    key: "amount",
    label: "Amount",
    render: (value) => (value ? `₹${Number(value).toFixed(4)}` : "-"),
  },
  {
    key: "message_type",
    label: "Type",
    render: (value) => (
      <span className="uppercase text-xs font-medium">{String(value)}</span>
    ),
  },
  { key: "units", label: "Units" },
  { key: "region", label: "Region", sortable: true },
  { key: "carrier", label: "Carrier", sortable: true },
  {
    key: "sent_at",
    label: "Sent At",
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
  { key: "uuid", label: "Message UUID" },
  { key: "subaccount", label: "SubAccount" },
  { key: "from_number", label: "From" },
  { key: "replaced_sender", label: "Replaced Sender" },
  { key: "to_number", label: "To" },
  { key: "direction", label: "Direction", render: (v) => <span className="capitalize">{String(v)}</span> },
  { key: "status", label: "Status" },
  { key: "units", label: "Units" },
  { key: "amount", label: "Amount", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "message_rate", label: "Message Rate", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "message_charge", label: "Message Charge", render: (v) => (v ? `₹${Number(v).toFixed(4)}` : "") },
  { key: "carrier", label: "Carrier Used" },
  { key: "kannel_message_id", label: "Kannel Message ID" },
  { key: "error_code", label: "Plivo Error Code" },
  { key: "powerpack_id", label: "Powerpack ID" },
  { key: "requester_ip", label: "Requester IP" },
  { key: "is_domestic", label: "Is Domestic" },
  { key: "senderid_usecase", label: "SenderID Usecase" },
  { key: "waba_id", label: "WABA ID" },
  { key: "waba_name", label: "WABA Name" },
  { key: "conversation_id", label: "Conversation ID" },
  { key: "conversation_origin", label: "Conversation Origin" },
  { key: "conversation_expiry", label: "Conversation Expiry" },
  { key: "surcharge_rate", label: "Surcharge Rate" },
  { key: "mno", label: "MNO" },
  { key: "is_10dlc_registered", label: "10DLC Registered" },
  { key: "campaign_id", label: "Campaign ID" },
  { key: "to_country", label: "To Country" },
  { key: "region", label: "Region" },
  { key: "message_type", label: "Message Type", render: (v) => <span className="uppercase">{String(v)}</span> },
  { key: "carrier_error_code", label: "Carrier Error Code" },
  { key: "sent_at", label: "Time/Sent At" },
  { key: "delivered_at", label: "Delivery Time" },
];

export default function MessagesPage() {
  const { filters, updateFilter, clearFilters, filterParams } = useFilters();
  const { data, loading, error } = useMessageLogs(filterParams);

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

  const hasNoData = !loading && !error && data?.total === 0 && Object.keys(filterParams).length === 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Message Logs</h2>
        {data && data.total > 0 && <ExportButton type="messages" filters={filters} />}
      </div>

      {!hasNoData && (
        <FilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onClear={clearFilters}
          statusOptions={MESSAGE_STATUSES}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error loading data: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading message logs...</div>
        </div>
      ) : hasNoData ? (
        <EmptyState
          title="No message logs found"
          description="It looks like you haven't imported any message data yet. Import a Plivo message log CSV to view SMS and MMS traffic."
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
