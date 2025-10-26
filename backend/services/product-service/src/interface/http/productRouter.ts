import { Router } from "express";
import { getProductsByType } from "./productController";

export const ProductRouter = Router();

ProductRouter.get("/filter", getProductsByType);
