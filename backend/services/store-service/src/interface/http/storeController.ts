import { Request, Response } from "express";
import { StoreRepositoryPrisma } from "../../infrastructure/repositories/StoreRepositoryPrisma";

const repo = new StoreRepositoryPrisma();

export const getStoresByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    
    // CAMBIAR: Usar el repositorio en lugar del mock
    const stores = await repo.findByCategory(category);
    
    res.status(200).json({
      message: "Stores retrieved successfully",
      stores: stores,
      count: stores.length
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Error fetching stores" });
  }
};

// AGREGAR: Nueva función para obtener tienda por ID
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id);
    
    // Necesitamos agregar este método al repositorio
    const store = await repo.findById(storeId);
    
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    
    res.status(200).json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ error: "Error fetching store" });
  }
};


