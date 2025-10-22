import request from 'supertest';
import express from 'express';
import { ProductRouter } from '../interface/http/productRouter';

const app = express();
app.use(express.json());
app.use('/api/products', ProductRouter);

describe('Integration: /api/products', () => {
  it('should return 404 if product not found', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
  });
});
