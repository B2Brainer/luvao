import { Router } from "express";
import { getStoresByCategory } from "./storeController";

export const StoreRouter = Router();

// Ruta base
StoreRouter.get("/", getStoresByCategory);

// Ruta con filtro explícito (es lo mismo, solo alias)
StoreRouter.get("/filter", getStoresByCategory);
