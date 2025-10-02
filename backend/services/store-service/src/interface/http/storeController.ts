import express from "express";
import { StoreRepositoryPrisma } from "../../infrastructure/repositories/StoreRepositoryPrisma";
import { GetStoresByCategoryUseCase } from "../../application/use_cases/getStoresByCategory";

const router = express.Router();
const repo = new StoreRepositoryPrisma();
const useCase = new GetStoresByCategoryUseCase(repo);

// GET /stores?category=Electrónica
router.get("/stores", async (req, res) => {
  try {
    const category = (req.query.category as string) || undefined;
    const stores = await useCase.execute(category);
    return res.json({ stores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

export default router;
