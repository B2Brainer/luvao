import { Request, Response } from "express";
import axios from "axios";
import { ProductRepositoryPrisma } from "../../infrastructure/repositories/ProductRepositoryPrisma";
import { FilterProductsByTypeUseCase } from "../../application/use_cases/filterProductsByType";

const repo = new ProductRepositoryPrisma();
const useCase = new FilterProductsByTypeUseCase(repo);

// URL del servicio de tiendas (usado internamente en Docker Compose)
const SERVICE_STORE_URL = process.env.SERVICE_STORE_URL || "http://service-store:3001";

// ✅ Interfaz para tipar la respuesta del store-service
interface StoreResponse {
  stores?: { id: number; name: string; isActive?: boolean }[];
}

export const getProductsByType = async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as string) || "";
    if (!type) return res.status(400).json({ message: "type query required" });

    const onlyActiveStores = (req.query.onlyActiveStores as string) === "true";

    if (onlyActiveStores) {
      // ✅ Tipado de Axios para evitar 'unknown'
      const resp = await axios.get<StoreResponse>(`${SERVICE_STORE_URL}/stores`, {
        params: { category: type },
      });

      const stores = resp.data.stores || [];
      const storeIds: number[] = stores.map((s) => s.id);

      const products = await useCase.execute(type, storeIds);
      return res.json({
        count: products.length,
        products,
      });
    } else {
      const products = await useCase.execute(type);
      return res.json({
        count: products.length,
        products,
      });
    }
  } catch (err) {
    console.error("Error in getProductsByType:", err);
    return res.status(500).json({ message: "server error" });
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await repo.getAll();
    return res.json({
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: "server error" });
  }
};

// AGREGAR esta nueva función al archivo existente:
export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    
    // Necesitamos agregar este método al repositorio
    const product = await repo.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    return res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


