"use client";

import { useOverview, useTrends, useCarrierPerformance } from "@/hooks/useAnalytics";
import { MetricCard } from "@/components/cards/MetricCard";
import { MetricGrid } from "@/components/cards/MetricGrid";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { CarrierBarChart } from "@/components/charts/CarrierBarChart";

export default function DashboardPage() {
  const { data: overview, loading: overviewLoading } = useOverview({});
  const { data: trends, loading: trendsLoading } = useTrends({});
  const { data: carriers, loading: carriersLoading } = useCarrierPerformance({});

  if (overviewLoading || trendsLoading || carriersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const callStatusData = overview
    ? [
        { name: "completed", value: overview.successful_calls },
        { name: "failed", value: overview.failed_calls },
        {
          name: "other",
          value: overview.total_calls - overview.successful_calls - overview.failed_calls,
        },
      ].filter((d) => d.value > 0)
    : [];

  const msgStatusData = overview
    ? [
        { name: "delivered", value: overview.successful_messages },
        { name: "failed", value: overview.failed_messages },
        {
          name: "other",
          value: overview.total_messages - overview.successful_messages - overview.failed_messages,
        },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <MetricGrid>
        <MetricCard
          title="Total Calls"
          value={overview?.total_calls ?? 0}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Call Success Rate"
          value={`${overview?.call_success_rate ?? 0}%`}
          trend={
            (overview?.call_success_rate ?? 0) >= 70
              ? "up"
              : "down"
          }
          trendColor={
            (overview?.call_success_rate ?? 0) >= 70
              ? "green"
              : "red"
          }
        />
        <MetricCard
          title="Total Messages"
          value={overview?.total_messages ?? 0}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Message Success Rate"
          value={`${overview?.message_success_rate ?? 0}%`}
          trend={
            (overview?.message_success_rate ?? 0) >= 70
              ? "up"
              : "down"
          }
          trendColor={
            (overview?.message_success_rate ?? 0) >= 70
              ? "green"
              : "red"
          }
        />
        <MetricCard
          title="Avg Call Duration"
          value={`${Math.round(overview?.avg_call_duration ?? 0)}s`}
          subtitle="Across all calls"
        />
        <MetricCard
          title="Avg SIP Latency"
          value={`${(overview?.avg_sip_latency ?? 0).toFixed(1)}ms`}
          trend={
            (overview?.avg_sip_latency ?? 0) < 100
              ? "up"
              : "down"
          }
          trendColor={
            (overview?.avg_sip_latency ?? 0) < 100
              ? "green"
              : "red"
          }
        />
        <MetricCard
          title="Avg Packet Loss"
          value={`${(overview?.avg_packet_loss ?? 0).toFixed(2)}%`}
          trend={
            (overview?.avg_packet_loss ?? 0) < 2
              ? "up"
              : "down"
          }
          trendColor={
            (overview?.avg_packet_loss ?? 0) < 2
              ? "green"
              : "red"
          }
        />
        <MetricCard
          title="Active Carriers"
          value={overview?.active_carriers ?? 0}
          subtitle={`${overview?.degraded_trunks ?? 0} degraded trunks`}
        />
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendLineChart
          data={trends?.calls ?? []}
          title="Call Trends (Last 30 Days)"
        />
        <TrendLineChart
          data={trends?.messages ?? []}
          title="Message Trends (Last 30 Days)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart data={callStatusData} title="Call Status Distribution" />
        <StatusPieChart data={msgStatusData} title="Message Status Distribution" />
      </div>

      <CarrierBarChart
        data={carriers ?? []}
        title="Carrier Performance Comparison"
      />
    </div>
  );
}
