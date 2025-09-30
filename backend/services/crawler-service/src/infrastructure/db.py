from prisma import Prisma

class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance.client = Prisma()
        return cls._instance

    async def connect(self):
        await self.client.connect()

    async def disconnect(self):
        await self.client.disconnect()

db = Database()
