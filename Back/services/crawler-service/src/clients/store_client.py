# src/clients/store_client.py
import httpx
import asyncio
from typing import List, Dict


MAX_RETRIES = 5
RETRY_BACKOFF_SECONDS = 1

class StoreClient:
    def __init__(self, base_url: str = "http://stores-service:3001"):
        self.base_url = base_url
    
    async def get_all_stores(self) -> List[Dict]:
        """Obtiene todas las tiendas del stores-service"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    response = await client.get(f"{self.base_url}/stores")
                    if response.status_code == 200:
                        return response.json()
                    print(f"Error obteniendo tiendas: {response.status_code}")
                except Exception as e:
                    print(
                        f"Error de conexión con stores-service, intento {attempt}/{MAX_RETRIES}: {e}"
                    )

                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS * attempt)

        return []