import asyncio
from urllib.parse import quote

import httpx

from src.scrapers.common import build_product_record, dedupe_products, product_identity

DEFAULT_PAGE_SIZE = 10
DEFAULT_MAX_PAGES = 25
DEFAULT_TIMEOUT = 20.0
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 1


def _build_request(base_url: str, query: str, offset: int, page_size: int) -> tuple[str, dict[str, int]]:
    safe_query = quote(query.strip(), safe="")
    return f"{base_url}{safe_query}", {"_from": offset, "_to": offset + page_size - 1}


def _extract_price(item: dict) -> float:
    candidate_prices: list[float] = []

    for sku in item.get("items", []) or []:
        for seller in sku.get("sellers", []) or []:
            offer = seller.get("commertialOffer", {}) or {}

            for key in ("Price", "FullSellingPrice", "ListPrice", "PriceWithoutDiscount"):
                value = offer.get(key)
                if isinstance(value, (int, float)):
                    candidate_prices.append(float(value))
                    break

    positive_prices = [price for price in candidate_prices if price > 0]
    if positive_prices:
        return min(positive_prices)
    if candidate_prices:
        return candidate_prices[0]
    return 0.0


def _extract_product(item: dict) -> dict | None:
    name = (item.get("productName") or "").strip()
    if not name:
        return None

    url = (item.get("link") or "").strip() or None
    return build_product_record(name, _extract_price(item), url)


async def scrape_vtex_queries(
    base_url: str,
    queries: list[str],
    *,
    headers: dict[str, str] | None = None,
    client_factory=httpx.AsyncClient,
    page_size: int = DEFAULT_PAGE_SIZE,
    max_pages: int = DEFAULT_MAX_PAGES,
) -> list[dict]:
    products: list[dict] = []

    async with client_factory(timeout=DEFAULT_TIMEOUT, follow_redirects=True, headers=headers or {}) as client:
        for query in queries:
            seen_ids: set[str] = set()
            offset = 0

            for _ in range(max_pages):
                data = None

                for attempt in range(1, MAX_RETRIES + 1):
                    try:
                        url, params = _build_request(base_url, query, offset, page_size)
                        response = await client.get(url, params=params)
                        response.raise_for_status()
                        data = response.json()
                        break
                    except httpx.HTTPStatusError as exc:
                        print(
                            f"❌ Error HTTP {exc.response.status_code} en query={query}, intento {attempt}/{MAX_RETRIES}"
                        )
                    except Exception as exc:
                        print(f"❌ Error en query={query}, intento {attempt}/{MAX_RETRIES}: {exc}")

                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

                if not data or not isinstance(data, list):
                    break

                page_added = 0
                for item in data:
                    if not isinstance(item, dict):
                        continue

                    product = _extract_product(item)
                    if product is None:
                        continue

                    product_id = str(item.get("productId") or product_identity(product)).strip().lower()
                    if product_id in seen_ids:
                        continue

                    seen_ids.add(product_id)
                    products.append(product)
                    page_added += 1

                if page_added == 0:
                    break

                offset += page_size

    return dedupe_products(products)