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
    // CAMBIAR: Manejar el caso cuando category es undefined o vacío
    if (!category) {
      return this.prisma.store.findMany({
        where: {
          isActive: true
        }
      });
    }
    
    return this.prisma.store.findMany({
      where: {
        isActive: true,
        categories: { has: category }
      }
    });
  }

  async findById(id: number) {
    return this.prisma.store.findUnique({
      where: { id }
    });
  }
}

