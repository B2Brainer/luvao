import { Router } from "express";
import { getProductsByType, createProducts, getAllProducts } from "./productController";

export const ProductRouter = Router();

// Nueva ruta para obtener todos los productos
ProductRouter.get("/", getAllProducts);

// Filtrar productos por tipo
ProductRouter.get("/filter", getProductsByType);

// Crear productos
ProductRouter.post("/", createProducts);

