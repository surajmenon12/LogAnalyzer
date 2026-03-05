"use client";

import { useOverview, useTrends, useCarrierPerformance, useErrorDistribution } from "@/hooks/useAnalytics";
import { MetricCard } from "@/components/cards/MetricCard";
import { MetricGrid } from "@/components/cards/MetricGrid";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { CarrierBarChart } from "@/components/charts/CarrierBarChart";
import { ErrorDistributionChart } from "@/components/charts/ErrorDistributionChart";
import { EmptyState } from "@/components/data/EmptyState";
import { CALL_ERROR_CODE_LABELS, MESSAGE_ERROR_CODE_LABELS } from "@/lib/constants";

export default function DashboardPage() {
  const { data: overview, loading: overviewLoading } = useOverview({});
  const { data: trends, loading: trendsLoading } = useTrends({});
  const { data: carriers, loading: carriersLoading } = useCarrierPerformance({});
  const { data: errorDist } = useErrorDistribution({});

  if (overviewLoading || trendsLoading || carriersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const hasNoData = overview && overview.total_calls === 0 && overview.total_messages === 0;

  if (hasNoData) {
    return (
      <EmptyState
        title="Welcome to Plivo Log Analyzer"
        description="You don't have any data yet. Head over to the Import section and upload your Plivo CSV exports to see insights and trends."
      />
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
          title="Active Carriers"
          value={overview?.active_carriers ?? 0}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorDistributionChart
          data={errorDist?.call_errors ?? []}
          title="Call Error Code Distribution"
          labelMap={CALL_ERROR_CODE_LABELS}
        />
        <ErrorDistributionChart
          data={errorDist?.message_errors ?? []}
          title="Message Error Code Distribution"
          labelMap={MESSAGE_ERROR_CODE_LABELS}
        />
      </div>

      <CarrierBarChart
        data={carriers ?? []}
        title="Carrier Performance Comparison"
      />
    </div>
  );
}
