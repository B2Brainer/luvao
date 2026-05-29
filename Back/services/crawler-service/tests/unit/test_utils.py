from src.scrapers.common import product_identity


def test_product_identity_prefers_stable_scraped_id():
    product = {
        "id": "12000083",
        "url": "https://example.com/arroz-premium",
        "name": "Arroz Premium",
    }

    assert product_identity(product) == "12000083"
