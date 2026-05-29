# src/app.py
from fastapi import FastAPI, HTTPException
import httpx
from src.clients.store_client import StoreClient
from src.clients.product_client import ProductClient
from src.queue import enqueue_refresh_job, get_job

app = FastAPI(title="Crawler Service")

@app.post("/crawler/refresh")
async def refresh_data():
    """Encola un job de scraping y devuelve su identificador."""
    try:
        job = enqueue_refresh_job()
        return {
            "status": "queued",
            "jobId": job["jobId"],
            "jobStatus": job["status"],
        }
    except Exception as e:
        raise HTTPException(500, f"No se pudo encolar el job: {str(e)}")


@app.get("/crawler/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Consulta estado de un job de scraping."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, f"Job no encontrado: {job_id}")
    return job

@app.get("/crawler/health")
async def health_check():
    """Health check del servicio."""
    return {"status": "healthy", "service": "crawler"}

@app.get("/crawler/test-connections")
async def test_connections():
    """Verificar conexión con otros servicios."""
    store_client = StoreClient()
    product_client = ProductClient()
    
    results = {}
    
    # Test stores service
    try:
        stores = await store_client.get_all_stores()
        results["stores"] = {"up": True, "stores_count": len(stores)}
    except Exception as e:
        results["stores"] = {"up": False, "error": str(e)}
    
    # Test products service
    try:
        products = await product_client.get_product_names()
        results["products"] = {"up": True, "products_count": len(products)}
    except Exception as e:
        results["products"] = {"up": False, "error": str(e)}
    
    # Test scraped service (usando health check si existe, o una operación simple)
    try:
        # Intentamos un health check básico
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://scraped-service:3005/searched-products")
            results["scraped"] = {"up": response.status_code < 500}
    except Exception as e:
        results["scraped"] = {"up": False, "error": str(e)}
    
    return results












