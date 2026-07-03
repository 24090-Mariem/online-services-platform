process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('AUTH MODULE TESTS', () => {

  let testEmail;
  const password = "Test1234!";

  beforeAll(async () => {
    testEmail = `test_${Date.now()}@mail.com`;
    await pool.query("DELETE FROM users WHERE email LIKE 'test_%'");
    await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password,
        nom: 'Test',
        prenom: 'User',
      });
  });

  afterAll(() => {
    tokenStore.destroy();
  });

  it('should login and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: "wrongpass" });

    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid JWT cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'token=fake_token');

    expect(res.statusCode).toBe(401);
  });

  it('should block SQL injection attempt', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "' OR 1=1 --",
        password: "123456"
      });

    expect(res.statusCode).toBe(400);
  });

  it('should generate reset token for valid email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should not reveal email existence', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: "fake@mail.com" });

    expect(res.statusCode).toBe(200);
  });

  it('should reset password with valid token', async () => {
    const rawCode = "123456";
    const tokenHash = crypto.createHash('sha256').update(rawCode).digest('hex');
    const expiresAt = new Date(Date.now() + 60000).toISOString().slice(0, 19).replace('T', ' ');

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [testEmail]
    );
    const userId = rows[0].id;

    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: rawCode,
        password: "NewPass123!"
      });

    expect(res.statusCode).toBe(200);
  });

  it('should reject invalid reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: "fake_token",
        password: "NewPass123!"
      });

    expect(res.statusCode).toBe(400);
  });

  it('should reject expired reset token', async () => {
    const rawCode = "654321";
    const tokenHash = crypto.createHash('sha256').update(rawCode).digest('hex');
    const expiresAt = new Date(Date.now() - 60000).toISOString().slice(0, 19).replace('T', ' ');

    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [testEmail]
    );
    const userId = rows[0].id;

    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: rawCode,
        password: "NewPass123!"
      });

    expect(res.statusCode).toBe(400);
  });
});
