import express from 'express';
import { Database } from './infrastructure/database/Database';
import userRouter from './interface/http/userRouter';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Swagger setup
const swaggerPath = path.join(__dirname, '../docs/openapi-user.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
} else {
  console.warn('⚠️ Swagger file not found at', swaggerPath);
}

// Routes
app.use('/api/users', userRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// Database connection
const database = Database.getInstance();
database.connect().then(() => {
  app.listen(port, () => {
    console.log(`✅ User service running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  });
}).catch(err => {
  console.error('❌ Error connecting to the database:', err);
});

export default app;
