import random
import uuid
from datetime import datetime, timedelta, timezone

from faker import Faker

fake = Faker()

REGIONS = ["US-East", "US-West", "EU-West", "APAC"]

CARRIERS = [
    {"name": "AT&T", "type": "both", "region": "US-East"},
    {"name": "Verizon", "type": "both", "region": "US-East"},
    {"name": "T-Mobile", "type": "both", "region": "US-West"},
    {"name": "Vodafone", "type": "both", "region": "EU-West"},
    {"name": "BT Group", "type": "voice", "region": "EU-West"},
    {"name": "Singtel", "type": "both", "region": "APAC"},
    {"name": "Telstra", "type": "both", "region": "APAC"},
    {"name": "Deutsche Telekom", "type": "voice", "region": "EU-West"},
]

CALL_ERROR_CODES = {
    "3000": "normal_hangup",
    "3020": "rtp_timeout",
    "4010": "unauthorized_by_carrier",
    "4040": "forbidden",
    "4090": "destination_not_found",
    "4160": "request_timeout_carrier",
    "4340": "temporary_unavailable",
    "4410": "user_busy",
    "5000": "service_unavailable_no_more_destinations",
    "5010": "port_limit_reached",
    "5180": "cps_limit_reached",
    "5250": "internal_error",
    "5350": "service_unavailable_by_carrier",
    "6000": "busy_everywhere",
    "6030": "alloted_timeout",
}

MSG_ERROR_CODES = {
    "400": "invalid_destination_number",
    "410": "message_filtered",
    "420": "carrier_violation",
    "450": "delivery_timeout",
    "460": "unreachable_destination",
    "500": "internal_error",
}

CALL_STATUSES = ["completed", "failed", "busy", "no-answer", "cancelled"]
CALL_STATUS_WEIGHTS = [0.72, 0.12, 0.06, 0.07, 0.03]

MSG_STATUSES = ["delivered", "failed", "queued", "sent", "undelivered"]
MSG_STATUS_WEIGHTS = [0.75, 0.08, 0.02, 0.10, 0.05]

def generate_phone():
    return f"+1{random.randint(2000000000, 9999999999)}"


def generate_call_logs(count=500, days_back=30):
    now = datetime.now(timezone.utc)
    logs = []
    for _ in range(count):
        status = random.choices(CALL_STATUSES, weights=CALL_STATUS_WEIGHTS, k=1)[0]
        initiated_at = now - timedelta(days=random.uniform(0, days_back), hours=random.uniform(0, 24))
        carrier = random.choice(CARRIERS)

        if status == "completed":
            duration = random.randint(5, 3600)
        elif status in ("busy", "no-answer"):
            duration = random.randint(0, 5)
        else:
            duration = 0

        error_code = None
        error_message = None
        if status == "failed":
            code = random.choice(list(CALL_ERROR_CODES.keys()))
            error_code = code
            error_message = CALL_ERROR_CODES[code]
        elif status == "busy":
            error_code = "4410"
            error_message = "user_busy"

        logs.append({
            "uuid": str(uuid.uuid4()),
            "from_number": generate_phone(),
            "to_number": generate_phone(),
            "direction": random.choice(["inbound", "outbound"]),
            "status": status,
            "error_code": error_code,
            "error_message": error_message,
            "duration": duration,
            "region": carrier["region"],
            "carrier": carrier["name"],
            "initiated_at": initiated_at,
            "ended_at": initiated_at + timedelta(seconds=duration) if duration else None,
        })
    return logs


def generate_message_logs(count=300, days_back=30):
    now = datetime.now(timezone.utc)
    logs = []
    for _ in range(count):
        status = random.choices(MSG_STATUSES, weights=MSG_STATUS_WEIGHTS, k=1)[0]
        sent_at = now - timedelta(days=random.uniform(0, days_back), hours=random.uniform(0, 24))
        carrier = random.choice(CARRIERS)

        error_code = None
        error_message = None
        if status in ("failed", "undelivered"):
            code = random.choice(list(MSG_ERROR_CODES.keys()))
            error_code = code
            error_message = MSG_ERROR_CODES[code]

        delivered_at = None
        if status == "delivered":
            delivered_at = sent_at + timedelta(seconds=random.randint(1, 30))

        logs.append({
            "uuid": str(uuid.uuid4()),
            "from_number": generate_phone(),
            "to_number": generate_phone(),
            "direction": random.choice(["inbound", "outbound"]),
            "status": status,
            "error_code": error_code,
            "error_message": error_message,
            "message_type": random.choices(["sms", "mms"], weights=[0.85, 0.15], k=1)[0],
            "units": random.randint(1, 3),
            "region": carrier["region"],
            "carrier": carrier["name"],
            "sent_at": sent_at,
            "delivered_at": delivered_at,
        })
    return logs
