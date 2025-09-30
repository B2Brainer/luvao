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
    # Inserta o actualiza un store
    store = await db.client.store.upsert(
        where={"id": "11111111-1111-1111-1111-111111111111"},  # un UUID fijo o generado
        data={
            "create": {
                "id": "11111111-1111-1111-1111-111111111111",
                "name": "My Test Store",
                "url": "https://example.com",
            },
            "update": {
                "name": "My Test Store Updated",
            }
        }
    )

    # Inserta un producto asociado
    product = await db.client.product.create(
        data={
            "name": "Test Product",
            "price": 9.99,
            "storeId": store.id,
        }
    )

    return {"status": "ok", "store": store.dict(), "product": product.dict()}


@app.get("/crawler/products")
async def get_products():
    products = await db.client.product.find_many(include={"store": True})
    return products



