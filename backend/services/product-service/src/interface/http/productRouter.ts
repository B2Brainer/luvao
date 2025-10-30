import { Router } from "express";
import { getProductsByType, getAllProducts, getProductById, createProducts } from "./productController";

export const ProductRouter = Router();

// Crear (uno o varios)
ProductRouter.post("/", createProducts);

// Obtener todos
ProductRouter.get("/", getAllProducts);

// Filtrar por tipo
ProductRouter.get("/filter", getProductsByType);

// Obtener por id
ProductRouter.get("/:id", getProductById);


