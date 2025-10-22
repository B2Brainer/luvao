import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const YAML: any = require('yamljs');
import swaggerUi from 'swagger-ui-express';
import { StoreRouter } from './interface/http/storeRouter';

dotenv.config();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = express();
app.use(cors());
app.use(express.json());

// Swagger para store-service
const swaggerDoc = YAML.load(__dirname + '/../../docs/openapi-store.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'store-service' }));

app.use('/api/stores', StoreRouter);

app.listen(PORT, () => {
  console.log(`store-service listening on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
