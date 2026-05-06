import asyncio
import re
from typing import Optional

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "https://domicilios.tiendasd1.com/search?name="
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 1
RATE_LIMIT_SECONDS = 1.2


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
    results = []
    driver = _build_driver()
    try:
        driver.get(f"{BASE_URL}{query}")

        # Espera a que aparezcan cards de producto
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'a[href^="/p/"]'))
        )

        links = driver.find_elements(By.CSS_SELECTOR, 'a[href^="/p/"]')
        for link in links:
            text = " ".join(link.text.split())
            href = link.get_attribute("href")
            if not text or not href:
                continue

            price = _extract_price(text)
            cleaned_name = re.sub(r"^\W+", "", text).strip()
            if cleaned_name:
                results.append(
                    {
                        "name": cleaned_name,
                        "price": price,
                        "url": href,
                    }
                )
    finally:
        driver.quit()

    return results


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
