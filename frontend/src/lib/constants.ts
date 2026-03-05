export const REGIONS = ["US-East", "US-West", "EU-West", "APAC"];

export const CARRIERS = [
  "AT&T", "Verizon", "T-Mobile", "Vodafone",
  "BT Group", "Singtel", "Telstra", "Deutsche Telekom",
];

export const CALL_STATUSES = ["completed", "failed", "busy", "no-answer", "cancelled"];
export const MESSAGE_STATUSES = ["delivered", "failed", "queued", "sent", "undelivered"];

export const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  delivered: "#22c55e",
  failed: "#ef4444",
  busy: "#f59e0b",
  "no-answer": "#6b7280",
  cancelled: "#6b7280",
  queued: "#3b82f6",
  sent: "#3b82f6",
  undelivered: "#f97316",
};

// Plivo call hangup codes / SIP error codes
export const CALL_ERROR_CODE_LABELS: Record<string, string> = {
  "4001": "Authentication Failed",
  "4002": "Forbidden",
  "4003": "Request Timeout",
  "4004": "Number Not Found",
  "4005": "Method Not Allowed",
  "4006": "Not Acceptable",
  "4007": "Proxy Auth Required",
  "4008": "Request Timeout (408)",
  "4010": "Gone",
  "4013": "Request Entity Too Large",
  "4015": "Unsupported Media Type",
  "4016": "Unsupported URI Scheme",
  "4020": "Bad Extension",
  "4023": "Interval Too Brief",
  "4080": "Temporarily Unavailable",
  "4081": "Call Does Not Exist",
  "4082": "Loop Detected",
  "4083": "Too Many Hops",
  "4084": "Address Incomplete",
  "4085": "Ambiguous",
  "4086": "Busy Here",
  "4087": "Request Terminated",
  "4088": "Not Acceptable Here",
  "5000": "Server Internal Error",
  "5001": "Not Implemented",
  "5002": "Bad Gateway",
  "5003": "Service Unavailable",
  "5004": "Server Timeout",
  "5005": "Version Not Supported",
  "6000": "Busy Everywhere",
  "6003": "Decline",
  "6004": "Does Not Exist Anywhere",
  "6006": "Not Acceptable (Global)",
};

// Plivo message error codes
export const MESSAGE_ERROR_CODE_LABELS: Record<string, string> = {
  "100": "Message Queued",
  "200": "Delivered",
  "300": "Delivery Failure (Carrier)",
  "400": "Message Filtered",
  "450": "Carrier Violation",
  "460": "Spam Detected",
  "470": "Invalid Destination Number",
  "500": "Unknown Error",
  "510": "Message Too Long",
  "520": "Carrier Not Supported",
  "530": "Invalid Source Number",
  "540": "Rate Limit Exceeded",
  "550": "Number Inactive",
  "560": "Content Not Allowed",
  "600": "Carrier Timeout",
  "610": "Carrier Unreachable",
  "700": "Handset Delivery Failure",
  "710": "Handset Not Supported",
  "720": "Roaming Error",
  "800": "Number Blocked",
  "900": "Account Error",
  "950": "Insufficient Credits",
};

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" as const },
  { label: "Call Logs", href: "/calls", icon: "Phone" as const },
  { label: "Messages", href: "/messages", icon: "MessageSquare" as const },
  { label: "Carriers", href: "/carriers", icon: "Building2" as const },
];
