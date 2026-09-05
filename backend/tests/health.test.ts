import request from 'supertest';
import { app } from '../src/app.js';

describe('Health Check API Tests', () => {
  test('GET /api/health should return 200 OK and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('healthy');
  });
});
