import express from "express";
import dotenv from "dotenv";
import storeRouter from "./interface/http/storeController";
dotenv.config();

const app = express();
app.use(express.json());
app.use(storeRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`service-store listening on ${PORT}`);
});
