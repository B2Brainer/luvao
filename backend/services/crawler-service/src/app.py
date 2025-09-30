from fastapi import FastAPI
from src.infrastructure.db import db
from src.scrapers.olimpica import scrape_olimpica
from src.scrapers.d1 import scrape_d1

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

    summary = {"olimpica": {"new": 0, "updated": 0}, "d1": {"new": 0, "updated": 0}}

    # Scraping Olímpica
    olimpica_products = await scrape_olimpica(queries)
    for p in olimpica_products:
        product = await db.client.product.upsert(
            where={"name": p["name"]},
            data={
                "create": {
                    "name": p["name"],
                    "price": p["price"],
                    "store": {
                        "connect_or_create": {
                            "where": {"name": "Olimpica"},
                            "create": {
                                "name": "Olimpica",
                                "url": "https://www.olimpica.com",
                            },
                        }
                    },
                },
                "update": {"price": p["price"]},
            },
        )
        if product.price == p["price"]:
            summary["olimpica"]["updated"] += 1
        else:
            summary["olimpica"]["new"] += 1

    # Scraping D1
    d1_products = await scrape_d1(queries)
    for p in d1_products:
        product = await db.client.product.upsert(
            where={"name": p["name"]},
            data={
                "create": {
                    "name": p["name"],
                    "price": p["price"],
                    "store": {
                        "connect_or_create": {
                            "where": {"name": "D1"},
                            "create": {
                                "name": "D1",
                                "url": "https://domicilios.tiendasd1.com",
                            },
                        }
                    },
                },
                "update": {"price": p["price"]},
            },
        )
        if product.price == p["price"]:
            summary["d1"]["updated"] += 1
        else:
            summary["d1"]["new"] += 1

    return {"status": "ok", "summary": summary}


@app.get("/crawler/products")
async def get_products():
    products = await db.client.product.find_many(include={"store": True})
    return products






