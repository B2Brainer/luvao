"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepositoryPrisma = void 0;
const client_1 = require("@prisma/client");
class ProductRepositoryPrisma {
    constructor(prisma) {
        this.prisma = prisma ?? new client_1.PrismaClient();
    }
    async filterByType(type) {
        return this.prisma.product.findMany({
            where: { type },
            orderBy: { price: "asc" }
        });
    }
    async filterByTypeAndStores(type, storeIds) {
        return this.prisma.product.findMany({
            where: {
                type,
                storeId: { in: storeIds }
            },
            orderBy: { price: "asc" }
        });
    }
    async createMany(products) {
        return this.prisma.product.createMany({ data: products, skipDuplicates: true });
    }
}
exports.ProductRepositoryPrisma = ProductRepositoryPrisma;
