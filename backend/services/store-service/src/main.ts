import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
const YAML: any = require('yamljs');
import swaggerUi from 'swagger-ui-express';
import { StoreRouter } from './interface/http/storeRouter';

dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Swagger para store-service - Ruta absoluta desde /app
const swaggerPath = path.join('/app', 'docs', 'openapi-store.yaml');
console.log('Loading Swagger from:', swaggerPath);
const swaggerDoc = YAML.load(swaggerPath);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'store-service' }));

app.use('/api/stores', StoreRouter);

app.listen(PORT, () => {
  console.log(`store-service listening on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});