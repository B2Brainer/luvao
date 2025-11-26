import pytest
from src.utils import parse_price, normalize_name

@pytest.mark.parametrize(
    "raw,expected",
    [
        ("$4.500", 4500.0),
        ("4.500,00", 4500.0),
        ("4,500.00", 4500.0),
        ("$ 12.345,67", 12345.67),
        ("12", 12.0),
        ("", None),
        (None, None),
    ],
)
def test_parse_price_variants(raw, expected):
    assert parse_price(raw) == expected

def test_normalize_name():
    assert normalize_name("  ArRoZ   Roa  500g ") == "arroz roa 500g"