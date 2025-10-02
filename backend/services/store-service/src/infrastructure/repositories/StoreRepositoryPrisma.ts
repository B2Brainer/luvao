import { PrismaClient } from "@prisma/client";

export class StoreRepositoryPrisma {
  prisma: PrismaClient;
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? new PrismaClient();
  }

  async findAll() {
    return this.prisma.store.findMany();
  }

  // buscar tiendas que tengan la categoría (category) dentro del JSON categories
  async findByCategory(category: string) {
    return this.prisma.store.findMany({
      where: {
        isActive: true,
        categories: { has: category }
      }
    });
  }

  async create(store: { name: string; baseUrl: string; country?: string; categories: string[] }) {
    return this.prisma.store.create({
      data: {
        name: store.name,
        baseUrl: store.baseUrl,
        country: store.country,
        categories: store.categories
      }
    });
  }
}
