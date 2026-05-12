from src.scrapers.common import is_relevant_for_query


def test_aceite_keeps_food_oils():
    assert is_relevant_for_query("aceite", "Aceite Vegetal Imatá 900 mL") is True
    assert is_relevant_for_query("aceite", "Aceite de oliva extra virgen") is True


def test_aceite_excludes_non_food_noise():
    assert is_relevant_for_query("aceite", "Atun en aceite de oliva") is False
    assert is_relevant_for_query("aceite", "Aceite de motor 20W50") is False


def test_huevos_excludes_kitchen_tools_and_toys():
    assert is_relevant_for_query("huevos", "Soporte para huevos cocidos") is False
    assert is_relevant_for_query("huevos", "Huevos de chocolate kinder") is False


def test_huevos_keeps_edible_products():
    assert is_relevant_for_query("huevos", "Huevos AA rojos x 12 und") is True
    assert is_relevant_for_query("huevos", "Huevo codorniz fresco x 24 unidades") is True
