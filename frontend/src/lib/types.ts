export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CallLog {
  id: number;
  uuid: string;
  from_number: string;
  to_number: string;
  direction: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
  duration: number | null;
  region: string;
  carrier: string;
  initiated_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface MessageLog {
  id: number;
  uuid: string;
  from_number: string;
  to_number: string;
  direction: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
  message_type: string;
  units: number;
  region: string;
  carrier: string;
  sent_at: string;
  delivered_at: string | null;
  created_at: string;
}

export interface SIPTrunkLog {
  id: number;
  trunk_name: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
  latency_ms: number;
  packet_loss_pct: number;
  jitter_ms: number;
  region: string;
  carrier: string;
  recorded_at: string;
  created_at: string;
}

export interface OverviewStats {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  call_success_rate: number;
  total_messages: number;
  successful_messages: number;
  failed_messages: number;
  message_success_rate: number;
  avg_call_duration: number;
  avg_sip_latency: number;
  avg_packet_loss: number;
  active_carriers: number;
  degraded_trunks: number;
}

export interface TrendPoint {
  timestamp: string;
  total: number;
  successful: number;
  failed: number;
}

export interface TrendResponse {
  calls: TrendPoint[];
  messages: TrendPoint[];
}

export interface CarrierPerformance {
  carrier_name: string;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate: number;
  avg_duration: number;
  total_messages: number;
  message_success_rate: number;
}

export interface FilterState {
  time_from?: string;
  time_to?: string;
  region?: string;
  carrier?: string;
  status?: string;
  error_code?: string;
  sort_by?: string;
  sort_order?: string;
  page: number;
  page_size: number;
  [key: string]: string | number | undefined;
}
