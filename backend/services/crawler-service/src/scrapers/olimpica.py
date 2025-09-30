import httpx

BASE_URL = "https://www.olimpica.com/api/catalog_system/pub/products/search/"


async def scrape_olimpica(queries: list[str]) -> list[dict]:
    """Scrapea productos de Olímpica según las queries dadas."""
    products = []
    async with httpx.AsyncClient(timeout=20.0) as client:
        for query in queries:
            url = f"{BASE_URL}{query}"
            resp = await client.get(url)
            resp.raise_for_status()

            data = resp.json()
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



