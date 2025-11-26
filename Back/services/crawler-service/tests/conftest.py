import os
import subprocess
import asyncio
import pytest
from testcontainers.postgres import PostgresContainer
from prisma import Prisma

# ---------- Event loop para pytest-asyncio ----------
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# ---------- Postgres efímero + migraciones ----------
@pytest.fixture(scope="session")
def pg_container():
    """
    Levanta un Postgres en contenedor y aplica el esquema con Prisma.
    Deja DATABASE_URL apuntando a esa DB durante toda la sesión.
    """
    from testcontainers.postgres import PostgresContainer
    with PostgresContainer("postgres:16-alpine") as pg:
        url = pg.get_connection_url()
        os.environ["DATABASE_URL"] = url

        # 1) Generar cliente (Python)
        subprocess.run(["python", "-m", "prisma", "generate"], check=True)

        # 2) Intentar aplicar migraciones
        #    Si falla (p.ej., falta historial o CLI de Node), usamos db push SOLO para tests.
        try:
            subprocess.run(["python", "-m", "prisma", "migrate", "deploy"], check=True)
        except subprocess.CalledProcessError:
            # Para entorno de pruebas está bien sincronizar el esquema directamente:
            subprocess.run(["python", "-m", "prisma", "db", "push", "--accept-data-loss"], check=True)

        yield pg

# ---------- Cliente Prisma compartido ----------
@pytest.fixture(scope="session")
def prisma(pg_container):
    """
    Crea un Prisma() conectado a la DB del contenedor. Vida de sesión.
    """
    client = Prisma()
    # Conectar de forma síncrona desde el loop de sesión
    asyncio.get_event_loop().run_until_complete(client.connect())
    yield client
    asyncio.get_event_loop().run_until_complete(client.disconnect())

# ---------- Limpieza entre pruebas ----------
@pytest.fixture(autouse=True)
async def _truncate_between_tests(prisma: Prisma):
    """
    Limpia las tablas entre pruebas para aislamiento.
    (Usa el nombre exacto de tus tablas según migraciones)
    """
    # BEGIN opcional si quieres asegurar transacción; TRUNCATE hace COMMIT implícito en PG
    await prisma.execute_raw('TRUNCATE TABLE "Product" CASCADE;')
    await prisma.execute_raw('TRUNCATE TABLE "Store" CASCADE;')
    yield
    # Nada que hacer después; las pruebas ya quedan limpias para la siguiente