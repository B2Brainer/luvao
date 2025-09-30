from fastapi import FastAPI
from src.infrastructure.db import db
from prisma.models import Product, Store

app = FastAPI(title="Crawler Service")

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

@app.post("/crawler/refresh")
async def refresh_data():
    store = await db.store.upsert(
        where={"name": "Supermercado Demo"},
        update={},
        create={"name": "Supermercado Demo", "url": "https://example.com"},
    )

    product = await db.product.create(
        data={
            "name": "Arroz 500g",
            "price": 3500.0,
            "storeId": store.id,
        }
    )
    return product

    product = await db.client.product.create(
        data={"name": "Arroz 500g", "price": 3500, "storeId": store.id},
    )

    return {"status": "ok", "inserted": product.dict()}

@app.get("/crawler/products")
async def get_products():
    products = await db.client.product.find_many(include={"store": True})
    return products


