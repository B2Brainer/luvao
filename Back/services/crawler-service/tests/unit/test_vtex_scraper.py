import asyncio

from src.scrapers.vtex import _extract_price, scrape_vtex_queries


class FakeResponse:
    def __init__(self, data):
        self._data = data

    def raise_for_status(self):
        return None

    def json(self):
        return self._data


class FakeAsyncClient:
    def __init__(self, *args, pages=None, **kwargs):
        self.pages = pages or {}
        self.requests = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url, params=None):
        self.requests.append((url, params))
        offset = params["_from"]
        return FakeResponse(self.pages.get(offset, []))


def _make_item(product_id, name, url, seller_price):
    return {
        "productId": product_id,
        "productName": name,
        "link": url,
        "items": [
            {
                "sellers": [
                    {"commertialOffer": {}},
                    {"commertialOffer": {"Price": seller_price}},
                ]
            }
        ],
    }


def test_extract_price_uses_any_available_seller_price():
    item = {
        "items": [
            {"sellers": [{"commertialOffer": {}}]},
            {"sellers": [{"commertialOffer": {"Price": 12350}}]},
        ]
    }

    assert _extract_price(item) == 12350.0


def test_scrape_vtex_queries_pages_until_results_are_exhausted():
    pages = {
        0: [
            _make_item("1", "Aceite de Cocina Premium", "https://example.com/1", 18900),
            _make_item("2", "Vinagre Blanco", "https://example.com/2", 5400),
        ],
        20: [
            _make_item("3", "Aceite de Girasol", "https://example.com/3", 21000),
        ],
    }

    async def run():
        return await scrape_vtex_queries(
            "https://example.com/search/",
            ["aceite"],
            client_factory=lambda **kwargs: FakeAsyncClient(pages=pages, **kwargs),
        )

    products = asyncio.run(run())

    assert [product["name"] for product in products] == [
        "Aceite de Cocina Premium",
        "Aceite de Girasol",
    ]
    assert [product["price"] for product in products] == [18900.0, 21000.0]
    assert [product["url"] for product in products] == [
        "https://example.com/1",
        "https://example.com/3",
    ]
