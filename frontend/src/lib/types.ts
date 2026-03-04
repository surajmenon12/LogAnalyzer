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
  duration: number | null;
  bill_duration: number | null;
  hangup_initiator: string | null;
  rate: number | null;
  amount: number | null;
  call_id: string | null;
  carrier: string;
  region: string;
  from_country: string | null;
  to_country: string | null;
  transport_protocol: string | null;
  srtp: boolean | null;
  secure_trunking: boolean | null;
  secure_trunking_rate: number | null;
  stir_verification: string | null;
  attestation_indicator: string | null;
  cnam_lookup_number_config: string | null;
  cnam_lookup_customer_rate: number | null;
  answer_time: string | null;
  initiated_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface MessageLog {
  id: number;
  uuid: string;
  subaccount: string | null;
  from_number: string;
  replaced_sender: string | null;
  to_number: string;
  direction: string;
  status: string;
  units: number;
  amount: number | null;
  message_rate: number | null;
  message_charge: number | null;
  carrier: string;
  kannel_message_id: string | null;
  error_code: string | null;
  powerpack_id: string | null;
  requester_ip: string | null;
  is_domestic: boolean;
  senderid_usecase: string | null;
  waba_id: string | null;
  waba_name: string | null;
  conversation_id: string | null;
  conversation_origin: string | null;
  conversation_expiry: string | null;
  surcharge_rate: number | null;
  mno: string | null;
  is_10dlc_registered: boolean;
  campaign_id: string | null;
  region: string | null;
  from_country: string | null;
  to_country: string | null;
  message_type: string;
  carrier_error_code: string | null;
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
