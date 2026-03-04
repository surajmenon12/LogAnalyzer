"use client";

import { useState, useEffect } from "react";
import { fetchMessageLogs } from "@/lib/api";
import { PaginatedResponse, MessageLog } from "@/lib/types";

export function useMessageLogs(params: Record<string, unknown>) {
  const [data, setData] = useState<PaginatedResponse<MessageLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMessageLogs(params)
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
