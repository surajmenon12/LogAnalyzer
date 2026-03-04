import csv
import io
import uuid as uuid_lib
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any, Type

from dateutil import parser as dateutil_parser
from fastapi import UploadFile
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.models.call_log import CallLog
from app.models.message_log import MessageLog
from app.models.sip_trunk_log import SIPTrunkLog
from app.schemas.upload import ImportError as ImportErrorSchema

# Column definitions per log type
# Each entry: (field_name, required, parser)
CALL_COLUMNS = {
    "from_number": (True, str),
    "to_number": (True, str),
    "direction": (True, str),
    "status": (True, str),
    "error_code": (False, str),
    "duration": (False, int),
    "bill_duration": (False, int),
    "hangup_initiator": (False, str),
    "rate": (False, float),
    "amount": (False, float),
    "call_id": (False, str),
    "carrier": (True, str),
    "region": (True, str),
    "from_country": (False, str),
    "to_country": (False, str),
    "transport_protocol": (False, str),
    "srtp": (False, bool),
    "secure_trunking": (False, bool),
    "secure_trunking_rate": (False, float),
    "stir_verification": (False, str),
    "attestation_indicator": (False, str),
    "cnam_lookup_number_config": (False, str),
    "cnam_lookup_customer_rate": (False, float),
    "answer_time": (False, "datetime"),
    "initiated_at": (True, "datetime"),
    "ended_at": (False, "datetime"),
}

MESSAGE_COLUMNS = {
    "subaccount": (False, str),
    "from_number": (True, str),
    "replaced_sender": (False, str),
    "to_number": (True, str),
    "direction": (True, str),
    "status": (True, str),
    "units": (False, int),
    "amount": (False, float),
    "message_rate": (False, float),
    "message_charge": (False, float),
    "carrier": (True, str),
    "kannel_message_id": (False, str),
    "error_code": (False, str),
    "powerpack_id": (False, str),
    "requester_ip": (False, str),
    "is_domestic": (False, bool),
    "senderid_usecase": (False, str),
    "waba_id": (False, str),
    "waba_name": (False, str),
    "conversation_id": (False, str),
    "conversation_origin": (False, str),
    "conversation_expiry": (False, "datetime"),
    "surcharge_rate": (False, float),
    "mno": (False, str),
    "is_10dlc_registered": (False, bool),
    "campaign_id": (False, str),
    "region": (False, str),
    "from_country": (False, str),
    "to_country": (False, str),
    "message_type": (True, str),

    "carrier_error_code": (False, str),
    "sent_at": (True, "datetime"),
    "delivered_at": (False, "datetime"),
}

SIP_TRUNK_COLUMNS = {
    "trunk_name": (True, str),
    "status": (True, str),
    "error_code": (False, str),
    "error_message": (False, str),
    "latency_ms": (True, float),
    "packet_loss_pct": (True, float),
    "jitter_ms": (True, float),
    "region": (True, str),
    "carrier": (True, str),
    "recorded_at": (True, "datetime"),
}

VALID_ENUMS = {
    "calls": {
        "direction": {"inbound", "outbound"},
        "status": {"completed", "failed", "busy", "no-answer", "cancelled"},
    },
    "messages": {
        "direction": {"inbound", "outbound"},
        "status": {"delivered", "failed", "queued", "sent", "undelivered"},
        "message_type": {"sms", "mms"},
    },
    "sip-trunks": {
        "status": {"healthy", "degraded", "down"},
    },
}

TYPE_CONFIG = {
    "calls": (CALL_COLUMNS, CallLog),
    "messages": (MESSAGE_COLUMNS, MessageLog),
    "sip-trunks": (SIP_TRUNK_COLUMNS, SIPTrunkLog),
}

# Alias map: maps alternate/exported CSV header names to canonical field names.
# Keys must be lowercase with spaces replaced by underscores.
HEADER_ALIASES = {
    # Calls / Messages shared
    "from": "from_number",
    "to": "to_number",
    "duration_(s)": "duration",
    "duration_s": "duration",
    "duration": "duration",
    "initiated_at": "initiated_at",
    "ended_at": "ended_at",
    # Messages
    "type": "message_type",
    "message_type": "message_type",
    "sent_at": "sent_at",
    "time": "sent_at",
    "delivered_at": "delivered_at",
    "delivery_time": "delivered_at",
    "message_uuid": "uuid",
    "subaccount": "subaccount",
    "replaced_sender_(as_sent_by_plivo)": "replaced_sender",
    "replaced_sender": "replaced_sender",
    "amount": "amount",
    "message_rate": "message_rate",
    "message_charge": "message_charge",
    "kannel_message_id": "kannel_message_id",
    "powerpack_id": "powerpack_id",
    "requester_ip": "requester_ip",
    "is_domestic": "is_domestic",
    "senderid_usecase": "senderid_usecase",
    "waba_id": "waba_id",
    "waba_name": "waba_name",
    "conversation_id": "conversation_id",
    "conversation_origin": "conversation_origin",
    "conversation_expiry": "conversation_expiry",
    "surcharge_rate": "surcharge_rate",
    "mobile_network_operator": "mno",
    "mno": "mno",
    "10dlc_registered": "is_10dlc_registered",
    "is_10dlc_registered": "is_10dlc_registered",
    "campaignid": "campaign_id",
    "campaign_id": "campaign_id",
    "carrier_error_code": "carrier_error_code",
    "to_country": "to_country",
    "region": "region",
    "carrier_used": "carrier",
    "carrier": "carrier",
    "units": "units",
    "status": "status",
    "direction": "direction",
    "plivo_errorcode": "error_code",
    "error_code": "error_code",
    # Calls specific
    "call_uuid": "uuid",
    "call_direction": "direction",
    "bill_duration": "bill_duration",
    "end_time": "ended_at",
    "hangup_cause": "status",
    "hangup_initiator": "hangup_initiator",
    "rate(inr)": "rate",
    "total_amount(inr)": "amount",
    "initiation_time": "initiated_at",
    "answer_time": "answer_time",
    "call_id": "call_id",
    "trunk_domain": "carrier",
    "from_country": "from_country",
    "transport_protocol": "transport_protocol",
    "srtp": "srtp",
    "hangup_code": "error_code",
    "secure_trunking": "secure_trunking",
    "secure_trunking_rate(inr)": "secure_trunking_rate",
    "stir_verification": "stir_verification",
    "attestation_indicator": "attestation_indicator",
    "cnam_lookup_number_config": "cnam_lookup_number_config",
    "cnam_lookup_customer_rate(inr)": "cnam_lookup_customer_rate",
    # SIP trunks
    "trunk_name": "trunk_name",
    "latency_(ms)": "latency_ms",
    "latency_ms": "latency_ms",
    "packet_loss_(%)": "packet_loss_pct",
    "packet_loss_%": "packet_loss_pct",
    "packet_loss_pct": "packet_loss_pct",
    "jitter_(ms)": "jitter_ms",
    "jitter_ms": "jitter_ms",
    "recorded_at": "recorded_at",
}


def _normalize_header(header: str) -> str:
    """Normalize a CSV header to a model field name (case-insensitive, flexible)."""
    key = header.strip().lower().replace(" ", "_").replace("-", "_")
    return HEADER_ALIASES.get(key, key)


def _parse_datetime(value: str) -> datetime:
    # Plivo sometimes exports dates like '2026-03-04 02:49:55.190487383 +0000 UTC'
    # dateutil.parser.parse usually handles this, but let's be safe and strip ' UTC' if present
    # as it can be redundant with the offset and sometimes causes issues.
    clean_value = value.strip()
    if clean_value.endswith(" UTC"):
        clean_value = clean_value[:-4].strip()
    
    # Also, some formats might have too many decimal places for microseconds (Python limit 6)
    # but dateutil usually handles truncation.
    return dateutil_parser.parse(clean_value)


def _parse_value(value: str, field: str, type_hint, log_type: str) -> Tuple[Any, Optional[str]]:
    """Parse a single value. Returns (parsed_value, error_message_or_None)."""
    value = value.strip()
    if not value or value.upper() in ("N/A", "-", "NULL", "NONE"):
        return None, None

    if type_hint == "datetime":
        try:
            return _parse_datetime(value), None
        except (ValueError, TypeError):
            return None, f"Invalid datetime format: '{value}'"
    elif type_hint == int:
        try:
            # Handle cases like "110.0" by converting to float first
            return int(float(value)), None
        except (ValueError, TypeError):
            return None, f"Invalid integer: '{value}'"
    elif type_hint == float:
        try:
            return float(value), None
        except (ValueError, TypeError):
            return None, f"Invalid number: '{value}'"
    elif type_hint == bool:
        val_lower = value.lower()
        if val_lower in ("true", "yes", "1", "t", "y"):
            return True, None
        if val_lower in ("false", "no", "0", "f", "n"):
            return False, None
        return None, f"Invalid boolean: '{value}'"
    else:
        # String — check enum if applicable
        val_lower = value.lower()
        
        # Mapping logic (analytics friendly)
        if log_type == "calls":
            if field == "status":
                mapping = {
                    "normal_clearing": "completed",
                    "normal_hangup": "completed",
                    "busy": "busy",
                    "user_busy": "busy",
                    "no_answer": "no-answer",
                    "call_rejected": "failed",
                    "originator_cancel": "cancelled",
                    "customer_cancelled": "cancelled",
                    "carrier_cancelled": "cancelled",
                }
                if val_lower in mapping:
                    return mapping[val_lower], None
                
                # Treat other specific errors as "failed"
                if any(x in val_lower for x in ["error", "fail", "unavailable", "interrupted", "timeout", "no_more_destinations"]):
                    return "failed", None

        elif log_type == "messages":
            if field == "status":
                if val_lower == "rejected":
                    return "failed", None
                if val_lower == "received":
                    return "delivered", None
            elif field == "message_type":
                if "sms" in val_lower: return "sms", None
                if "mms" in val_lower: return "mms", None

        # We no longer strictly enforce VALID_ENUMS for status/direction 
        # because provider formats vary wildly. We rely on the DB's capacity.
        return value, None


async def read_file_rows(file: UploadFile) -> List[Dict[str, str]]:
    """Read an uploaded file (CSV or XLSX) and return list of row dicts."""
    filename = file.filename or ""
    contents = await file.read()

    if filename.lower().endswith(".xlsx"):
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(contents), read_only=True)
        ws = wb.active
        rows_iter = ws.iter_rows(values_only=True)
        headers = [str(cell or "").strip() for cell in next(rows_iter)]
        rows = []
        for row_values in rows_iter:
            row_dict = {}
            for h, v in zip(headers, row_values):
                row_dict[h] = str(v) if v is not None else ""
            rows.append(row_dict)
        wb.close()
        return rows
    else:
        # Default to CSV
        text = contents.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        return list(reader)


def validate_and_parse_rows(
    rows: List[Dict[str, str]],
    log_type: str,
) -> Tuple[List[Dict[str, Any]], List[ImportErrorSchema]]:
    """Validate rows and return (valid_parsed_rows, errors)."""
    columns, _ = TYPE_CONFIG[log_type]
    errors: List[ImportErrorSchema] = []
    valid_rows: List[Dict[str, Any]] = []

    # Build header mapping from CSV headers to field names
    if not rows:
        return [], []

    csv_headers = {_normalize_header(k): k for k in rows[0].keys()}

    # Check required columns exist
    for field, (required, _) in columns.items():
        if required and field not in csv_headers:
            errors.append(ImportErrorSchema(row=0, field=field, message=f"Required column '{field}' is missing"))

    if any(e.row == 0 for e in errors):
        return [], errors

    for row_num, raw_row in enumerate(rows, start=1):
        # Normalize keys
        row = {_normalize_header(k): v for k, v in raw_row.items()}
        parsed = {}
        row_valid = True

        for field, (required, type_hint) in columns.items():
            raw_value = row.get(field, "").strip()

            if not raw_value:
                if required:
                    errors.append(ImportErrorSchema(row=row_num, field=field, message=f"Required field '{field}' is empty"))
                    row_valid = False
                else:
                    parsed[field] = None
                continue

            value, err = _parse_value(raw_value, field, type_hint, log_type)
            if err:
                errors.append(ImportErrorSchema(row=row_num, field=field, message=err))
                row_valid = False
            else:
                parsed[field] = value

        if row_valid:
            parsed["uuid"] = str(uuid_lib.uuid4())
            parsed["created_at"] = datetime.utcnow()
            valid_rows.append(parsed)

    return valid_rows, errors


async def import_data(
    db: AsyncSession,
    file: UploadFile,
    log_type: str,
) -> Tuple[int, int, int, List[ImportErrorSchema]]:
    """Parse, validate, and import data in batches. Returns (total, imported, skipped, errors)."""
    rows = await read_file_rows(file)
    valid_rows, errors = validate_and_parse_rows(rows, log_type)

    _, model_class = TYPE_CONFIG[log_type]
    
    total = len(rows)
    imported = len(valid_rows)
    skipped = total - imported

    try:
        # Insert in batches to prevent transaction timeouts or memory issues
        batch_size = 500
        for i in range(0, len(valid_rows), batch_size):
            batch = valid_rows[i : i + batch_size]
            objects = [model_class(**row) for row in batch]
            db.add_all(objects)
            await db.flush() # Send to DB but don't commit yet

        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        # Log the error and add to errors list
        errors.append(ImportErrorSchema(row=0, field="database", message=str(e)))
        return total, 0, total, errors

    return total, imported, skipped, errors


async def preview_data(
    file: UploadFile,
    log_type: str,
) -> Tuple[int, int, List[ImportErrorSchema], List[Dict[str, Any]]]:
    """Parse and validate without inserting. Returns (total, valid, errors, preview_rows)."""
    rows = await read_file_rows(file)
    valid_rows, errors = validate_and_parse_rows(rows, log_type)

    # Return first 10 rows as preview (use raw parsed data, drop uuid/created_at)
    preview = []
    for row in valid_rows[:10]:
        preview_row = {k: v for k, v in row.items() if k not in ("uuid", "created_at")}
        # Convert datetimes to strings for JSON
        for k, v in preview_row.items():
            if isinstance(v, datetime):
                preview_row[k] = v.isoformat()
        preview.append(preview_row)

    return len(rows), len(valid_rows), errors, preview


async def clear_table(db: AsyncSession, log_type: str) -> None:
    """Truncate the specified table."""
    _, model_class = TYPE_CONFIG[log_type]
    await db.execute(delete(model_class))
    await db.commit()


def get_template_headers(log_type: str) -> List[str]:
    """Return CSV column headers for the given type."""
    columns, _ = TYPE_CONFIG[log_type]
    return list(columns.keys())
