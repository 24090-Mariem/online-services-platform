process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');

jest.setTimeout(20000);

afterAll(async () => {
  await pool.end();
});

describe('REVIEWS SECURITY', () => {
  it('should deny unauthenticated access to all reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.statusCode).toBe(401);
  });

  it('should allow public access to technicien reviews', async () => {
    const res = await request(app).get('/api/reviews/technicien/1');
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('RESERVATIONS VALIDATION', () => {
  let agent;

  beforeAll(async () => {
    const email = `res_test_${Date.now()}@mail.com`;
    const password = 'Test1234!';
    agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      email,
      password,
      nom: 'Res',
      prenom: 'Test',
    });
    await agent.post('/api/auth/login').send({ email, password });
  });

  it('should reject reservation without service_id', async () => {
    const res = await agent
      .post('/api/reservations')
      .send({ notes: 'test' });

    expect(res.statusCode).toBe(400);
  });
});

describe('UPLOADS SECURITY', () => {
  it('should block public access to non-image uploads', async () => {
    const res = await request(app).get('/uploads/document.pdf');
    expect(res.statusCode).toBe(403);
  });
});
