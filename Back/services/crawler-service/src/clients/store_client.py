# src/clients/store_client.py
import httpx
from typing import List, Dict

class StoreClient:
    def __init__(self, base_url: str = "http://stores-service:3001"):
        self.base_url = base_url
    
    async def get_all_stores(self) -> List[Dict]:
        """Obtiene todas las tiendas del stores-service"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.base_url}/stores")
                if response.status_code == 200:
                    return response.json()
                print(f"Error obteniendo tiendas: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error de conexión con stores-service: {e}")
            return []