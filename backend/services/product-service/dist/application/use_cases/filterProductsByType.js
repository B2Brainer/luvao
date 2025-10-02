"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterProductsByTypeUseCase = void 0;
class FilterProductsByTypeUseCase {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    // si recibe storeIds, filtra por stores; si no, devuelve todos los products del tipo
    async execute(type, storeIds) {
        if (storeIds && storeIds.length > 0) {
            return this.productRepo.filterByTypeAndStores(type, storeIds);
        }
        return this.productRepo.filterByType(type);
    }
}
exports.FilterProductsByTypeUseCase = FilterProductsByTypeUseCase;
