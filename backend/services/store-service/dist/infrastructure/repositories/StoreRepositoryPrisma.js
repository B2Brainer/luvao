"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreRepositoryPrisma = void 0;
const client_1 = require("@prisma/client");
class StoreRepositoryPrisma {
    constructor(prisma) {
        this.prisma = prisma !== null && prisma !== void 0 ? prisma : new client_1.PrismaClient();
    }
    async findAll() {
        return this.prisma.store.findMany();
    }
    // buscar tiendas que tengan la categoría (category) dentro del JSON categories
    async findByCategory(category) {
        return this.prisma.store.findMany({
            where: {
                isActive: true,
                categories: { has: category }
            }
        });
    }
    async create(store) {
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
exports.StoreRepositoryPrisma = StoreRepositoryPrisma;
