import asyncio

import src.scrapers.exito as exito_module


def test_scrape_exito_uses_vtex_catalog_endpoint_with_headers(monkeypatch):
	calls = []

	async def fake_scrape_vtex_queries(base_url, queries, **kwargs):
		calls.append((base_url, queries, kwargs))
		return []

	monkeypatch.setattr(exito_module, "scrape_vtex_queries", fake_scrape_vtex_queries)

	asyncio.run(exito_module.scrape_exito(["aceite"]))

	assert calls == [
		(
			"https://www.exito.com/io/api/catalog_system/pub/products/search/",
			["aceite"],
			{"headers": exito_module.HEADERS},
		)
	]
