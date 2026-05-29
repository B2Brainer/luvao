# src/clients/product_client.py
import httpx
import asyncio
from typing import List


MAX_RETRIES = 5
RETRY_BACKOFF_SECONDS = 1

class ProductClient:
    def __init__(self, base_url: str = "http://product-service:3002"):
        self.base_url = base_url
    
    async def get_product_names(self) -> List[str]:
        """Obtiene los productos de la canasta base desde product-service."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    response = await client.get(f"{self.base_url}/products/research/dane-basket")
                    if response.status_code == 200:
                        basket = response.json()
                        if isinstance(basket, list):
                            products = [
                                str(item.get("product", "")).strip()
                                for item in basket
                                if isinstance(item, dict) and str(item.get("product", "")).strip()
                            ]
                            if products:
                                return products

                    fallback = await client.get(f"{self.base_url}/products/names")
                    if fallback.status_code == 200:
                        names = fallback.json()
                        if isinstance(names, list):
                            return names
                    print(f"Error obteniendo productos: {response.status_code}")
                except Exception as e:
                    print(
                        f"Error de conexión con product-service, intento {attempt}/{MAX_RETRIES}: {e}"
                    )

                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

        return []
