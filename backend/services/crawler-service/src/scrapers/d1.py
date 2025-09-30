import httpx

BASE = "https://domicilios.tiendasd1.com"


async def scrape_d1(queries, limit: int = 10):
    """
    Busca productos en D1 usando su API pública.
    queries: lista de términos de búsqueda (ej: ['huevo', 'arroz'])
    limit: cantidad máxima de productos a retornar por query
    """
    results = []
    async with httpx.AsyncClient() as client:
        for query in queries:
            url = f"{BASE}/api/catalog_system/pub/products/search/{query}"
            try:
                resp = await client.get(url, timeout=30.0)
                resp.raise_for_status()

                if "application/json" not in resp.headers.get("content-type", ""):
                    print(f"⚠️ D1 devolvió HTML en lugar de JSON para query={query}")
                    continue

                data = resp.json()

                for item in data[:limit]:
                    try:
                        name = item.get("productName")
                        price = item["items"][0]["sellers"][0]["commertialOffer"]["Price"]
                        link = f"{BASE}/{item['linkText']}/p"
                        results.append({
                            "name": name,
                            "price": float(price),
                            "url": link,
                            "source": "d1",
                        })
                    except Exception:
                        continue
            except Exception as e:
                print(f"❌ Error al scrapear D1 con query={query}: {e}")
                continue

    return results



