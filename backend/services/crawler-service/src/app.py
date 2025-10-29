from fastapi import FastAPI
import httpx
import os
from src.scrapers.olimpica import scrape_olimpica
from src.scrapers.exito import scrape_exito

app = FastAPI(title="Crawler Service")

# ✅ URLs internas de los microservicios (usadas dentro del Docker Compose)
STORE_SERVICE_URL = "http://store-service:3001/api/stores"
PRODUCT_SERVICE_URL = "http://product-service:3002/api/products"


@app.post("/crawler/refresh")
async def refresh_data():
    """Scrapea productos y los envía a los microservicios correspondientes."""
    queries = ["arroz", "huevo", "aceite"]

    summary = {
        "olimpica": {"scraped": 0, "sent": 0},
        "exito": {"scraped": 0, "sent": 0},
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        # === Scraping Olímpica ===
        olimpica_products = await scrape_olimpica(queries)
        summary["olimpica"]["scraped"] = len(olimpica_products)

        # Crear tienda Olímpica en store-service
        store_payload = {
            "name": "Olímpica",
            "baseUrl": "https://www.olimpica.com",
            "categories": queries,
            "country": "CO",
        }
        await client.post(STORE_SERVICE_URL, json=store_payload)

        # Enviar productos al product-service
        olimpica_payload = [
            {
                "name": p["name"],
                "type": "general",
                "price": p["price"],
                "storeId": 2,  # ⚠️ ajusta según el ID real en la DB
            }
            for p in olimpica_products
        ]
        if olimpica_payload:
            # ✅ Ruta corregida (sin duplicar /api/products)
            await client.post(PRODUCT_SERVICE_URL, json=olimpica_payload)
            summary["olimpica"]["sent"] = len(olimpica_payload)

        # === Scraping Éxito ===
        exito_products = await scrape_exito(queries)
        summary["exito"]["scraped"] = len(exito_products)

        # Crear tienda Éxito
        store_payload = {
            "name": "Éxito",
            "baseUrl": "https://www.exito.com",
            "categories": queries,
            "country": "CO",
        }
        await client.post(STORE_SERVICE_URL, json=store_payload)

        # Enviar productos al product-service
        exito_payload = [
            {
                "name": p["name"],
                "type": "general",
                "price": p["price"],
                "storeId": 1,  # ⚠️ ajusta según el ID real en la DB
            }
            for p in exito_products
        ]
        if exito_payload:
            # ✅ Ruta corregida
            await client.post(PRODUCT_SERVICE_URL, json=exito_payload)
            summary["exito"]["sent"] = len(exito_payload)

    return {"status": "ok", "summary": summary}


@app.get("/crawler/test-connection")
async def test_connection():
    """Permite verificar la conexión con los otros servicios."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # ✅ Corregido: no agregar /stores ni /products extra
            store_resp = await client.get(STORE_SERVICE_URL)
            product_resp = await client.get(f"{PRODUCT_SERVICE_URL}/filter?type=test")
            return {
                "store_service": store_resp.status_code,
                "product_service": product_resp.status_code,
            }
        except Exception as e:
            return {"error": str(e)}












