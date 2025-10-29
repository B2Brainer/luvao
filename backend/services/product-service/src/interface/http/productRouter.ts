import { Router } from "express";
import { getProductsByType, getAllProducts } from "./productController";
import { getProductById } from "./productController";

export const ProductRouter = Router();

// Nueva ruta para obtener todos los productos
ProductRouter.get("/", getAllProducts);

// Filtrar productos por tipo
ProductRouter.get("/filter", getProductsByType);
ProductRouter.get("/:id", getProductById);


