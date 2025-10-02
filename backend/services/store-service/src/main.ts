import express from "express";
import dotenv from "dotenv";
import { StoreRouter } from "./interface/http/storeRouter";

dotenv.config();

const app = express();
app.use(express.json());

// Ruta de prueba para ver que el servicio esté activo
app.get("/", (req, res) => {
  res.send("✅ Service Store is running correctly!");
});

// Rutas principales
app.use("/stores", StoreRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`✅ service-store listening on port ${port}`));
