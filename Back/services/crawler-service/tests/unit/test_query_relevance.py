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


def test_basket_queries_handle_accents_and_singular_plural():
    assert is_relevant_for_query("cafe", "Café Sello Rojo Tradicional 250 G") is True
    assert is_relevant_for_query("azucar", "Azúcar Blanca 1000 g") is True
    assert is_relevant_for_query("huevos", "Huevo Tipo A Sol Naciente 30 Und") is True


def test_basket_queries_exclude_common_search_noise():
    assert is_relevant_for_query("azucar", "Mango Azúcar") is False
    assert is_relevant_for_query("azucar", "Bebida de Almendra Sin Azúcar 1000 mL") is False
    assert is_relevant_for_query("azucar", "Pan Multigranos Natri 0 Azúcar 450g") is False
    assert is_relevant_for_query("leche", "Caramelos sabores a mora leche fresa leche") is False
    assert is_relevant_for_query("leche", "Chocolate Milka Leche 80 G") is False
    assert is_relevant_for_query("leche", "Flan de Leche 200 G") is False
    assert is_relevant_for_query("leche", "Leche Condensada Doypack Latti 300 Grs") is False
    assert is_relevant_for_query("leche", "Pan Olimpica Tajado Leche 550 G") is False
    assert is_relevant_for_query("leche", "Avena Alpina con Leche Deslactosada 250 G") is False
    assert is_relevant_for_query("cafe", "Galleta Café Quindío Cafecitas con Café 280 G") is False


def test_arroz_keeps_basic_rice_and_rejects_snacks_or_desserts():
    assert is_relevant_for_query("arroz", "Arroz Premium Albar 1000 Grs") is True
    assert is_relevant_for_query("arroz", "Arroz Achocolatado Fiocco 320g") is False
    assert is_relevant_for_query("arroz", "Galletas de arroz integral") is False
    assert is_relevant_for_query("pan", "Harina de Maíz Blanca Pan 800 G") is False
    assert is_relevant_for_query("pan", "Pastas PAN spaghetti 500 gr") is False
    assert is_relevant_for_query("pan", "Mezcla de maíz dulce PAN arepa de choclo") is False


def test_new_basic_basket_queries_keep_expected_products():
    assert is_relevant_for_query("harina de trigo", "Harina de Trigo Haz de Oros 1000 g") is True
    assert is_relevant_for_query("harina de maiz", "Harina de Maíz Doñarepa 1000 g") is True
    assert is_relevant_for_query("galletas de sal", "Galletas Saltin Noel Tradicional 300 g") is True
    assert is_relevant_for_query("cebolla larga", "Cebolla Larga x 500 g") is True
    assert is_relevant_for_query("tomate de arbol", "Tomate de Árbol x kg") is True
    assert is_relevant_for_query("queso campesino", "Queso Campesino 500 g") is True


def test_new_basic_basket_queries_reject_common_noise():
    assert is_relevant_for_query("tomate", "Salsa de Tomate Fruco 400 g") is False
    assert is_relevant_for_query("tomate", "Tomate de Árbol x kg") is False
    assert is_relevant_for_query("pasta", "Pasta Dental Colgate 75 ml") is False
    assert is_relevant_for_query("mantequilla", "Mantequilla de Maní 500 g") is False
    assert is_relevant_for_query("pollo", "Caldo de Gallina Sabor Pollo") is False
    assert is_relevant_for_query("mora", "Té sabor mora 20 sobres") is False
    assert is_relevant_for_query("mora", "TÉ SUNTEA MORA 2L 12G") is False
    assert is_relevant_for_query("mora", "Avena Hojuelas Arándanos Fresas Mora 250 gr") is False
    assert is_relevant_for_query("mora", "Yagur Colanta Mora 900 G") is False
    assert is_relevant_for_query("mora", "Yogo Yogo Alpina Mora 1000 G") is False
    assert is_relevant_for_query("mora", "Refresco Hit Mora Pet 1500 ml") is False
    assert is_relevant_for_query("mora", "REFRESC CALIFORNIA FRESKY MORA TB 900ML") is False
    assert is_relevant_for_query("mora", "Juego De Platos Mora Cerámica 6 Unidades") is False
    assert is_relevant_for_query("mora", "JAB LIQ SUPPRA CARE MORA GARDE D/PACK 1L") is False
    assert is_relevant_for_query("mora", "Mora fresca x kg") is True
