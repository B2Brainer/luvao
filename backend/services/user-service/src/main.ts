import express from 'express';
import { Database } from './infrastructure/database/Database';
import userRouter from './interface/http/userRouter';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`User service running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export default app;