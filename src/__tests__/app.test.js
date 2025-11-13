const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  it('should return 200 OK on /health endpoint', async () => {
    const res = await request(app).get('/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Server is running');
  });

  it('should return API info on root endpoint', async () => {
    const res = await request(app).get('/');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Result Management System API');
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});
