from src.scrapers.d1 import _extract_price


def test_extract_price_parses_currency_text():
    assert _extract_price('Aceite vegetal $ 6.490') == 6490.0


def test_extract_price_returns_none_for_non_price_text():
    assert _extract_price('Sin precio visible') is None