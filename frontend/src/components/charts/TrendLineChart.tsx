"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendPoint } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface TrendLineChartProps {
  data: TrendPoint[];
  title: string;
}

export function TrendLineChart({ data, title }: TrendLineChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => {
              try {
                return format(parseISO(v), "MMM dd");
              } catch {
                return v;
              }
            }}
            fontSize={12}
            tick={{ fill: "#6b7280" }}
          />
          <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
          <Tooltip
            labelFormatter={(v) => {
              try {
                return format(parseISO(v as string), "MMM dd, yyyy");
              } catch {
                return String(v);
              }
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            name="Total"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="successful"
            stroke="#22c55e"
            name="Successful"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#ef4444"
            name="Failed"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
