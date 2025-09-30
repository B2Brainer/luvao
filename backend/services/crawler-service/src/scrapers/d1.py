import httpx

BASE = "https://domicilios.tiendasd1.com"


async def scrape_d1(query: str, limit: int = 10):
    """
    Busca productos en D1 usando su API pública.
    query: término de búsqueda (ej: 'huevo')
    limit: cantidad máxima de productos a retornar
    """
    url = f"{BASE}/api/catalog_system/pub/products/search/{query}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()

    results = []
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
    return results


