"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface LatencyPoint {
  timestamp: string;
  latency_ms: number;
  packet_loss_pct: number;
}

interface LatencyAreaChartProps {
  data: LatencyPoint[];
  title: string;
}

export function LatencyAreaChart({ data, title }: LatencyAreaChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
          <YAxis fontSize={12} tick={{ fill: "#6b7280" }} unit="ms" />
          <Tooltip
            labelFormatter={(v) => {
              try {
                return format(parseISO(v as string), "MMM dd, yyyy");
              } catch {
                return String(v);
              }
            }}
          />
          <ReferenceLine
            y={150}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: "Threshold", position: "right", fill: "#f59e0b" }}
          />
          <Area
            type="monotone"
            dataKey="latency_ms"
            stroke="#3b82f6"
            fill="#3b82f680"
            name="Latency (ms)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
