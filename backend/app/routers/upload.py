import csv
import io

from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.upload import ImportResult, PreviewResult
from app.services.import_service import (
    import_data,
    preview_data,
    clear_table,
    get_template_headers,
    TYPE_CONFIG,
)

router = APIRouter(prefix="/api/import", tags=["Import"])

VALID_TYPES = set(TYPE_CONFIG.keys())


def _validate_type(log_type: str) -> str:
    if log_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type '{log_type}'. Must be one of: {', '.join(sorted(VALID_TYPES))}")
    return log_type


@router.post("/upload", response_model=ImportResult)
async def upload_file(
    file: UploadFile = File(...),
    type: str = Query(..., description="calls or messages"),
    db: AsyncSession = Depends(get_db),
):
    _validate_type(type)

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("csv", "xlsx"):
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported")

    total, imported, skipped, errors = await import_data(db, file, type)
    return ImportResult(
        total_rows=total,
        imported_rows=imported,
        skipped_rows=skipped,
        errors=errors,
    )


@router.post("/preview", response_model=PreviewResult)
async def preview_file(
    file: UploadFile = File(...),
    type: str = Query(..., description="calls or messages"),
):
    _validate_type(type)

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("csv", "xlsx"):
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are supported")

    total, valid, errors, preview = await preview_data(file, type)
    return PreviewResult(
        total_rows=total,
        valid_rows=valid,
        errors=errors,
        preview=preview,
    )


@router.post("/clear")
async def clear_data(
    type: str = Query(..., description="calls or messages"),
    db: AsyncSession = Depends(get_db),
):
    _validate_type(type)
    await clear_table(db, type)
    return {"message": f"All {type} data cleared successfully"}


@router.get("/template/{type}")
async def download_template(type: str):
    _validate_type(type)
    headers = get_template_headers(type)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)

    content = output.getvalue()
    return StreamingResponse(
        io.BytesIO(content.encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}_template.csv"},
    )
