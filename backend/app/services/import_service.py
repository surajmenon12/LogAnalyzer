import csv
import io
import uuid as uuid_lib
from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any, Type

from dateutil import parser as dateutil_parser
from fastapi import UploadFile
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

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
    "error_message": (False, str),
    "duration": (False, int),
    "region": (True, str),
    "carrier": (True, str),
    "initiated_at": (True, "datetime"),
    "ended_at": (False, "datetime"),
}

MESSAGE_COLUMNS = {
    "from_number": (True, str),
    "to_number": (True, str),
    "direction": (True, str),
    "status": (True, str),
    "error_code": (False, str),
    "error_message": (False, str),
    "message_type": (True, str),
    "units": (False, int),
    "region": (True, str),
    "carrier": (True, str),
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
    "sent_at": "sent_at",
    "delivered_at": "delivered_at",
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
    # Common
    "uuid": "uuid",
    "direction": "direction",
    "status": "status",
    "error_code": "error_code",
    "error_message": "error_message",
    "region": "region",
    "carrier": "carrier",
    "units": "units",
    "from_number": "from_number",
    "to_number": "to_number",
    "message_type": "message_type",
}


def _normalize_header(header: str) -> str:
    """Normalize a CSV header to a model field name (case-insensitive, flexible)."""
    key = header.strip().lower().replace(" ", "_").replace("-", "_")
    return HEADER_ALIASES.get(key, key)


def _parse_datetime(value: str) -> datetime:
    return dateutil_parser.parse(value)


def _parse_value(value: str, field: str, type_hint, log_type: str) -> Tuple[Any, Optional[str]]:
    """Parse a single value. Returns (parsed_value, error_message_or_None)."""
    value = value.strip()
    if not value:
        return None, None

    if type_hint == "datetime":
        try:
            return _parse_datetime(value), None
        except (ValueError, TypeError):
            return None, f"Invalid datetime format: '{value}'"
    elif type_hint == int:
        try:
            return int(value), None
        except (ValueError, TypeError):
            return None, f"Invalid integer: '{value}'"
    elif type_hint == float:
        try:
            return float(value), None
        except (ValueError, TypeError):
            return None, f"Invalid number: '{value}'"
    else:
        # String — check enum if applicable
        enums = VALID_ENUMS.get(log_type, {})
        if field in enums and value.lower() not in enums[field]:
            allowed = ", ".join(sorted(enums[field]))
            return None, f"Invalid value '{value}'. Allowed: {allowed}"
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
    """Parse, validate, and import data. Returns (total, imported, skipped, errors)."""
    rows = await read_file_rows(file)
    valid_rows, errors = validate_and_parse_rows(rows, log_type)

    _, model_class = TYPE_CONFIG[log_type]
    objects = [model_class(**row) for row in valid_rows]

    if objects:
        db.add_all(objects)
        await db.commit()

    total = len(rows)
    imported = len(valid_rows)
    skipped = total - imported
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
