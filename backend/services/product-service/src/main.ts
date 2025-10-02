import express from "express";
import dotenv from "dotenv";
import productRouter from "./interface/http/productController";
dotenv.config();

const app = express();
app.use(express.json());
app.use(productRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`service-product listening on ${PORT}`);
});
