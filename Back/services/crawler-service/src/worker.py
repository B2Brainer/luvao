import asyncio
import traceback

from src.processor import process_refresh
from src.queue import QUEUE_KEY, get_redis_client, set_job_status


def run_worker() -> None:
    redis_client = get_redis_client()
    print("🚀 Crawler worker iniciado. Esperando jobs...")

    while True:
        # BLPOP bloquea hasta que haya un job en la cola
        _, job_id = redis_client.blpop(QUEUE_KEY)
        print(f"📦 Job recibido: {job_id}")

        set_job_status(job_id, "running")
        try:
            result = asyncio.run(process_refresh())
            set_job_status(job_id, "success", result=result)
            print(f"✅ Job completado: {job_id}")
        except Exception as e:
            error_text = f"{e}\n{traceback.format_exc()}"
            set_job_status(job_id, "failed", error=error_text)
            print(f"❌ Job fallido: {job_id}")


if __name__ == "__main__":
    run_worker()
