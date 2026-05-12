import asyncio
import re
from typing import Optional
from urllib.parse import quote

import httpx
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from src.scrapers.common import (
    build_product_record,
    dedupe_products,
    is_relevant_for_query,
    product_identity,
)

BASE_URL = "https://domicilios.tiendasd1.com/search?name="
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 1
RATE_LIMIT_SECONDS = 1.2
SEARCH_TIMEOUT_SECONDS = 20.0


def _fetch_query_html(query: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    with httpx.Client(timeout=SEARCH_TIMEOUT_SECONDS, follow_redirects=True, headers=headers) as client:
        response = client.get(f"{BASE_URL}{quote(query)}")
        response.raise_for_status()
        return response.text


def _extract_products_from_html(html_text: str, query: str | None = None) -> list[dict]:
    products: list[dict] = []
    pattern = re.compile(
        r'([a-z0-9]+):T[0-9a-z]+,\\u003cbody\\u003e(.*?)\\"__typename\\":\\"CatalogProductModel\\"',
        re.S,
    )

    for _, raw_block in pattern.findall(html_text):
        block = (
            raw_block.replace("\\u003c", "<")
            .replace("\\u003e", ">")
            .replace("\\u0026", "&")
            .replace("\\/", "/")
            .replace("\\\"", '"')
            .replace("\\n", "\n")
        )
        product_name = _extract_product_name(block)
        price_match = re.search(r'"priceBeforeTaxes":([0-9]+)', block)
        sku_match = re.search(r'"sku":"([^"]+)"', block)

        if not product_name:
            continue

        if query and not is_relevant_for_query(query, product_name):
            continue

        product = build_product_record(
            product_name,
            float(price_match.group(1)) if price_match else None,
            None,
        )
        if product is None:
            continue

        if sku_match:
            product["id"] = sku_match.group(1)
        products.append(product)

    return dedupe_products(products)


def _extract_product_name(block: str) -> str | None:
    named_heading = re.search(r"Nombre del producto:\s*(.*?)</h2>", block, re.S)
    if named_heading:
        return _sanitize_product_name(named_heading.group(1))

    generic_heading = re.search(r"<h2>(.*?)</h2>", block, re.S)
    if generic_heading:
        return _sanitize_product_name(generic_heading.group(1))

    return None


def _sanitize_product_name(name: str) -> str:
    cleaned = re.sub(r'\"]\)\s*</script>.*$', '', name, flags=re.S)
    cleaned = re.sub(r'^Nombre del Producto:\s*', '', cleaned, flags=re.I)
    cleaned = re.sub(r'^Nombre del producto:\s*', '', cleaned, flags=re.I)
    return " ".join(cleaned.split()).strip()


def _extract_price(text: str) -> Optional[float]:
    # Busca precios estilo "$ 6.490" en el texto de la tarjeta
    match = re.search(r"\$\s*([\d\.]+)", text)
    if not match:
        return None
    raw = match.group(1).replace(".", "")
    try:
        return float(raw)
    except ValueError:
        return None


def _build_driver() -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )

    service = Service(executable_path="/usr/bin/chromedriver")
    return webdriver.Chrome(service=service, options=options)


def _scrape_query_sync(query: str) -> list[dict]:
    try:
        html_text = _fetch_query_html(query)
        products = _extract_products_from_html(html_text, query=query)
        if products:
            return products
    except Exception:
        pass

    results = []
    seen_ids: set[str] = set()
    driver = _build_driver()
    try:
        driver.get(f"{BASE_URL}{query}")

        # Espera a que aparezcan cards de producto
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'a[href^="/p/"]'))
        )

        for link in driver.find_elements(By.CSS_SELECTOR, 'a[href^="/p/"]'):
            text = " ".join(link.text.split())
            href = link.get_attribute("href")
            if not text:
                continue

            cleaned_name = re.sub(r"^\W+", "", text).strip()
            if cleaned_name and not is_relevant_for_query(query, cleaned_name):
                continue

            price = _extract_price(text)
            if cleaned_name:
                product = build_product_record(cleaned_name, price, href)
                if product is None:
                    continue

                product_id = product_identity(product)
                if product_id in seen_ids:
                    continue

                seen_ids.add(product_id)
                results.append(product)
    finally:
        driver.quit()

    return dedupe_products(results)


async def scrape_d1(queries: list[str]) -> list[dict]:
    """Scrapea productos de D1 usando navegador headless para contenido dinámico."""
    products = []

    for query in queries:
        query_products: list[dict] = []

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                query_products = await asyncio.to_thread(_scrape_query_sync, query)
                break
            except Exception as e:
                print(f"❌ Error en D1 query={query}, intento {attempt}/{MAX_RETRIES}: {e}")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

        products.extend(query_products)
        await asyncio.sleep(RATE_LIMIT_SECONDS)

    return products
