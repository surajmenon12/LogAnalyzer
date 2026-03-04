import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export default api;

export async function fetchCallLogs(params: Record<string, unknown>) {
  const { data } = await api.get("/api/logs/calls", { params });
  return data;
}

export async function fetchMessageLogs(params: Record<string, unknown>) {
  const { data } = await api.get("/api/logs/messages", { params });
  return data;
}

export async function fetchSipTrunkLogs(params: Record<string, unknown>) {
  const { data } = await api.get("/api/logs/sip-trunks", { params });
  return data;
}

export async function fetchOverview(params: Record<string, unknown>) {
  const { data } = await api.get("/api/analytics/overview", { params });
  return data;
}

export async function fetchTrends(params: Record<string, unknown>) {
  const { data } = await api.get("/api/analytics/trends", { params });
  return data;
}

export async function fetchCarrierPerformance(params: Record<string, unknown>) {
  const { data } = await api.get("/api/analytics/carriers", { params });
  return data;
}

export function getExportUrl(type: string, params: Record<string, unknown>) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, String(v));
  });
  return `${base}/api/export/csv?${searchParams.toString()}`;
}

export async function uploadFile(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/api/import/upload?type=${encodeURIComponent(type)}`, formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function previewFile(file: File, type: string) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/api/import/preview?type=${encodeURIComponent(type)}`, formData, {
    headers: { "Content-Type": undefined },
  });
  return data;
}

export async function clearData(type: string) {
  const { data } = await api.post(`/api/import/clear?type=${encodeURIComponent(type)}`);
  return data;
}

export function getTemplateUrl(type: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${base}/api/import/template/${encodeURIComponent(type)}`;
}
