import { Router } from "express";
import { getStoresByCategory } from "./storeController";


console.log("getStoresByCategory type:", typeof getStoresByCategory);

export const StoreRouter = Router();

StoreRouter.get("/", getStoresByCategory);
StoreRouter.get("/filter", getStoresByCategory);

