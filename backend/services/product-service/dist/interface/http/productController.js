"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const ProductRepositoryPrisma_1 = require("../../infrastructure/repositories/ProductRepositoryPrisma");
const filterProductsByType_1 = require("../../application/use_cases/filterProductsByType");
const router = express_1.default.Router();
const repo = new ProductRepositoryPrisma_1.ProductRepositoryPrisma();
const useCase = new filterProductsByType_1.FilterProductsByTypeUseCase(repo);
const SERVICE_STORE_URL = process.env.SERVICE_STORE_URL || "http://service-store:3001";
// GET /products/filter?type=Electrónica
// optional: ?onlyActiveStores=true  -> consulta service-store para obtener stores activas que tengan la categoría
router.get("/products/filter", async (req, res) => {
    try {
        const type = req.query.type || "";
        if (!type)
            return res.status(400).json({ message: "type query required" });
        const onlyActiveStores = req.query.onlyActiveStores === "true";
        if (onlyActiveStores) {
            // pedir a service-store las tiendas que tengan la categoría = type
            const resp = await axios_1.default.get(`${SERVICE_STORE_URL}/stores`, { params: { category: type } });
            const stores = resp.data.stores || [];
            const storeIds = stores.map((s) => s.id);
            const products = await useCase.execute(type, storeIds);
            return res.json({ products });
        }
        else {
            const products = await useCase.execute(type);
            return res.json({ products });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
});
exports.default = router;
