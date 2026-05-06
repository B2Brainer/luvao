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
        """Obtiene los nombres de productos del product-service"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    response = await client.get(f"{self.base_url}/products/names")
                    if response.status_code == 200:
                        return response.json()
                    print(f"Error obteniendo productos: {response.status_code}")
                except Exception as e:
                    print(
                        f"Error de conexión con product-service, intento {attempt}/{MAX_RETRIES}: {e}"
                    )

                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

        return []