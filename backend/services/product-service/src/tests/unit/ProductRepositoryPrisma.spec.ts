import { ProductRepositoryPrisma } from "../../infrastructure/repositories/ProductRepositoryPrisma";
import { PrismaClient } from "@prisma/client";

// Simulamos toda la clase PrismaClient manualmente
jest.mock("@prisma/client", () => {
  const mPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe("ProductRepositoryPrisma (Unit Tests)", () => {
  let prismaMock: any;
  let repository: ProductRepositoryPrisma;

  beforeEach(() => {
    // Obtenemos la instancia mock de PrismaClient
    const { PrismaClient } = require("@prisma/client");
    prismaMock = new PrismaClient();
    repository = new ProductRepositoryPrisma(prismaMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debería filtrar productos por tipo", async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 1, type: "tech" }]);

    const result = await repository.filterByType("tech");

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { type: "tech" },
      orderBy: { price: "asc" },
    });
    expect(result).toEqual([{ id: 1, type: "tech" }]);
  });

  it("debería buscar producto por ID", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 10, name: "Laptop" });

    const result = await repository.findById(10);

    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
      where: { id: 10 },
    });
    expect(result).toEqual({ id: 10, name: "Laptop" });
  });
});

