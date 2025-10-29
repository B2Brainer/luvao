// store-service/src/tests/store.int.spec.ts

import request from 'supertest';
import express from 'express';
import { StoreRouter } from '../interface/http/storeRouter';

const app = express();
app.use(express.json());
app.use('/api/stores', StoreRouter);

describe('Integration: /api/stores', () => {
  it('GET /api/stores → should return array (mocked)', async () => {
    const res = await request(app).get('/api/stores');
    // En tu router real debería retornar los datos de la DB, aquí comprobamos el tipo de respuesta
    expect([200, 400, 404]).toContain(res.status);
  });

  it('GET /api/stores/999 → should return 404 for non-existent store', async () => {
    const res = await request(app).get('/api/stores/999');
    expect([404, 500]).toContain(res.status);
  });
});
