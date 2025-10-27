from fastapi import FastAPI
from src.infrastructure.db import db
from src.scrapers.olimpica import scrape_olimpica
from src.scrapers.exito import scrape_exito


app = FastAPI(title="Crawler Service")


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.post("/crawler/refresh")
async def refresh_data():
    # Palabras clave iniciales
    queries = ["arroz", "huevo", "aceite"]

    summary = {
        "olimpica": {"new": 0, "updated": 0},
        "exito": {"new": 0, "updated": 0},
    }

    # === Scraping Olímpica ===
    olimpica_store = await db.client.store.upsert(
        where={"name": "Olimpica"},
        data={
            "create": {"name": "Olimpica", "url": "https://www.olimpica.com"},
            "update": {},
        },
    )

    olimpica_products = await scrape_olimpica(queries)
    for p in olimpica_products:
        product = await db.client.product.upsert(
            where={"name": p["name"]},
            data={
                "create": {
                    "name": p["name"],
                    "price": p["price"],
                    "storeId": olimpica_store.id,
                },
                "update": {
                    "price": p["price"],
                    "storeId": olimpica_store.id,
                },
            },
        )
        if product.price == p["price"]:
            summary["olimpica"]["updated"] += 1
        else:
            summary["olimpica"]["new"] += 1

    # === Scraping Éxito ===
    exito_store = await db.client.store.upsert(
        where={"name": "Éxito"},
        data={
            "create": {"name": "Éxito", "url": "https://www.exito.com"},
            "update": {},
        },
    )

    exito_products = await scrape_exito(queries)
    for p in exito_products:
        product = await db.client.product.upsert(
            where={"name": p["name"]},
            data={
                "create": {
                    "name": p["name"],
                    "price": p["price"],
                    "storeId": exito_store.id,
                },
                "update": {
                    "price": p["price"],
                    "storeId": exito_store.id,
                },
            },
        )
        if product.price == p["price"]:
            summary["exito"]["updated"] += 1
        else:
            summary["exito"]["new"] += 1

    return {"status": "ok", "summary": summary}


@app.get("/crawler/products")
async def get_products():
    products = await db.client.product.find_many(include={"store": True})
    return products








