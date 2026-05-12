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
    return str(product.get("url") or product.get("name") or "").strip().lower()


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


_BASKET_QUERIES = {"arroz", "aceite", "leche", "huevos", "huevo", "azucar", "cafe"}

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

    if _has_non_food_signal(normalized_name):
        return False

    if query_norm in {"huevo", "huevos"}:
        if not ({"huevo", "huevos"} & name_tokens):
            return False
        if _EGG_EXCLUDE_TOKENS & name_tokens:
            return False
        return bool(_EGG_FOOD_SIGNALS & name_tokens)

    if query_norm == "aceite":
        if "aceite" not in name_tokens:
            return False
        if _OIL_EXCLUDE_TOKENS & name_tokens:
            return False
        if any(stem in normalized_name for stem in _OIL_NON_FOOD_STEMS):
            return False
        return True

    if query_norm == "arroz":
        return "arroz" in name_tokens

    if query_norm == "leche":
        if any(stem in normalized_name for stem in _MILK_EXCLUDE_STEMS):
            return False
        if any(stem in normalized_name for stem in _MILK_KEEP_STEMS):
            return True
        return "leche" in name_tokens

    if query_norm == "azucar":
        if any(stem in normalized_name for stem in _SUGAR_EXCLUDE_STEMS):
            return False
        return "azucar" in name_tokens

    if query_norm == "cafe":
        if any(stem in normalized_name for stem in _COFFEE_EXCLUDE_STEMS):
            return False
        return "cafe" in name_tokens

    query_tokens = text_tokens(query_norm)
    return bool(query_tokens & name_tokens)
