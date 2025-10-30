import { PrismaClient, Product } from "@prisma/client";

export class ProductRepositoryPrisma {
  prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient();
  }

  // ------- Lecturas --------
  async filterByType(type: string) {
    return this.prisma.product.findMany({
      where: { type },
      orderBy: { price: "asc" }
    });
  }

  async filterByTypeAndStores(type: string, storeIds: number[]) {
    return this.prisma.product.findMany({
      where: {
        type,
        storeId: { in: storeIds }
      },
      orderBy: { price: "asc" }
    });
  }

  async getAll() {
    return this.prisma.product.findMany();
  }

  async findById(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // ------- Escrituras --------
  async createMany(products: Array<Pick<Product, "name" | "type" | "price" | "storeId">>) {
    // Evita errores si llega un array vacío
    if (!products || products.length === 0) return { count: 0 };
    const result = await this.prisma.product.createMany({
      data: products,
      // si en el futuro agregas un @unique (p.e. name+storeId), esto evita duplicados
      skipDuplicates: true
    });
    return result; // { count: number }
  }

  async createOne(product: Pick<Product, "name" | "type" | "price" | "storeId">) {
    return this.prisma.product.create({ data: product });
  }
}


