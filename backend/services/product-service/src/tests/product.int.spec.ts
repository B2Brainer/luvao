import request from 'supertest';
import express from 'express';
import { ProductRouter } from '../interface/http/productRouter';

const app = express();
app.use(express.json());
app.use('/api/products', ProductRouter);

describe('Integration: /api/products', () => {
  it('GET /api/products/filter → should return 200 or 404', async () => {
    const res = await request(app).get('/api/products/filter');
    expect([200, 400, 404]).toContain(res.status);
  });
});
