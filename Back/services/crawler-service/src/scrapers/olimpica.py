# Back/services/crawler-service/src/scrapers/olimpica.py
from src.scrapers.vtex import scrape_vtex_queries

BASE_URL = "https://www.olimpica.com/api/catalog_system/pub/products/search/"


async def scrape_olimpica(queries: list[str]) -> list[dict]:
    """Scrapea productos de Olímpica según las queries dadas."""
    return await scrape_vtex_queries(BASE_URL, queries)



