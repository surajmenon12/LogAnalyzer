"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CarrierPerformance } from "@/lib/types";

interface CarrierBarChartProps {
  data: CarrierPerformance[];
  title: string;
}

export function CarrierBarChart({ data, title }: CarrierBarChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="carrier_name"
            fontSize={11}
            tick={{ fill: "#6b7280" }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis fontSize={12} tick={{ fill: "#6b7280" }} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="successful_calls"
            name="Successful"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="failed_calls"
            name="Failed"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
