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

  async getAll() {
  return this.prisma.product.findMany();
}

}


