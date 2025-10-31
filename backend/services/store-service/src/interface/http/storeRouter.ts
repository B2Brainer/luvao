import { Router } from "express";
import { getStoresByCategory } from "./storeController";
import { getStoreById } from "./storeController";
import { createStore } from "./storeController";


console.log("getStoresByCategory type:", typeof getStoresByCategory);

export const StoreRouter = Router();

StoreRouter.get("/", getStoresByCategory);
StoreRouter.get("/filter", getStoresByCategory);
StoreRouter.get("/:id", getStoreById);
StoreRouter.post("/", createStore);

