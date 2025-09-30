import re
from typing import Optional

def parse_price(text: str) -> Optional[float]:
    """Intenta extraer un número float desde un string de precio.
    Maneja formatos como: $4.500, 4.500, 4,500.00, $ 4.500,00 etc.
    """
    if not text:
        return None
    # eliminar signos y letras no numéricas excepto . y ,
    t = text.strip()
    # si hay comas como separador decimal junto a puntos de miles, normalizamos:
    # Primero, quitar cualquier espacio y símbolos de moneda
    t = re.sub(r"[^\d,\.]", "", t)

    # Si hay both '.' and ',' decide cuál es decimal:
    if ',' in t and '.' in t:
        # si el último separador es ',' asumimos decimal con coma (ej 1.234,56)
        if t.rfind(',') > t.rfind('.'):
            t = t.replace('.', '').replace(',', '.')
        else:
            t = t.replace(',', '')
    else:
        # si sólo hay comas, tratarlas como decimales
        if ',' in t and '.' not in t:
            t = t.replace(',', '.')
    try:
        return float(t)
    except Exception:
        return None


def normalize_name(name: str) -> str:
    """Nombre normalizado (minúsculas y trimmed) para comparaciones sencillas."""
    if not name:
        return ""
    return " ".join(name.strip().lower().split())
