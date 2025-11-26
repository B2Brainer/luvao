# src/app.py
from fastapi import FastAPI, HTTPException
from src.clients.store_client import StoreClient
from src.clients.product_client import ProductClient
from src.clients.scraped_client import ScrapedClient
from src.scrapers.olimpica import scrape_olimpica
from src.scrapers.exito import scrape_exito

app = FastAPI(title="Crawler Service")

# Mapeo de nombres de scraper a nombres de tienda
STORE_SCRAPER_MAPPING = {
    "olimpica": "olimpica",
    "exito": "exito"
}

@app.post("/crawler/refresh")
async def refresh_data():
    """Scrapea productos de todas las tiendas y los envía al scraped service."""
    try:
        # 1. Obtener datos de los servicios usando clientes
        store_client = StoreClient()
        product_client = ProductClient()
        scraped_client = ScrapedClient()
        
        product_queries = await product_client.get_product_names()
        stores_data = await store_client.get_all_stores()
        
        if not product_queries:
            raise HTTPException(500, "No se pudieron obtener los productos")
        if not stores_data:
            raise HTTPException(500, "No se pudieron obtener las tiendas")

        # 2. Mapear nombres de tiendas para los scrapers
        store_scraper_mapping = {}
        for store in stores_data:
            store_name_lower = store["name"].lower()
            if "olimpica" in store_name_lower:
                store_scraper_mapping["olimpica"] = store["name"]
            elif "exito" in store_name_lower:
                store_scraper_mapping["exito"] = store["name"]

        # 3. Scrapear datos
        scraped_results = {}
        
        if "olimpica" in store_scraper_mapping:
            print("Scrapeando Olímpica...")
            olimpica_products = await scrape_olimpica(product_queries)
            scraped_results["olimpica"] = {
                "store_name": store_scraper_mapping["olimpica"],
                "products": olimpica_products
            }
            print(f"✅ Olímpica: {len(olimpica_products)} productos scrapeados")

        if "exito" in store_scraper_mapping:
            print("Scrapeando Éxito...")
            exito_products = await scrape_exito(product_queries)
            scraped_results["exito"] = {
                "store_name": store_scraper_mapping["exito"], 
                "products": exito_products
            }
            print(f"✅ Éxito: {len(exito_products)} productos scrapeados")

        # 4. Enviar datos al scraped service
        total_sent = 0
        for scraper_name, data in scraped_results.items():
            for query in product_queries:
                # Filtrar productos por query
                query_products = [
                    p for p in data["products"] 
                    if query.lower() in p["name"].lower()
                ]
                
                if query_products:
                    # Formatear productos para el scraped service
                    formatted_products = [
                        {
                            "name": p["name"],
                            "price": p["price"],
                            "url": None,  # Los scrapers actuales no devuelven URL
                            "availability": p["price"] is not None and p["price"] > 0
                        }
                        for p in query_products
                    ]
                    
                    success = await scraped_client.bulk_replace_products(
                        data["store_name"], 
                        query, 
                        formatted_products
                    )
                    
                    if success:
                        total_sent += len(formatted_products)
                        print(f"✅ Enviados {len(formatted_products)} productos de {scraper_name} para query '{query}'")
                    else:
                        print(f"❌ Error enviando productos de {scraper_name} para query '{query}'")

        return {
            "status": "success",
            "scraped_products": sum(len(data["products"]) for data in scraped_results.values()),
            "products_sent": total_sent,
            "stores_processed": list(scraped_results.keys()),
            "queries_processed": product_queries
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error en el proceso de scraping: {str(e)}")

@app.get("/crawler/health")
async def health_check():
    """Health check del servicio."""
    return {"status": "healthy", "service": "crawler"}

@app.get("/crawler/test-connections")
async def test_connections():
    """Verificar conexión con otros servicios."""
    store_client = StoreClient()
    product_client = ProductClient()
    scraped_client = ScrapedClient()
    
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












