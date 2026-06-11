from __future__ import annotations

import json
import csv
from io import StringIO
from pathlib import Path
from typing import Any


def write_json(path: Path, value: Any) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return str(path)


def write_text(path: Path, value: str) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")
    return str(path)


def to_jsonl(records: list[dict[str, Any]]) -> str:
    return "\n".join(json.dumps(record, ensure_ascii=False) for record in records) + "\n"


def to_csv(records: list[dict[str, Any]]) -> str:
    if not records:
        return ""
    fieldnames = sorted({key for record in records for key in record.keys()})
    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for record in records:
        writer.writerow({key: stringify_cell(record.get(key)) for key in fieldnames})
    return buffer.getvalue()


def stringify_cell(value: Any) -> str:
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    if value is None:
        return ""
    return str(value)
