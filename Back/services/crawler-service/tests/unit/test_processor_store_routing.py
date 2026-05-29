import asyncio

import src.processor as processor_module


def test_process_refresh_routes_supported_store_names_and_accents(monkeypatch):
    scrape_calls = []
    sent_payloads = []

    async def fake_get_product_names(self):
        return ["arroz"]

    async def fake_get_all_stores(self):
        return [
            {"name": "Olímpica"},
            {"name": "Éxito"},
            {"name": "Carulla"},
            {"name": "Tiendas D1"},
        ]

    def scraper_result(store_name):
        async def fake_scraper(queries):
            scrape_calls.append((store_name, queries))
            return [
                {
                    "name": f"Arroz {store_name} 500 g",
                    "price": 5000,
                    "url": f"https://example.com/{store_name}",
                }
            ]

        return fake_scraper

    async def fake_bulk_replace_products(self, store_name, query, products):
        sent_payloads.append((store_name, query, products))
        return True

    monkeypatch.setattr(processor_module.ProductClient, "get_product_names", fake_get_product_names)
    monkeypatch.setattr(processor_module.StoreClient, "get_all_stores", fake_get_all_stores)
    monkeypatch.setattr(processor_module.ScrapedClient, "bulk_replace_products", fake_bulk_replace_products)
    monkeypatch.setattr(processor_module, "scrape_olimpica", scraper_result("olimpica"))
    monkeypatch.setattr(processor_module, "scrape_exito", scraper_result("exito"))
    monkeypatch.setattr(processor_module, "scrape_carulla", scraper_result("carulla"))
    monkeypatch.setattr(processor_module, "scrape_d1", scraper_result("d1"))

    result = asyncio.run(processor_module.process_refresh())

    assert set(result["stores_processed"]) == {"olimpica", "exito", "carulla", "d1"}
    assert set(scraper_call[0] for scraper_call in scrape_calls) == {"olimpica", "exito", "carulla", "d1"}
    assert set(payload[0] for payload in sent_payloads) == {"Olímpica", "Éxito", "Carulla", "Tiendas D1"}
