import httpx

# ✅ Nueva URL base con /io/
BASE_URL = "https://www.exito.com/io/api/catalog_system/pub/products/search/"

async def scrape_exito(queries: list[str]) -> list[dict]:
    """Scrapea productos de Éxito según las queries dadas."""
    products = []
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/118.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=headers) as client:
        for query in queries:
            url = f"{BASE_URL}{query}"
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()

                for item in data:
                    try:
                        name = item.get("productName", "").strip()
                        price = (
                            item.get("items", [])[0]
                            .get("sellers", [])[0]
                            .get("commertialOffer", {})
                            .get("Price", 0.0)
                        )
                        if name:
                            products.append({"name": name, "price": price})
                    except Exception:
                        continue

            except httpx.HTTPStatusError as e:
                print(f"❌ Error HTTP {e.response.status_code} al scrapear Éxito con query={query}: {e}")
            except Exception as e:
                print(f"❌ Error al scrapear Éxito con query={query}: {e}")

    return products

