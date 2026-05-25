import asyncio

import src.scrapers.carulla as carulla_module


def test_scrape_carulla_uses_vtex_catalog_endpoint_with_headers(monkeypatch):
    calls = []

    async def fake_scrape_vtex_queries(base_url, queries, **kwargs):
        calls.append((base_url, queries, kwargs))
        return []

    monkeypatch.setattr(carulla_module, "scrape_vtex_queries", fake_scrape_vtex_queries)

    asyncio.run(carulla_module.scrape_carulla(["arroz", "aceite"]))

    assert calls == [
        (
            "https://www.carulla.com/io/api/catalog_system/pub/products/search/",
            ["arroz", "aceite"],
            {"headers": carulla_module.HEADERS},
        )
    ]
