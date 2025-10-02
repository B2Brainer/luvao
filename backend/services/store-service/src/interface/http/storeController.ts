import { Request, Response } from "express";
import { GetStoresByCategoryUseCase } from "../../application/use_cases/getStoresByCategory";
import { StoreRepositoryPrisma } from "../../infrastructure/repositories/StoreRepositoryPrisma";

const storeRepo = new StoreRepositoryPrisma();
const getStoresByCategoryUseCase = new GetStoresByCategoryUseCase(storeRepo);

export const getStoresByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;

    const stores = await getStoresByCategoryUseCase.execute(category);
    res.json({ stores });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Error fetching stores" });
  }
};
