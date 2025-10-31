import { StoreRepositoryPrisma } from "../../infrastructure/repositories/StoreRepositoryPrisma";
import { PrismaClient } from "@prisma/client";

// ✅ Mock completo del PrismaClient
jest.mock("@prisma/client", () => {
  const mPrisma = {
    store: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe("StoreRepositoryPrisma (Unit Tests)", () => {
  let prismaMock: any;
  let repository: StoreRepositoryPrisma;

  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaMock = new PrismaClient();
    repository = new StoreRepositoryPrisma(prismaMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debería obtener todas las tiendas", async () => {
    prismaMock.store.findMany.mockResolvedValue([{ id: 1, name: "Tienda A" }]);
    const result = await repository.findAll();
    expect(prismaMock.store.findMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: "Tienda A" }]);
  });

  it("debería obtener tiendas activas cuando no se pasa categoría", async () => {
    prismaMock.store.findMany.mockResolvedValue([{ id: 1, isActive: true }]);
    const result = await repository.findByCategory("");
    expect(prismaMock.store.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
    });
    expect(result).toEqual([{ id: 1, isActive: true }]);
  });

  it("debería filtrar tiendas por categoría", async () => {
    prismaMock.store.findMany.mockResolvedValue([
      { id: 2, categories: ["tech"], isActive: true },
    ]);
    const result = await repository.findByCategory("tech");
    expect(prismaMock.store.findMany).toHaveBeenCalledWith({
      where: { isActive: true, categories: { has: "tech" } },
    });
    expect(result).toEqual([{ id: 2, categories: ["tech"], isActive: true }]);
  });

  it("debería buscar tienda por ID", async () => {
    prismaMock.store.findUnique.mockResolvedValue({ id: 10, name: "ShopX" });
    const result = await repository.findById(10);
    expect(prismaMock.store.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(result).toEqual({ id: 10, name: "ShopX" });
  });
});
