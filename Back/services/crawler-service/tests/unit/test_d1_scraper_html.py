from src.scrapers.d1 import _extract_products_from_html


def test_extract_products_from_d1_html_parses_name_price_and_sku():
    html_text = (
        'c4:T4b4,\\u003cbody\\u003e'
        '\\u003ch2\\u003eNombre del producto: Aceite Vegetal Imatá 3.000 mL\\u003c/h2\\u003e'
        '\\u003cbr\\u003e'
        '\\"sku\\":\\"12006707\\",\\"priceBeforeTaxes\\":13950,\\"__typename\\":\\"CatalogProductModel\\"'
    )

    products = _extract_products_from_html(html_text)

    assert products == [
        {
            "name": "Aceite Vegetal Imatá 3.000 mL",
            "price": 13950.0,
            "url": None,
            "id": "12006707",
        }
    ]