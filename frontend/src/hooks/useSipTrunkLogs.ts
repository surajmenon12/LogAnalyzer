"use client";

import { useState, useEffect } from "react";
import { fetchSipTrunkLogs } from "@/lib/api";
import { PaginatedResponse, SIPTrunkLog } from "@/lib/types";

export function useSipTrunkLogs(params: Record<string, unknown>) {
  const [data, setData] = useState<PaginatedResponse<SIPTrunkLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSipTrunkLogs(params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}
