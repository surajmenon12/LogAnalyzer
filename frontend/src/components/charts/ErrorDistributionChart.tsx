"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ErrorDistribution } from "@/lib/types";

interface ErrorDistributionChartProps {
  data: ErrorDistribution[];
  title: string;
  labelMap: Record<string, string>;
}

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
];

export function ErrorDistributionChart({ data, title, labelMap }: ErrorDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          No error codes found
        </div>
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((item) => ({
    code: item.error_code,
    label: labelMap[item.error_code] || `Error ${item.error_code}`,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40 + 40)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" fontSize={12} tick={{ fill: "#6b7280" }} />
          <YAxis
            type="category"
            dataKey="code"
            width={60}
            fontSize={11}
            tick={{ fill: "#6b7280" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
                  <p className="font-semibold text-gray-900">Code: {d.code}</p>
                  <p className="text-gray-600">{d.label}</p>
                  <p className="text-gray-700 mt-1">
                    Count: <span className="font-medium">{d.count}</span>
                  </p>
                  <p className="text-gray-700">
                    Percentage: <span className="font-medium">{d.percentage}%</span>
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {chartData.map((item, index) => (
          <div key={item.code} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-600 font-mono">{item.code}</span>
              <span className="text-gray-500 truncate max-w-[180px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span>{item.count}</span>
              <span className="font-medium w-12 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
