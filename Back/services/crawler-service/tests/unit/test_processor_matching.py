from src.processor import _matches_query


def test_processor_matching_uses_scraper_relevance_rules():
    assert _matches_query("Café Sello Rojo Tradicional 250 G", "cafe") is True
    assert _matches_query("Azúcar Blanca 1000 g", "azucar") is True
    assert _matches_query("Huevo Tipo A Sol Naciente 30 Und", "huevos") is True


def test_processor_matching_rejects_irrelevant_scraped_results():
    assert _matches_query("Mango Azúcar", "azucar") is False
    assert _matches_query("Galleta Café Quindío Cafecitas con Café 280 G", "cafe") is False
