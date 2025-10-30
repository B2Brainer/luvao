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

// -------- GETs ----------
export const getProductsByType = async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as string) || "";
    if (!type) return res.status(400).json({ message: "type query required" });

    const onlyActiveStores = (req.query.onlyActiveStores as string) === "true";

    if (onlyActiveStores) {
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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
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

// -------- POST (bulk/single) ----------
type IncomingProduct = {
  name: string;
  type: string;
  price: number;
  storeId: number;
};

function normalizeBody(body: any): IncomingProduct[] {
  // Acepta array o un solo objeto; valida campos mínimos
  const normalizeOne = (p: any): IncomingProduct | null => {
    if (!p) return null;
    const name = String(p.name ?? "").trim();
    const type = String(p.type ?? "").trim();
    const price = Number(p.price);
    const storeId = Number(p.storeId);
    if (!name || !type || Number.isNaN(price) || Number.isNaN(storeId)) return null;
    return { name, type, price, storeId };
  };

  if (Array.isArray(body)) {
    return body.map(normalizeOne).filter(Boolean) as IncomingProduct[];
  }
  const one = normalizeOne(body);
  return one ? [one] : [];
}

export const createProducts = async (req: Request, res: Response) => {
  try {
    const items = normalizeBody(req.body);
    if (items.length === 0) {
      return res.status(400).json({ message: "Invalid payload. Expecting product or array of products with {name,type,price,storeId}" });
    }

    // Si llega uno, puedes crear individual; si llega más, usa createMany.
    if (items.length === 1) {
      const created = await repo.createOne(items[0]);
      return res.status(201).json({ count: 1, products: [created] });
    }

    const result = await repo.createMany(items);
    return res.status(201).json({ count: result.count });
  } catch (err) {
    console.error("Error creating products:", err);
    return res.status(500).json({ message: "server error" });
  }
};


