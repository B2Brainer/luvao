# Back/services/crawler-service/src/scrapers/carulla.py
from src.scrapers.vtex import scrape_vtex_queries

BASE_URL = "https://www.carulla.com/io/api/catalog_system/pub/products/search/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/118.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


async def scrape_carulla(queries: list[str]) -> list[dict]:
    """Scrapea productos de Carulla según las queries dadas."""
    return await scrape_vtex_queries(BASE_URL, queries, headers=HEADERS)
