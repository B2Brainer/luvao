import { PrismaClient } from "@prisma/client";

describe("Conexión con base de datos (Integración)", () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("debería conectarse correctamente a la base de datos", async () => {
    const result = await prisma.$queryRaw`SELECT 1;`;
    expect(result).toBeTruthy();
  });

  it("debería obtener lista de productos (si existen datos)", async () => {
    const products = await prisma.product.findMany();
    expect(Array.isArray(products)).toBe(true);
  });
});
