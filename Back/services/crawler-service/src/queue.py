import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_KEY = "crawler:jobs:queue"
JOB_KEY_PREFIX = "crawler:job:"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_redis_client() -> redis.Redis:
    return redis.Redis.from_url(REDIS_URL, decode_responses=True)


def _job_key(job_id: str) -> str:
    return f"{JOB_KEY_PREFIX}{job_id}"


def enqueue_refresh_job(payload: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    job_id = str(uuid.uuid4())
    client = get_redis_client()

    job_data = {
        "id": job_id,
        "status": "pending",
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "payload": json.dumps(payload or {}),
        "result": "",
        "error": "",
    }

    client.hset(_job_key(job_id), mapping=job_data)
    client.rpush(QUEUE_KEY, job_id)

    return {"jobId": job_id, "status": "pending"}


def get_job(job_id: str) -> Optional[dict[str, Any]]:
    client = get_redis_client()
    data = client.hgetall(_job_key(job_id))
    if not data:
        return None

    result = {
        "id": data.get("id"),
        "status": data.get("status"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

    payload_raw = data.get("payload")
    result_raw = data.get("result")
    error_raw = data.get("error")

    if payload_raw:
        try:
            result["payload"] = json.loads(payload_raw)
        except json.JSONDecodeError:
            result["payload"] = payload_raw

    if result_raw:
        try:
            result["result"] = json.loads(result_raw)
        except json.JSONDecodeError:
            result["result"] = result_raw

    if error_raw:
        result["error"] = error_raw

    return result


def set_job_status(job_id: str, status: str, result: Optional[dict[str, Any]] = None, error: str = "") -> None:
    client = get_redis_client()
    update_data = {
        "status": status,
        "updated_at": _now_iso(),
    }

    if result is not None:
        update_data["result"] = json.dumps(result)
    if error:
        update_data["error"] = error

    client.hset(_job_key(job_id), mapping=update_data)
