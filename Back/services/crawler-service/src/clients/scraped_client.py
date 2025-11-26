# src/clients/scraped_client.py
import httpx
from typing import List, Dict, Any

class ScrapedClient:
    def __init__(self, base_url: str = "http://scraped-service:3005"):
        self.base_url = base_url
    
    async def bulk_replace_products(self, store_name: str, query: str, products: List[Dict]) -> bool:
        """Envía productos scrapeados al scraped-service"""
        try:
            payload = {
                "storeName": store_name,
                "query": query,
                "products": products
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/searched-products/bulk-replace", 
                    json=payload
                )
                
                if response.status_code == 200:
                    return True
                else:
                    print(f"Error enviando datos a scraped-service: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"Error de conexión con scraped-service: {e}")
            return False