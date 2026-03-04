from typing import List, Optional

from pydantic import BaseModel


class ImportError(BaseModel):
    row: int
    field: str
    message: str


class ImportResult(BaseModel):
    total_rows: int
    imported_rows: int
    skipped_rows: int
    errors: List[ImportError]


class PreviewResult(BaseModel):
    total_rows: int
    valid_rows: int
    errors: List[ImportError]
    preview: List[dict]
