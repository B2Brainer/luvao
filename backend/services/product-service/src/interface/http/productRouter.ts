import { Router } from "express";
import { getProductsByType, createProducts} from "./productController";

export const ProductRouter = Router();

ProductRouter.get("/filter", getProductsByType);

ProductRouter.post("/", createProducts);
