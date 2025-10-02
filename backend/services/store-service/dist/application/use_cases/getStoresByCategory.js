"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStoresByCategoryUseCase = void 0;
class GetStoresByCategoryUseCase {
    constructor(storeRepo) {
        this.storeRepo = storeRepo;
    }
    async execute(category) {
        if (!category) {
            return this.storeRepo.findAll();
        }
        return this.storeRepo.findByCategory(category);
    }
}
exports.GetStoresByCategoryUseCase = GetStoresByCategoryUseCase;
