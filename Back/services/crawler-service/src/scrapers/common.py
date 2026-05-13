import re
from unicodedata import normalize


def build_product_record(name: str, price: float | int | None = None, url: str | None = None) -> dict | None:
    cleaned_name = " ".join((name or "").split()).strip()
    if not cleaned_name:
        return None

    cleaned_url = (url or "").strip() or None
    cleaned_price = float(price) if isinstance(price, (int, float)) else price
    return {
        "name": cleaned_name,
        "price": cleaned_price,
        "url": cleaned_url,
    }


def product_identity(product: dict) -> str:
    return str(product.get("id") or product.get("url") or product.get("name") or "").strip().lower()


def dedupe_products(products: list[dict]) -> list[dict]:
    seen: set[str] = set()
    unique_products: list[dict] = []

    for product in products:
        identity = product_identity(product)
        if not identity or identity in seen:
            continue

        seen.add(identity)
        unique_products.append(product)

    return unique_products


def normalize_text(value: str) -> str:
    normalized = normalize("NFD", value.lower())
    without_marks = "".join(char for char in normalized if ord(char) < 128)
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", " ", without_marks)).strip()


def text_tokens(value: str) -> set[str]:
    normalized = normalize_text(value)
    if not normalized:
        return set()
    return {token for token in normalized.split(" ") if token}


_BASKET_QUERIES = {
    "arroz",
    "pasta",
    "harina de trigo",
    "harina de maiz",
    "pan",
    "galletas de sal",
    "avena",
    "papa",
    "yuca",
    "platano verde",
    "frijol",
    "lentejas",
    "arveja seca",
    "tomate",
    "cebolla cabezona",
    "cebolla larga",
    "zanahoria",
    "habichuela",
    "banano",
    "naranja",
    "limon",
    "guayaba",
    "mora",
    "maracuya",
    "tomate de arbol",
    "carne de res",
    "carne de cerdo",
    "pollo",
    "pescado",
    "huevos",
    "huevo",
    "leche",
    "queso campesino",
    "aceite vegetal",
    "aceite",
    "margarina",
    "mantequilla",
    "azucar",
    "panela",
    "sal",
    "cafe",
}

_GENERIC_NON_FOOD_STEMS = [
    "organizador",
    "dispensador",
    "rociador",
    "spray",
    "freidora",
    "hervidor",
    "cocedor",
    "batidor",
    "batidora",
    "espumador",
    "extractor",
    "maquina",
    "juguet",
    "didactic",
    "decorativ",
    "bloqueador",
    "serun",
    "corporal",
    "capilar",
    "usb",
    "llanta",
    "cafetera",
    "glucometro",
    "soporte",
    "molde",
    "sarten",
    "olla",
    "recolectora",
    "pascua",
    "caramelo",
    "chocolat",
    "galleta",
    "mango",
    "aguardiente",
    "bebida",
    "gaseosa",
    "refresco",
]

_OIL_EXCLUDE_TOKENS = {
    "atun",
    "motor",
    "motocicleta",
    "moto",
    "automotriz",
    "lubricante",
    "lubricantes",
    "transmision",
    "diesel",
    "gasolina",
    "filtro",
    "hidraulico",
    "masajes",
    "esencial",
    "2t",
    "husqvarna",
}


_OIL_NON_FOOD_STEMS = [
    "limpiador",
    "facial",
    "hidrat",
    "pore",
    "skin",
    "ginseng",
    "beauty",
    "masaje",
    "masajes",
    "capilar",
    "bronceador",
    "aditivo",
    "automotr",
    "lubric",
    "little angels",
    "bebe",
    "baby",
]

_MILK_KEEP_STEMS = [
    "leche entera",
    "leche semidescremada",
    "leche descremada",
    "leche deslactosada",
    "leche uht",
    "leche larga vida",
    "leche en polvo",
    "leche evaporada",
]

_MILK_EXCLUDE_STEMS = [
    "crema de leche",
    "dulce de leche",
    "leche asada",
    "leche condensada",
    "leche de coco",
    "leche coco",
    "sabor a leche",
    "fresa leche",
    "mora leche",
    "chocolate",
    "choc",
    "chocolatina",
    "galleta",
    "caramelo",
    "flan",
    "cortadito",
    "postre",
]

_SUGAR_EXCLUDE_STEMS = [
    "sin azucar",
    "0 azucar",
    "mango",
    "aguardiente",
    "bebida",
    "galleta",
    "caramelo",
    "palito",
    "pan ",
    "endulzado",
]

_COFFEE_EXCLUDE_STEMS = [
    "galleta",
    "cafecitas",
    "dulce",
    "chocolate",
    "sabor cafe",
    "licor",
]

_EGG_FOOD_SIGNALS = {
    "und",
    "unidad",
    "unidades",
    "docena",
    "rojo",
    "blanco",
    "codorniz",
    "organico",
    "campesino",
    "aa",
    "a",
}

_EGG_EXCLUDE_TOKENS = {
    "kinder",
    "chocolate",
    "hatchimals",
    "shaker",
}


def _has_non_food_signal(normalized_name: str) -> bool:
    return any(stem in normalized_name for stem in _GENERIC_NON_FOOD_STEMS)


def _has_any(tokens: set[str], candidates: set[str]) -> bool:
    return bool(tokens & candidates)


def _has_all(tokens: set[str], required: set[str]) -> bool:
    return required.issubset(tokens)


def _has_stem(normalized_name: str, stems: list[str]) -> bool:
    return any(stem in normalized_name for stem in stems)


def _is_simple_token_query(query_norm: str, name_tokens: set[str], excluded_stems: list[str] | None = None) -> bool:
    if query_norm not in name_tokens:
        return False
    return not _has_stem(" ".join(name_tokens), excluded_stems or [])


def is_relevant_for_query(query: str, product_name: str) -> bool:
    query_norm = normalize_text(query)
    normalized_name = normalize_text(product_name)
    name_tokens = text_tokens(product_name)

    if not query_norm:
        return True

    if query_norm not in _BASKET_QUERIES:
        query_tokens = text_tokens(query_norm)
        return bool(query_tokens & name_tokens)

    if not normalized_name:
        return False

    if query_norm == "arroz":
        return (
            "arroz" in name_tokens
            and not _has_stem(normalized_name, ["galleta", "achocolat", "arroz con leche", "bebida", "sabor"])
        )

    if query_norm == "pasta":
        return (
            _has_any(name_tokens, {"pasta", "fideo", "fideos", "espagueti", "spaghetti", "macarron", "macarrones"})
            and not _has_stem(normalized_name, ["pasta dental", "pasta de tomate", "salsa", "crema"])
        )

    if query_norm == "harina de trigo":
        return _has_all(name_tokens, {"harina", "trigo"})

    if query_norm == "harina de maiz":
        return _has_all(name_tokens, {"harina", "maiz"})

    if query_norm == "pan":
        return "pan" in name_tokens and not _has_stem(normalized_name, ["panela", "apanado", "molde"])

    if query_norm == "galletas de sal":
        return (
            (
                _has_any(name_tokens, {"galleta", "galletas", "saltin", "saltinas", "cracker", "crackers"})
                or _has_stem(normalized_name, ["salada", "saltin"])
            )
            and not _has_stem(normalized_name, ["dulce", "chocolate", "wafer", "rellena", "crema"])
        )

    if query_norm == "avena":
        return "avena" in name_tokens and not _has_stem(normalized_name, ["bebida", "galleta", "barra"])

    if query_norm == "papa":
        return "papa" in name_tokens and not _has_stem(normalized_name, ["frita", "chips", "fosforo", "margarita"])

    if query_norm == "yuca":
        return "yuca" in name_tokens and not _has_stem(normalized_name, ["frita", "chips"])

    if query_norm == "platano verde":
        return (
            "platano" in name_tokens
            and (_has_any(name_tokens, {"verde", "verdes", "harton"}) or "maduro" not in name_tokens)
            and not _has_stem(normalized_name, ["chips", "maduro", "tajada"])
        )

    if query_norm == "frijol":
        return _has_any(name_tokens, {"frijol", "frijoles"}) and not _has_stem(normalized_name, ["salsa", "enlat"])

    if query_norm == "lentejas":
        return _has_any(name_tokens, {"lenteja", "lentejas"}) and not _has_stem(normalized_name, ["sopa", "enlat"])

    if query_norm == "arveja seca":
        return (
            "arveja" in name_tokens
            and not _has_stem(normalized_name, ["congelada", "enlatada", "sopa"])
        )

    if query_norm == "tomate":
        return (
            "tomate" in name_tokens
            and "arbol" not in name_tokens
            and not _has_stem(normalized_name, ["salsa", "pasta", "pure", "ketchup", "jugo"])
        )

    if query_norm == "cebolla cabezona":
        return (
            "cebolla" in name_tokens
            and (_has_any(name_tokens, {"cabezona", "blanca", "roja"}) or "larga" not in name_tokens)
            and "larga" not in name_tokens
        )

    if query_norm == "cebolla larga":
        return "cebolla" in name_tokens and "larga" in name_tokens

    if query_norm in {"zanahoria", "habichuela", "banano", "naranja", "guayaba", "maracuya", "panela", "sal"}:
        return query_norm in name_tokens and not _has_stem(normalized_name, ["bebida", "jugo", "galleta", "dulce"])

    if query_norm == "limon":
        return "limon" in name_tokens and not _has_stem(normalized_name, ["bebida", "jugo", "galleta", "limonada"])

    if query_norm == "mora":
        return "mora" in name_tokens and not _has_stem(normalized_name, ["bebida", "jugo", "galleta", "mermelada", "caramelo"])

    if query_norm == "tomate de arbol":
        return _has_all(name_tokens, {"tomate", "arbol"}) and not _has_stem(normalized_name, ["jugo", "bebida"])

    if query_norm == "carne de res":
        return _has_all(name_tokens, {"carne", "res"}) and not _has_stem(normalized_name, ["perro", "gato", "sabor"])

    if query_norm == "carne de cerdo":
        return _has_all(name_tokens, {"carne", "cerdo"}) and not _has_stem(normalized_name, ["perro", "gato", "sabor"])

    if query_norm == "pollo":
        return "pollo" in name_tokens and not _has_stem(normalized_name, ["caldo", "consome", "sabor", "sazonador", "croqueta"])

    if query_norm == "pescado":
        return (
            _has_any(name_tokens, {"pescado", "tilapia", "trucha", "mojarra", "filete"})
            and not _has_stem(normalized_name, ["atun", "sardina", "caldo", "sabor"])
        )

    if query_norm in {"huevo", "huevos"}:
        if not ({"huevo", "huevos"} & name_tokens):
            return False
        if _EGG_EXCLUDE_TOKENS & name_tokens:
            return False
        return bool(_EGG_FOOD_SIGNALS & name_tokens)

    if query_norm in {"aceite", "aceite vegetal"}:
        if "aceite" not in name_tokens:
            return False
        if _OIL_EXCLUDE_TOKENS & name_tokens:
            return False
        if any(stem in normalized_name for stem in _OIL_NON_FOOD_STEMS):
            return False
        return True

    if query_norm == "leche":
        if any(stem in normalized_name for stem in _MILK_EXCLUDE_STEMS):
            return False
        if any(stem in normalized_name for stem in _MILK_KEEP_STEMS):
            return True
        return "leche" in name_tokens

    if query_norm == "queso campesino":
        return _has_all(name_tokens, {"queso", "campesino"}) and not _has_stem(normalized_name, ["sabor", "snack"])

    if query_norm == "margarina":
        return "margarina" in name_tokens

    if query_norm == "mantequilla":
        return "mantequilla" in name_tokens and not _has_stem(normalized_name, ["mani", "cacahuate", "cacao"])

    if query_norm == "azucar":
        if any(stem in normalized_name for stem in _SUGAR_EXCLUDE_STEMS):
            return False
        return "azucar" in name_tokens

    if query_norm == "cafe":
        if any(stem in normalized_name for stem in _COFFEE_EXCLUDE_STEMS):
            return False
        return "cafe" in name_tokens

    if _has_non_food_signal(normalized_name):
        return False

    query_tokens = text_tokens(query_norm)
    return bool(query_tokens & name_tokens)
