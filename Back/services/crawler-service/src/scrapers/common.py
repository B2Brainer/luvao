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