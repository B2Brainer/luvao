import { PrismaClient } from "@prisma/client";

export class ProductRepositoryPrisma {
  prisma: PrismaClient;
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient();
  }

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

  async createMany(products: { name: string; type: string; storeId: number; price: number; sku?: string }[]) {
    return this.prisma.product.createMany({ data: products, skipDuplicates: true });
  }
}
