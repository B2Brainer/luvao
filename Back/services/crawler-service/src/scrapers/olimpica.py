# Back/services/crawler-service/src/scrapers/olimpica.py
import httpx
import asyncio

BASE_URL = "https://www.olimpica.com/api/catalog_system/pub/products/search/"
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 1


async def scrape_olimpica(queries: list[str]) -> list[dict]:
    """Scrapea productos de Olímpica según las queries dadas."""
    products = []
    async with httpx.AsyncClient(timeout=20.0) as client:
        for query in queries:
            url = f"{BASE_URL}{query}"
            data = None

            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    resp = await client.get(url)
                    resp.raise_for_status()
                    data = resp.json()
                    break
                except httpx.HTTPStatusError as e:
                    print(
                        f"❌ Error HTTP {e.response.status_code} en Olímpica query={query}, intento {attempt}/{MAX_RETRIES}"
                    )
                except Exception as e:
                    print(f"❌ Error en Olímpica query={query}, intento {attempt}/{MAX_RETRIES}: {e}")

                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

            if data is None:
                continue

            for item in data:
                try:
                    name = item["productName"]
                    price = (
                        item.get("items", [])[0]
                        .get("sellers", [])[0]
                        .get("commertialOffer", {})
                        .get("Price", 0.0)
                    )
                    products.append({"name": name, "price": price})
                except Exception:
                    continue

    return products



