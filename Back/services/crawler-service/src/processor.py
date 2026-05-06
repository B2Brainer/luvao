from fastapi import HTTPException

from src.clients.product_client import ProductClient
from src.clients.scraped_client import ScrapedClient
from src.clients.store_client import StoreClient
from src.scrapers.d1 import scrape_d1
from src.scrapers.exito import scrape_exito
from src.scrapers.olimpica import scrape_olimpica
from src.utils import normalize_name


def _matches_query(product_name: str, query: str) -> bool:
    normalized_name = normalize_name(product_name)
    normalized_query = normalize_name(query)

    if not normalized_name or not normalized_query:
        return False

    query_tokens = [token for token in normalized_query.split(" ") if token]
    return all(token in normalized_name for token in query_tokens)


async def process_refresh() -> dict:
    store_client = StoreClient()
    product_client = ProductClient()
    scraped_client = ScrapedClient()

    product_queries = await product_client.get_product_names()
    stores_data = await store_client.get_all_stores()

    if not product_queries:
        raise HTTPException(500, "No se pudieron obtener los productos")
    if not stores_data:
        raise HTTPException(500, "No se pudieron obtener las tiendas")

    store_scraper_mapping = {}
    for store in stores_data:
        store_name_lower = store["name"].lower()
        if "olimpica" in store_name_lower:
            store_scraper_mapping["olimpica"] = store["name"]
        elif "exito" in store_name_lower:
            store_scraper_mapping["exito"] = store["name"]
        elif store_name_lower in {"d1", "tiendas d1", "tienda d1"} or "d1" in store_name_lower:
            store_scraper_mapping["d1"] = store["name"]

    scraped_results = {}

    if "olimpica" in store_scraper_mapping:
        print("Scrapeando Olímpica...")
        olimpica_products = await scrape_olimpica(product_queries)
        scraped_results["olimpica"] = {
            "store_name": store_scraper_mapping["olimpica"],
            "products": olimpica_products,
        }
        print(f"✅ Olímpica: {len(olimpica_products)} productos scrapeados")

    if "exito" in store_scraper_mapping:
        print("Scrapeando Éxito...")
        exito_products = await scrape_exito(product_queries)
        scraped_results["exito"] = {
            "store_name": store_scraper_mapping["exito"],
            "products": exito_products,
        }
        print(f"✅ Éxito: {len(exito_products)} productos scrapeados")

    if "d1" in store_scraper_mapping:
        print("Scrapeando D1...")
        d1_products = await scrape_d1(product_queries)
        scraped_results["d1"] = {
            "store_name": store_scraper_mapping["d1"],
            "products": d1_products,
        }
        print(f"✅ D1: {len(d1_products)} productos scrapeados")

    total_sent = 0
    for scraper_name, data in scraped_results.items():
        for query in product_queries:
            query_products = [p for p in data["products"] if _matches_query(p["name"], query)]

            if not query_products:
                continue

            formatted_products = [
                {
                    "name": p["name"],
                    "price": p.get("price"),
                    "url": p.get("url"),
                    "availability": p.get("price") is not None and p.get("price", 0) > 0,
                }
                for p in query_products
            ]

            success = await scraped_client.bulk_replace_products(
                data["store_name"],
                query,
                formatted_products,
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
        "queries_processed": product_queries,
    }
