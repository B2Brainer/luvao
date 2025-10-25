import express from 'express';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { ProductRouter } from './interface/http/productRouter';
import path from 'path'; // ← Añadir esta importación

dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Swagger para product-service - CORREGIDO
  const swaggerPath = path.join('/app', 'docs', 'openapi-product.yaml');
  console.log('Loading Swagger from:', swaggerPath);
  const swaggerDoc = YAML.load(swaggerPath);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  // Healthcheck
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'product-service' }));

  // Rutas principales
  app.use('/api/products', ProductRouter);

  app.listen(PORT, () => {
    console.log(`product-service listening on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  });
}

bootstrap().catch((err) => {
  console.error('Error starting product-service', err);
  process.exit(1);
});