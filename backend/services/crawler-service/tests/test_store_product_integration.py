import pytest
from prisma import Prisma
from prisma.errors import UniqueViolationError

@pytest.mark.anyio
async def test_create_store_and_product_relationship(prisma: Prisma):
    # 1) Crear Store
    store = await prisma.store.create(
        data={
            "name": "Olímpica",
            "url": "https://www.olimpica.com",
        }
    )
    assert store.id and store.name == "Olímpica"

    # 2) Crear Product asociado a la Store
    product = await prisma.product.create(
        data={
            "name": "Arroz Roa 500g",
            "price": 4200.0,
            "storeId": store.id,
        }
    )
    assert product.id and product.storeId == store.id

    # 3) Consultar productos de la Store (relación 1:N)
    products = await prisma.product.find_many(where={"storeId": store.id})
    assert len(products) == 1
    assert products[0].name == "Arroz Roa 500g"

@pytest.mark.anyio
async def test_unique_constraints(prisma: Prisma):
    # Unicidad en Store.name
    await prisma.store.create(data={"name": "Éxito", "url": "https://www.exito.com"})
    with pytest.raises(UniqueViolationError):
        await prisma.store.create(data={"name": "Éxito", "url": "https://exito.com/diff"})

    # Unicidad en Product.name
    store = await prisma.store.create(data={"name": "Otra", "url": "https://otra.tld"})
    await prisma.product.create(
        data={"name": "Aceite Premier 1L", "price": 12000.0, "storeId": store.id}
    )
    with pytest.raises(UniqueViolationError):
        await prisma.product.create(
            data={"name": "Aceite Premier 1L", "price": 12500.0, "storeId": store.id}
        )