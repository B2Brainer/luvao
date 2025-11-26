# src/clients/product_client.py
import httpx
from typing import List

class ProductClient:
    def __init__(self, base_url: str = "http://product-service:3002"):
        self.base_url = base_url
    
    async def get_product_names(self) -> List[str]:
        """Obtiene los nombres de productos del product-service"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.base_url}/products/names")
                if response.status_code == 200:
                    return response.json()
                print(f"Error obteniendo productos: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error de conexión con product-service: {e}")
            return []