import asyncio

import src.scrapers.olimpica as olimpica_module


def test_scrape_olimpica_uses_vtex_catalog_endpoint(monkeypatch):
	calls = []

	async def fake_scrape_vtex_queries(base_url, queries, **kwargs):
		calls.append((base_url, queries, kwargs))
		return []

	monkeypatch.setattr(olimpica_module, "scrape_vtex_queries", fake_scrape_vtex_queries)

	asyncio.run(olimpica_module.scrape_olimpica(["aceite", "arroz"]))

	assert calls == [
		(
			"https://www.olimpica.com/api/catalog_system/pub/products/search/",
			["aceite", "arroz"],
			{},
		)
	]
