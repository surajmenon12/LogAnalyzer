export const REGIONS = ["US-East", "US-West", "EU-West", "APAC"];

export const CARRIERS = [
  "AT&T", "Verizon", "T-Mobile", "Vodafone",
  "BT Group", "Singtel", "Telstra", "Deutsche Telekom",
];

export const CALL_STATUSES = ["completed", "failed", "busy", "no-answer", "cancelled"];
export const MESSAGE_STATUSES = ["delivered", "failed", "queued", "sent", "undelivered"];
export const SIP_STATUSES = ["healthy", "degraded", "down"];

export const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  delivered: "#22c55e",
  healthy: "#22c55e",
  failed: "#ef4444",
  down: "#ef4444",
  busy: "#f59e0b",
  degraded: "#f59e0b",
  "no-answer": "#6b7280",
  cancelled: "#6b7280",
  queued: "#3b82f6",
  sent: "#3b82f6",
  undelivered: "#f97316",
};

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" as const },
  { label: "Call Logs", href: "/calls", icon: "Phone" as const },
  { label: "Messages", href: "/messages", icon: "MessageSquare" as const },
  { label: "SIP Trunks", href: "/sip-trunks", icon: "Network" as const },
  { label: "Carriers", href: "/carriers", icon: "Building2" as const },
];
