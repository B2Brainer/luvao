import { Request, Response } from "express";
import { StoreRepositoryPrisma } from "../../infrastructure/repositories/StoreRepositoryPrisma";

const repo = new StoreRepositoryPrisma();

export const getStoresByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    res.status(200).json({
      message: "Mocked store response",
      category: category || "all",
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Error fetching stores" });
  }
};


