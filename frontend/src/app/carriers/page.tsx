"use client";

import { useCarrierPerformance } from "@/hooks/useAnalytics";
import { CarrierBarChart } from "@/components/charts/CarrierBarChart";
import { CarrierPerformance } from "@/lib/types";

export default function CarriersPage() {
  const { data, loading, error } = useCarrierPerformance({});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading carrier data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error loading carrier data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CarrierBarChart
        data={data ?? []}
        title="Carrier Performance - Calls"
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Calls
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Messages
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Msg Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(data ?? []).map((carrier: CarrierPerformance) => (
                <tr key={carrier.carrier_name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {carrier.carrier_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {carrier.total_calls}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        carrier.success_rate >= 80
                          ? "text-green-600"
                          : carrier.success_rate >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {carrier.success_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {carrier.avg_duration.toFixed(1)}s
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {carrier.total_messages}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        carrier.message_success_rate >= 80
                          ? "text-green-600"
                          : carrier.message_success_rate >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {carrier.message_success_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
