import express from 'express';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import { ProductRouter } from './interface/http/productRouter';

dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Swagger para product-service
  const swaggerDoc = YAML.load(__dirname + '/../../docs/openapi-product.yaml');
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
