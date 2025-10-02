import express from "express";
import dotenv from "dotenv";
import { ProductRouter } from "./interface/http/productRouter";

dotenv.config();

const app = express();
app.use(express.json());

// ruta base
app.get("/", (req, res) => res.send("✅ Service Product is running correctly!"));

// 👇 rutas reales
app.use("/products", ProductRouter);

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`✅ service-product listening on port ${port}`));
