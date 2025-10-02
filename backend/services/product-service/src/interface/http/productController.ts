import express from "express";
import axios from "axios";
import { ProductRepositoryPrisma } from "../../infrastructure/repositories/ProductRepositoryPrisma";
import { FilterProductsByTypeUseCase } from "../../application/use_cases/filterProductsByType";

const router = express.Router();
const repo = new ProductRepositoryPrisma();
const useCase = new FilterProductsByTypeUseCase(repo);

const SERVICE_STORE_URL = process.env.SERVICE_STORE_URL || "http://service-store:3001";

// GET /products/filter?type=Electrónica
// optional: ?onlyActiveStores=true  -> consulta service-store para obtener stores activas que tengan la categoría
router.get("/products/filter", async (req, res) => {
  try {
    const type = (req.query.type as string) || "";
    if (!type) return res.status(400).json({ message: "type query required" });

    const onlyActiveStores = (req.query.onlyActiveStores as string) === "true";

    if (onlyActiveStores) {
      // pedir a service-store las tiendas que tengan la categoría = type
      const resp = await axios.get(`${SERVICE_STORE_URL}/stores`, { params: { category: type } });
      const stores = resp.data.stores || [];
      const storeIds: number[] = stores.map((s: any) => s.id);
      const products = await useCase.execute(type, storeIds);
      return res.json({ products });
    } else {
      const products = await useCase.execute(type);
      return res.json({ products });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

export default router;
