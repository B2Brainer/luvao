"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StoreRepositoryPrisma_1 = require("../../infrastructure/repositories/StoreRepositoryPrisma");
const getStoresByCategory_1 = require("../../application/use_cases/getStoresByCategory");
const router = express_1.default.Router();
const repo = new StoreRepositoryPrisma_1.StoreRepositoryPrisma();
const useCase = new getStoresByCategory_1.GetStoresByCategoryUseCase(repo);
// GET /stores?category=Electrónica
router.get("/stores", async (req, res) => {
    try {
        const category = req.query.category || undefined;
        const stores = await useCase.execute(category);
        return res.json({ stores });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
});
exports.default = router;
