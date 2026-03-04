"use client";

import { useState, useEffect } from "react";
import { useSipTrunkLogs } from "@/hooks/useSipTrunkLogs";
import { useFilters } from "@/hooks/useFilters";
import { FilterBar } from "@/components/filters/FilterBar";
import { DataTable, Column } from "@/components/data/DataTable";
import { Pagination } from "@/components/data/Pagination";
import { ExportButton } from "@/components/export/ExportButton";
import { StatusBadge } from "@/components/StatusBadge";
import { MetricCard } from "@/components/cards/MetricCard";
import { MetricGrid } from "@/components/cards/MetricGrid";
import { LatencyAreaChart } from "@/components/charts/LatencyAreaChart";
import { SIP_STATUSES } from "@/lib/constants";
import { SIPTrunkLog } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { fetchSipTrunkLogs } from "@/lib/api";

const columns: Column<SIPTrunkLog>[] = [
  { key: "trunk_name", label: "Trunk Name", sortable: true },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusBadge status={String(value)} />,
  },
  { key: "error_code", label: "Error Code" },
  {
    key: "latency_ms",
    label: "Latency (ms)",
    sortable: true,
    render: (value) => (
      <span
        className={`font-medium ${
          Number(value) > 150
            ? "text-red-600"
            : Number(value) > 80
            ? "text-amber-600"
            : "text-green-600"
        }`}
      >
        {Number(value).toFixed(1)}
      </span>
    ),
  },
  {
    key: "packet_loss_pct",
    label: "Packet Loss (%)",
    sortable: true,
    render: (value) => (
      <span
        className={`font-medium ${
          Number(value) > 5
            ? "text-red-600"
            : Number(value) > 1
            ? "text-amber-600"
            : "text-green-600"
        }`}
      >
        {Number(value).toFixed(2)}
      </span>
    ),
  },
  {
    key: "jitter_ms",
    label: "Jitter (ms)",
    sortable: true,
    render: (value) => Number(value).toFixed(1),
  },
  { key: "region", label: "Region", sortable: true },
  { key: "carrier", label: "Carrier", sortable: true },
  {
    key: "recorded_at",
    label: "Recorded At",
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

export default function SIPTrunksPage() {
  const { filters, updateFilter, clearFilters, filterParams } = useFilters();
  const { data, loading, error } = useSipTrunkLogs(filterParams);
  const [chartData, setChartData] = useState<
    { timestamp: string; latency_ms: number; packet_loss_pct: number }[]
  >([]);

  useEffect(() => {
    fetchSipTrunkLogs({ page_size: 100, sort_by: "recorded_at", sort_order: "asc" })
      .then((res) => {
        const points = res.items.map((item: SIPTrunkLog) => ({
          timestamp: item.recorded_at,
          latency_ms: item.latency_ms,
          packet_loss_pct: item.packet_loss_pct,
        }));
        setChartData(points);
      })
      .catch(() => {});
  }, []);

  const avgLatency =
    data?.items.length
      ? data.items.reduce((acc, i) => acc + i.latency_ms, 0) / data.items.length
      : 0;
  const avgPacketLoss =
    data?.items.length
      ? data.items.reduce((acc, i) => acc + i.packet_loss_pct, 0) / data.items.length
      : 0;
  const avgJitter =
    data?.items.length
      ? data.items.reduce((acc, i) => acc + i.jitter_ms, 0) / data.items.length
      : 0;

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
        <h2 className="text-lg font-semibold text-gray-900">SIP Trunk Health</h2>
        <ExportButton type="sip-trunks" filters={filters} />
      </div>

      <MetricGrid>
        <MetricCard
          title="Avg Latency"
          value={`${avgLatency.toFixed(1)}ms`}
          trend={avgLatency < 100 ? "up" : "down"}
          trendColor={avgLatency < 100 ? "green" : "red"}
        />
        <MetricCard
          title="Avg Packet Loss"
          value={`${avgPacketLoss.toFixed(2)}%`}
          trend={avgPacketLoss < 2 ? "up" : "down"}
          trendColor={avgPacketLoss < 2 ? "green" : "red"}
        />
        <MetricCard
          title="Avg Jitter"
          value={`${avgJitter.toFixed(1)}ms`}
          trend={avgJitter < 30 ? "up" : "down"}
          trendColor={avgJitter < 30 ? "green" : "red"}
        />
        <MetricCard
          title="Total Records"
          value={data?.total ?? 0}
          subtitle="Current page view"
        />
      </MetricGrid>

      <div className="mb-6">
        <LatencyAreaChart data={chartData} title="SIP Latency Over Time" />
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onClear={clearFilters}
        statusOptions={SIP_STATUSES}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error loading data: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading SIP trunk logs...</div>
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
