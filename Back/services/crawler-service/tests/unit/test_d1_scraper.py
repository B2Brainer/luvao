from src.scrapers.d1 import (
    _extract_price,
    _extract_product_name_from_card_text,
    _extract_product_name_from_url,
    _extract_sku_from_url,
)


def test_extract_price_parses_currency_text():
    assert _extract_price('Aceite vegetal $ 6.490') == 6490.0


def test_extract_price_returns_none_for_non_price_text():
    assert _extract_price('Sin precio visible') is None


def test_extracts_sku_and_clean_name_from_d1_product_url():
    url = 'https://domicilios.tiendasd1.com/p/arroz-premium-albar-1000-grs-12000083'

    assert _extract_sku_from_url(url) == '12000083'
    assert _extract_product_name_from_url(url) == 'Arroz Premium Albar 1000 Grs'


def test_extract_product_name_from_card_prefers_clean_url_slug():
    text = '3.490 ARROZ PREMIUM ALBAR 1000 GRS 1000 g (g a $ 3,49)'
    href = 'https://domicilios.tiendasd1.com/p/arroz-premium-albar-1000-grs-12000083'

    assert _extract_product_name_from_card_text(text, href) == 'Arroz Premium Albar 1000 Grs'
