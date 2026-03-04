"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendColor?: "green" | "red" | "gray";
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendColor = "gray",
}: MetricCardProps) {
  const colorMap = {
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-end gap-2 mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={`${colorMap[trendColor]} mb-0.5`}>
            {trend === "up" && <TrendingUp size={18} />}
            {trend === "down" && <TrendingDown size={18} />}
            {trend === "neutral" && <Minus size={18} />}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
