from __future__ import annotations

import json
from pathlib import Path
from typing import Any, TypedDict
from urllib.parse import quote

import httpx
from langgraph.graph import END, START, StateGraph

from aurora_agent_core.core.trace import append_trace, new_run_id
from aurora_agent_core.llm.zai_client import call_zai_chat_with_usage
from aurora_agent_core.schemas.task_spec import create_task_id
from aurora_agent_core.utils.files import to_csv, to_jsonl, write_json, write_text


class DatasetLlmGenerationError(ValueError):
    def __init__(self, message: str, usage: dict[str, Any] | None = None) -> None:
        super().__init__(message)
        self.usage = usage


class DatasetMinerState(TypedDict, total=False):
    run_id: str
    task_spec: dict[str, Any]
    output_dir: str
    plan: dict[str, Any]
    sources: list[dict[str, Any]]
    raw_records: list[dict[str, Any]]
    clean_records: list[dict[str, Any]]
    extraction_summary: dict[str, Any]
    cleaning_summary: dict[str, Any]
    llm_usage: list[dict[str, Any]]
    llm_errors: list[str]
    result: dict[str, Any]
    trace: list[dict[str, Any]]


class DatasetMinerGraph:
    def __init__(self) -> None:
        self.graph = self._build_graph()

    def run(self, task_spec: dict[str, Any], output_dir: str | Path | None = None) -> dict[str, Any]:
        if task_spec.get("task_type") != "dataset_generation":
            raise ValueError("DatasetMinerGraph only accepts task_type=dataset_generation.")
        task_id = task_spec.get("task_id") or create_task_id()
        final_state = self.graph.invoke(
            {
                "run_id": new_run_id("dataset"),
                "task_spec": {**task_spec, "task_id": task_id},
                "output_dir": str(output_dir or Path.cwd() / "artifacts" / task_id),
                "trace": [],
            }
        )
        trace = {"run_id": final_state["run_id"], "events": final_state["trace"]}
        output_path = Path(final_state["output_dir"])
        write_json(output_path / "trace.json", trace)
        write_json(output_path / "result.json", final_state["result"])
        return {**final_state["result"], "trace": trace}

    def _build_graph(self):
        builder = StateGraph(DatasetMinerState)
        builder.add_node("dataset_planner", dataset_planner)
        builder.add_node("source_finder", source_finder)
        builder.add_node("extractor", extractor)
        builder.add_node("cleaner", cleaner)
        builder.add_node("packager", packager)

        builder.add_edge(START, "dataset_planner")
        builder.add_edge("dataset_planner", "source_finder")
        builder.add_edge("source_finder", "extractor")
        builder.add_edge("extractor", "cleaner")
        builder.add_edge("cleaner", "packager")
        builder.add_edge("packager", END)
        return builder.compile()


def dataset_planner(state: DatasetMinerState) -> DatasetMinerState:
    spec = state["task_spec"]
    payload = dataset_payload(spec)
    plan = {
        "task_id": spec["task_id"],
        "goal": spec.get("goal", ""),
        "target_size": payload.get("target_size") or 20,
        "output_format": payload.get("output_format") or "jsonl",
        "fields": infer_fields(spec),
        "dataset_schema": "aurora.vulnerability_dataset.v1",
        "quality_rules": [
            "remove duplicate records by normalized title and source_url",
            "keep provenance fields for every record",
            "prefer real public API records when a real connector is requested",
            "do not silently synthesize records when OSV is explicitly requested",
            "preserve package, severity, CWE, alias, and reference metadata for OSV records",
        ],
    }
    return {"plan": plan, "trace": append_trace(state, "dataset_planner", "completed", {"target_size": plan["target_size"]})}


def source_finder(state: DatasetMinerState) -> DatasetMinerState:
    spec = state["task_spec"]
    payload = dataset_payload(spec)
    scopes = payload.get("source_scope") or ["public_web"]
    if any(str(scope).lower() == "osv" for scope in scopes):
        scopes = [scope for scope in scopes if str(scope).lower() != "public_web"]
    sources: list[dict[str, Any]] = []
    for scope in scopes:
        sources.extend(build_sources_for_scope(scope, spec))
    sources = dedupe_sources(sources)
    return {"sources": sources, "trace": append_trace(state, "source_finder", "completed", {"sources": len(sources)})}


def extractor(state: DatasetMinerState) -> DatasetMinerState:
    spec = state["task_spec"]
    target_size = int(state["plan"]["target_size"])
    sources = state.get("sources") or build_sources_for_scope("public_web", spec)
    osv_sources = [source for source in sources if source.get("type") == "osv"]
    if osv_sources:
        records, summary = collect_osv_records(spec, osv_sources, target_size)
        return {
            "raw_records": records,
            "extraction_summary": summary,
            "trace": append_trace(
                state,
                "extractor",
                "completed" if records else "no_data",
                {"records": len(records), "method": "osv_api", "errors": len(summary.get("errors", []))},
            ),
        }

    if dataset_use_llm_enabled(spec):
        try:
            records, llm_usage = generate_llm_dataset_records(spec, sources, target_size)
            return {
                "raw_records": records,
                "extraction_summary": {
                    "method": "zai_synthetic_generation",
                    "records": len(records),
                    "errors": [],
                    "real_source_records": 0,
                    "synthetic_records": len(records),
                },
                "llm_usage": [llm_usage],
                "trace": append_trace(
                    state,
                    "extractor",
                    "completed",
                    {"records": len(records), "method": "zai_synthetic_generation", "llm_usage": llm_usage},
                ),
            }
        except Exception as error:
            llm_usage = getattr(error, "usage", None)
            state = {
                **state,
                "llm_usage": [llm_usage] if llm_usage else [],
                "llm_errors": [str(error)[:500]],
                "trace": append_trace(
                    state,
                    "extractor",
                    "fallback",
                    {"method": "zai_synthetic_generation", "error": str(error)[:240]},
                ),
            }

    topics = infer_topics(spec)
    records: list[dict[str, Any]] = []

    for index in range(target_size):
        topic = topics[index % len(topics)]
        source = sources[index % len(sources)]
        records.append(
            {
                "id": f"{spec['task_id']}_record_{index + 1:04d}",
                "title": f"{topic['label']} case {index + 1}",
                "category": topic["category"],
                "prompt": f"Create a structured example for {topic['label']} under goal: {spec.get('goal', '')}",
                "answer": build_answer(topic),
                "reasoning": f"The record is categorized as {topic['category']} because its observable signals match {topic['label']}.",
                "source_type": source["type"],
                "source_name": source["name"],
                "source_url": source["url"],
                "provenance": {
                    "collection_method": "mvp_template_extraction",
                    "public_source_only": True,
                    "synthetic_mvp": True,
                },
            }
        )
    return {
        "raw_records": records,
        "llm_usage": state.get("llm_usage", []),
        "llm_errors": state.get("llm_errors", []),
        "extraction_summary": {
            "method": "synthetic_template",
            "records": len(records),
            "errors": [],
            "real_source_records": 0,
            "synthetic_records": len(records),
        },
        "trace": append_trace(state, "extractor", "completed", {"records": len(records), "method": "synthetic_template"}),
    }


def cleaner(state: DatasetMinerState) -> DatasetMinerState:
    seen: set[str] = set()
    clean_records: list[dict[str, Any]] = []
    duplicates_removed = 0
    invalid_removed = 0

    for record in state["raw_records"]:
        if not is_valid_dataset_record(record):
            invalid_removed += 1
            continue
        key = record.get("osv_id") or f"{record['title'].lower()}::{record['source_url']}"
        if key in seen:
            duplicates_removed += 1
            continue
        seen.add(key)
        clean_records.append(
            {
                **record,
                "title": record["title"].strip(),
                "prompt": record["prompt"].strip(),
                "answer": record["answer"].strip(),
                "reasoning": record["reasoning"].strip(),
            }
        )

    summary = {
        "input_records": len(state["raw_records"]),
        "output_records": len(clean_records),
        "duplicates_removed": duplicates_removed,
        "invalid_removed": invalid_removed,
        "real_source_records": sum(1 for record in clean_records if not record.get("provenance", {}).get("synthetic_mvp", True)),
        "synthetic_records": sum(1 for record in clean_records if record.get("provenance", {}).get("synthetic_mvp", False)),
    }
    return {
        "clean_records": clean_records,
        "cleaning_summary": summary,
        "trace": append_trace(state, "cleaner", "completed", summary),
    }


def packager(state: DatasetMinerState) -> DatasetMinerState:
    output_dir = Path(state["output_dir"])
    output_format = state["plan"]["output_format"]
    dataset_path = output_dir / build_dataset_filename(output_format)
    sources_path = output_dir / "sources.json"
    stats_path = output_dir / "stats.json"
    report_path = output_dir / "report.md"
    report_text, report_usage, report_error = build_dataset_report_artifact(state)
    llm_usage = list(state.get("llm_usage") or [])
    llm_errors = list(state.get("llm_errors") or [])
    if report_usage:
        llm_usage.append(report_usage)
    if report_error:
        llm_errors.append(report_error)
    state_for_usage = {**state, "llm_usage": llm_usage, "llm_errors": llm_errors}
    report_text = append_dataset_usage_accounting(report_text, state_for_usage)

    if output_format == "json":
        write_json(dataset_path, state["clean_records"])
    elif output_format == "csv":
        write_text(dataset_path, to_csv(state["clean_records"]))
    else:
        write_text(dataset_path, to_jsonl(state["clean_records"]))

    write_json(sources_path, state["sources"])
    write_json(stats_path, build_stats(state))
    write_text(report_path, report_text)
    status = infer_result_status(state)

    result = {
        "task_id": state["task_spec"]["task_id"],
        "status": status,
        "summary": {
            "records": len(state["clean_records"]),
            "sources_used": len(state["sources"]),
            "duplicates_removed": state["cleaning_summary"]["duplicates_removed"],
            "invalid_removed": state["cleaning_summary"]["invalid_removed"],
            "real_source_records": state["cleaning_summary"]["real_source_records"],
            "synthetic_records": state["cleaning_summary"]["synthetic_records"],
            "output_format": output_format,
        },
        "artifacts": [
            {"type": "dataset", "path": str(dataset_path)},
            {"type": "sources", "path": str(sources_path)},
            {"type": "stats", "path": str(stats_path)},
            {"type": "report", "path": str(report_path)},
            {"type": "trace", "path": str(output_dir / "trace.json")},
        ],
        "usage": build_dataset_usage(state_for_usage, output_format),
    }
    return {"result": result, "trace": append_trace(state, "packager", "completed", {"artifacts": 5, "status": status})}


def build_dataset_filename(output_format: str) -> str:
    if output_format == "json":
        return "dataset.json"
    if output_format == "csv":
        return "dataset.csv"
    return "dataset.jsonl"


def infer_fields(spec: dict[str, Any]) -> list[str]:
    payload = dataset_payload(spec)
    if "osv" in [str(scope).lower() for scope in payload.get("source_scope", [])]:
        return [
            "id",
            "record_type",
            "title",
            "category",
            "prompt",
            "answer",
            "reasoning",
            "source_url",
            "osv_id",
            "aliases",
            "package",
            "severity",
            "cwe_ids",
            "published",
            "modified",
            "references",
            "provenance",
        ]
    requirements = " ".join(spec.get("requirements", []))
    if "推理" in requirements:
        return ["id", "title", "prompt", "answer", "reasoning", "source_url", "provenance"]
    return ["id", "title", "category", "prompt", "answer", "reasoning", "source_url", "provenance"]


def infer_topics(spec: dict[str, Any]) -> list[dict[str, str]]:
    text = f"{spec.get('goal', '')} {' '.join(spec.get('requirements', []))}".lower()
    topics: list[dict[str, str]] = []
    if "重入" in text:
        topics.append({"category": "reentrancy", "label": "Reentrancy vulnerability"})
    if "权限" in text:
        topics.append({"category": "access_control", "label": "Access control vulnerability"})
    if "价格操纵" in text:
        topics.append({"category": "price_manipulation", "label": "Price manipulation vulnerability"})
    if "web3" in text:
        topics.append({"category": "web3_security", "label": "Web3 security"})
    if "reasoning" in text or "推理" in text:
        topics.append({"category": "reasoning_qa", "label": "Reasoning QA"})
    return topics or [{"category": "general", "label": "General dataset"}]


def build_sources_for_scope(scope: str, spec: dict[str, Any]) -> list[dict[str, Any]]:
    normalized = str(scope).lower()
    topic = quote(spec.get("title") or spec.get("goal") or "dataset")
    if "osv" in normalized:
        return build_osv_sources(spec)
    if "github" in normalized:
        return [{"type": "github", "name": "GitHub public code search plan", "url": f"https://github.com/search?q={topic}", "access": "public"}]
    if "paper" in normalized or "arxiv" in normalized:
        return [{"type": "paper", "name": "arXiv public paper search plan", "url": f"https://arxiv.org/search/?query={topic}&searchtype=all", "access": "public"}]
    if "blog" in normalized:
        return [{"type": "blog", "name": "Public technical blog search plan", "url": f"https://www.google.com/search?q={topic}+blog", "access": "public"}]
    if "doc" in normalized:
        return [{"type": "docs", "name": "Public documentation search plan", "url": f"https://www.google.com/search?q={topic}+docs", "access": "public"}]
    return [{"type": "public_web", "name": "Public web source plan", "url": f"https://www.google.com/search?q={topic}", "access": "public"}]


def build_osv_sources(spec: dict[str, Any]) -> list[dict[str, Any]]:
    payload = dataset_payload(spec)
    packages = (payload.get("source_config") or {}).get("osv_packages") or [
        {"name": "github.com/ethereum/go-ethereum", "ecosystem": "Go"},
        {"name": "@openzeppelin/contracts", "ecosystem": "npm"},
        {"name": "web3", "ecosystem": "npm"},
        {"name": "hardhat", "ecosystem": "npm"},
        {"name": "solc", "ecosystem": "npm"},
    ]
    return [
        {
            "type": "osv",
            "name": f"OSV package query: {package['ecosystem']}/{package['name']}",
            "url": "https://api.osv.dev/v1/query",
            "access": "public",
            "package": package,
        }
        for package in packages
    ]


def dataset_payload(spec: dict[str, Any]) -> dict[str, Any]:
    payload = spec.get("dataset") if isinstance(spec.get("dataset"), dict) else {}
    return {
        "output_format": payload.get("output_format") or spec.get("output_format"),
        "target_size": payload.get("target_size") or spec.get("target_size"),
        "source_scope": payload.get("source_scope") or spec.get("source_scope") or [],
        "source_config": payload.get("source_config") or spec.get("source_config") or {},
    }


def dataset_use_llm_enabled(spec: dict[str, Any]) -> bool:
    metadata = spec.get("metadata") or {}
    if "use_llm" in metadata:
        return bool(metadata.get("use_llm"))
    llm = metadata.get("llm")
    if isinstance(llm, dict) and "enabled" in llm:
        return bool(llm.get("enabled"))
    return False


def dedupe_sources(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    for source in sources:
        package = source.get("package") or {}
        key = (
            str(source.get("type")),
            str(package.get("ecosystem") or ""),
            str(package.get("name") or source.get("url") or source.get("name")),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(source)
    return deduped


def collect_osv_records(
    spec: dict[str, Any],
    sources: list[dict[str, Any]],
    target_size: int,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    records: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    errors: list[dict[str, Any]] = []
    queried_packages: list[dict[str, str]] = []

    with httpx.Client(timeout=15.0) as client:
        for source in sources:
            if len(records) >= target_size:
                break
            package = source.get("package")
            if not package:
                continue
            queried_packages.append(package)
            try:
                response = client.post(source["url"], json={"package": package})
                response.raise_for_status()
            except Exception as error:
                errors.append(
                    {
                        "source": source["name"],
                        "package": package,
                        "error": str(error)[:240],
                    }
                )
                continue
            for vuln in response.json().get("vulns", []):
                osv_id = vuln.get("id")
                if not osv_id or osv_id in seen_ids:
                    continue
                seen_ids.add(osv_id)
                records.append(map_osv_vulnerability(spec, vuln, source, len(records) + 1))
                if len(records) >= target_size:
                    break

    return records, {
        "method": "osv_api",
        "records": len(records),
        "target_size": target_size,
        "queried_packages": queried_packages,
        "errors": errors,
        "real_source_records": len(records),
        "synthetic_records": 0,
    }


def generate_llm_dataset_records(
    spec: dict[str, Any],
    sources: list[dict[str, Any]],
    target_size: int,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    result = call_zai_chat_with_usage(build_llm_dataset_messages(spec, sources, target_size))
    try:
        payload = parse_llm_dataset_payload(result.content)
    except Exception as error:
        raise DatasetLlmGenerationError(str(error), result.usage) from error
    records: list[dict[str, Any]] = []
    for index, item in enumerate(payload[:target_size], start=1):
        source = sources[(index - 1) % len(sources)] if sources else {}
        records.append(normalize_llm_dataset_record(spec, item, source, index))
    if not records:
        raise DatasetLlmGenerationError("Z.ai dataset generation returned no records.", result.usage)
    return records, result.usage


def build_llm_dataset_messages(spec: dict[str, Any], sources: list[dict[str, Any]], target_size: int) -> list[dict[str, str]]:
    schema = {
        "title": "short record title",
        "category": "record category",
        "prompt": "training prompt or question",
        "answer": "grounded synthetic answer",
        "reasoning": "brief explanation for category and answer",
        "source_url": "public source planning URL if available",
    }
    payload = {
        "target_size": target_size,
        "schema": schema,
        "goal": spec.get("goal"),
        "requirements": spec.get("requirements", []),
        "constraints": spec.get("constraints", []),
        "sources": sources[:10],
        "rules": [
            "Return only a JSON array.",
            "Generate synthetic records for dataset bootstrapping.",
            "Do not claim that synthetic records are real vulnerabilities.",
            "Keep answers concise and useful for downstream model training.",
            "Use public source URLs only as provenance hints, not as proof of real incidents.",
        ],
    }
    return [
        {
            "role": "system",
            "content": (
                "You are Aurora Dataset Miner. Return only valid JSON. "
                "Create structured synthetic dataset rows while preserving provenance honesty."
            ),
        },
        {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
    ]


def parse_llm_dataset_payload(content: str) -> list[dict[str, Any]]:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```").strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end <= start:
        object_start = cleaned.find("{")
        object_end = cleaned.rfind("}")
        if object_start == -1 or object_end == -1 or object_end <= object_start:
            raise ValueError("LLM dataset response did not contain JSON records.")
        payload = json.loads(cleaned[object_start : object_end + 1])
    else:
        payload = json.loads(cleaned[start : end + 1])
    if isinstance(payload, dict):
        for key in ("records", "data", "items"):
            if isinstance(payload.get(key), list):
                payload = payload[key]
                break
    if not isinstance(payload, list):
        raise ValueError("LLM dataset response must be a JSON array or an object with records.")
    return [item for item in payload if isinstance(item, dict)]


def normalize_llm_dataset_record(
    spec: dict[str, Any],
    item: dict[str, Any],
    source: dict[str, Any],
    index: int,
) -> dict[str, Any]:
    source_url = str(item.get("source_url") or source.get("url") or "synthetic://zai-dataset-generation")
    return {
        "id": f"{spec['task_id']}_llm_{index:04d}",
        "title": truncate_text(item.get("title") or f"Z.ai synthetic dataset record {index}", 200),
        "category": truncate_text(item.get("category") or "synthetic_dataset", 120),
        "prompt": truncate_text(item.get("prompt") or spec.get("goal") or "Synthetic dataset prompt", 1200),
        "answer": truncate_text(item.get("answer") or "", 2000),
        "reasoning": truncate_text(item.get("reasoning") or "Generated by Z.ai for synthetic dataset bootstrapping.", 1200),
        "source_type": source.get("type") or "synthetic",
        "source_name": source.get("name") or "Z.ai synthetic generation",
        "source_url": source_url,
        "provenance": {
            "collection_method": "zai_synthetic_generation",
            "public_source_only": True,
            "synthetic_mvp": True,
            "model_generated": True,
        },
    }


def map_osv_vulnerability(
    spec: dict[str, Any],
    vuln: dict[str, Any],
    source: dict[str, Any],
    index: int,
) -> dict[str, Any]:
    package = source.get("package", {})
    references = vuln.get("references") or []
    source_url = first_reference_url(references) or f"https://osv.dev/vulnerability/{vuln.get('id')}"
    severity = extract_osv_severity(vuln)
    cwe_ids = (vuln.get("database_specific") or {}).get("cwe_ids") or []

    return {
        "id": f"{spec['task_id']}_osv_{index:04d}",
        "record_type": "vulnerability_advisory",
        "title": vuln.get("summary") or vuln.get("id") or f"OSV vulnerability {index}",
        "category": "osv_vulnerability",
        "prompt": f"Analyze OSV vulnerability {vuln.get('id')} for package {package.get('name')}.",
        "answer": truncate_text(vuln.get("details") or vuln.get("summary") or "", 1200),
        "reasoning": build_osv_reasoning(vuln, package, severity, cwe_ids),
        "source_type": "osv",
        "source_name": source["name"],
        "source_url": source_url,
        "osv_id": vuln.get("id"),
        "aliases": vuln.get("aliases") or [],
        "package": package,
        "severity": severity,
        "cwe_ids": cwe_ids,
        "published": vuln.get("published"),
        "modified": vuln.get("modified"),
        "references": references,
        "provenance": {
            "collection_method": "osv_api_query",
            "api_endpoint": source["url"],
            "public_source_only": True,
            "synthetic_mvp": False,
        },
    }


def is_valid_dataset_record(record: dict[str, Any]) -> bool:
    required = ("id", "title", "prompt", "answer", "source_url", "provenance")
    return all(record.get(field) for field in required)


def infer_result_status(state: DatasetMinerState) -> str:
    records = len(state.get("clean_records", []))
    errors = state.get("extraction_summary", {}).get("errors", [])
    requested_osv = any(source.get("type") == "osv" for source in state.get("sources", []))
    if records == 0 and requested_osv:
        return "no_data"
    if records > 0 and errors:
        return "partial"
    return "completed"


def build_stats(state: DatasetMinerState) -> dict[str, Any]:
    clean_records = state.get("clean_records", [])
    severity_counts: dict[str, int] = {}
    package_counts: dict[str, int] = {}
    cwe_counts: dict[str, int] = {}

    for record in clean_records:
        severity = record.get("severity") or "UNKNOWN"
        severity_counts[severity] = severity_counts.get(severity, 0) + 1
        package = record.get("package") or {}
        package_key = f"{package.get('ecosystem', 'unknown')}/{package.get('name', 'unknown')}"
        package_counts[package_key] = package_counts.get(package_key, 0) + 1
        for cwe_id in record.get("cwe_ids") or ["UNKNOWN"]:
            cwe_counts[cwe_id] = cwe_counts.get(cwe_id, 0) + 1

    return {
        "task_id": state["task_spec"]["task_id"],
        "dataset_schema": state["plan"].get("dataset_schema"),
        "target_size": state["plan"].get("target_size"),
        "extraction": state.get("extraction_summary", {}),
        "cleaning": state.get("cleaning_summary", {}),
        "severity_counts": severity_counts,
        "package_counts": package_counts,
        "cwe_counts": cwe_counts,
    }


def build_dataset_usage(state: DatasetMinerState, output_format: str) -> dict[str, Any]:
    extraction = state.get("extraction_summary", {})
    queried_packages = extraction.get("queried_packages") or []
    llm_usage = aggregate_llm_usage(state.get("llm_usage") or [])
    return {
        "miner": "dataset_miner",
        "records_requested": state["plan"].get("target_size"),
        "records_output": len(state.get("clean_records", [])),
        "sources_used": len(state.get("sources", [])),
        "source_api_calls": len(queried_packages),
        "extraction_method": extraction.get("method"),
        "real_source_records": state.get("cleaning_summary", {}).get("real_source_records", 0),
        "synthetic_records": state.get("cleaning_summary", {}).get("synthetic_records", 0),
        "output_format": output_format,
        "llm": llm_usage,
        "llm_total_tokens": (llm_usage or {}).get("total_tokens"),
        "llm_errors": state.get("llm_errors", []),
    }


def aggregate_llm_usage(usages: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not usages:
        return None
    total_prompt = sum(int(usage.get("prompt_tokens") or 0) for usage in usages)
    total_completion = sum(int(usage.get("completion_tokens") or 0) for usage in usages)
    total = sum(int(usage.get("total_tokens") or 0) for usage in usages)
    return {
        "provider": usages[-1].get("provider"),
        "model": usages[-1].get("model"),
        "base_url": usages[-1].get("base_url"),
        "calls": sum(int(usage.get("calls") or 1) for usage in usages),
        "prompt_tokens": total_prompt,
        "completion_tokens": total_completion,
        "total_tokens": total or total_prompt + total_completion,
    }


def first_reference_url(references: list[dict[str, Any]]) -> str | None:
    for preferred_type in ("ADVISORY", "WEB", "REPORT", "FIX", "PACKAGE"):
        for reference in references:
            if reference.get("type") == preferred_type and reference.get("url"):
                return reference["url"]
    for reference in references:
        if reference.get("url"):
            return reference["url"]
    return None


def extract_osv_severity(vuln: dict[str, Any]) -> str | None:
    database_specific = vuln.get("database_specific") or {}
    if database_specific.get("severity"):
        return database_specific["severity"]
    severity = vuln.get("severity") or []
    if severity:
        return severity[0].get("score") or severity[0].get("type")
    return None


def build_osv_reasoning(vuln: dict[str, Any], package: dict[str, Any], severity: str | None, cwe_ids: list[str]) -> str:
    parts = [
        f"OSV lists this vulnerability for {package.get('ecosystem')}/{package.get('name')}.",
    ]
    if severity:
        parts.append(f"Severity is {severity}.")
    if cwe_ids:
        parts.append(f"Related CWE ids: {', '.join(cwe_ids)}.")
    aliases = vuln.get("aliases") or []
    if aliases:
        parts.append(f"Aliases include {', '.join(aliases[:3])}.")
    return " ".join(parts)


def truncate_text(text: str, limit: int) -> str:
    cleaned = " ".join(str(text or "").split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 3] + "..."


def build_answer(topic: dict[str, str]) -> str:
    answers = {
        "reentrancy": "The vulnerable flow allows an external callback before internal accounting is finalized.",
        "access_control": "The issue is caused by missing or incomplete authorization checks on privileged actions.",
        "price_manipulation": "The issue appears when a contract trusts a manipulable price source without safeguards.",
        "web3_security": "The case should identify the asset, trust boundary, exploit path, and mitigation.",
        "reasoning_qa": "The answer should include the final response and a concise reasoning chain.",
        "general": "The record should follow the requested schema and keep source provenance.",
    }
    return answers.get(topic["category"], answers["general"])


def build_dataset_report_artifact(state: DatasetMinerState) -> tuple[str, dict[str, Any] | None, str | None]:
    fallback = build_report(state)
    if not dataset_use_llm_enabled(state["task_spec"]):
        return fallback, None, None
    try:
        result = call_zai_chat_with_usage(build_llm_dataset_report_messages(state))
        content = result.content.strip()
        if not content:
            return fallback, result.usage, "Z.ai returned an empty dataset report."
        return content, result.usage, None
    except Exception as error:
        return fallback + f"\n## Report Generation Error\n\n- Z.ai report generation failed: {str(error)[:300]}\n", None, str(error)[:500]


def append_dataset_usage_accounting(report: str, state: DatasetMinerState) -> str:
    llm_usage = aggregate_llm_usage(state.get("llm_usage") or [])
    if not llm_usage:
        return report
    errors = state.get("llm_errors") or []
    return (
        report.rstrip()
        + "\n\n## Usage Accounting\n\n"
        + f"- Dataset Miner Z.ai calls: {llm_usage.get('calls', 0)}\n"
        + f"- Dataset Miner Z.ai total tokens: {llm_usage.get('total_tokens', 0)}\n"
        + f"- Dataset Miner Z.ai errors: {len(errors)}\n"
    )


def build_llm_dataset_report_messages(state: DatasetMinerState) -> list[dict[str, str]]:
    stats = build_stats(state)
    sample_records = [
        {
            "id": record.get("id"),
            "title": record.get("title"),
            "category": record.get("category"),
            "source_type": record.get("source_type"),
            "synthetic_mvp": (record.get("provenance") or {}).get("synthetic_mvp"),
        }
        for record in state.get("clean_records", [])[:5]
    ]
    payload = {
        "task_id": state["task_spec"]["task_id"],
        "goal": state["task_spec"].get("goal"),
        "target_size": state["plan"].get("target_size"),
        "output_format": state["plan"].get("output_format"),
        "sources": state.get("sources", []),
        "stats": stats,
        "sample_records": sample_records,
        "llm_usage_so_far": aggregate_llm_usage(state.get("llm_usage") or []),
    }
    return [
        {
            "role": "system",
            "content": (
                "You are Aurora Dataset Miner report writer. Write a concise Markdown report in Chinese. "
                "Do not invent source coverage or record counts. Clearly distinguish real public API records from synthetic records. "
                "Include sections: Summary, Source Coverage, Data Quality, LLM Usage, Next Steps."
            ),
        },
        {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
    ]


def build_report(state: DatasetMinerState) -> str:
    stats = build_stats(state)
    extraction = stats["extraction"]
    cleaning = stats["cleaning"]
    errors = extraction.get("errors", [])
    queried = extraction.get("queried_packages", [])
    package_lines = "\n".join(
        f"- {package.get('ecosystem')}/{package.get('name')}" for package in queried
    ) or "- None"
    error_lines = "\n".join(
        f"- {error.get('source')}: {error.get('error')}" for error in errors
    ) or "- None"
    severity_lines = "\n".join(
        f"- {severity}: {count}" for severity, count in sorted(stats["severity_counts"].items())
    ) or "- None"
    return f"""# Dataset Miner Report

## Summary

- Task ID: {state['task_spec']['task_id']}
- Goal: {state['task_spec'].get('goal', '')}
- Records: {len(state['clean_records'])}
- Target size: {state['plan']['target_size']}
- Sources used: {len(state['sources'])}
- Duplicates removed: {state['cleaning_summary']['duplicates_removed']}
- Invalid removed: {state['cleaning_summary']['invalid_removed']}
- Real source records: {cleaning.get('real_source_records', 0)}
- Synthetic records: {cleaning.get('synthetic_records', 0)}
- Output format: {state['plan']['output_format']}
- Dataset schema: {state['plan'].get('dataset_schema')}

## Extraction

- Method: {extraction.get('method')}
- Source errors: {len(errors)}

## Queried Packages

{package_lines}

## Severity Distribution

{severity_lines}

## Source Errors

{error_lines}

## Notes

Records with `synthetic_mvp: false` come from public source APIs such as OSV. Records with `synthetic_mvp: true` are generated placeholders and should not be treated as audited ground truth.
"""
