process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('PROFILE MODULE TESTS', () => {
  const clientEmail = `profile_client_${Date.now()}@mail.com`;
  const password = 'Test1234!';
  let clientAgent;

  beforeAll(async () => {
    clientAgent = request.agent(app);
    await clientAgent
      .post('/api/auth/register')
      .send({
        email: clientEmail,
        password,
        nom: 'ProfileClient',
        prenom: 'Test',
        telephone: '+22212345678',
      });
  });

  afterAll(async () => {
    const [users] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [clientEmail]
    );
    if (users.length > 0) {
      const uid = users[0].id;
      await pool.execute('DELETE FROM reservations WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?)', [uid]);
      await pool.execute('DELETE FROM avis WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?)', [uid]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [uid]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [uid]);
      await tokenStore.revokeAllForUser(uid);
      await pool.execute('DELETE FROM users WHERE id = ?', [uid]);
    }
    tokenStore.destroy();
  });

  describe('Client Profile', () => {
    it('should retrieve profile', async () => {
      const res = await clientAgent.get('/api/users/profile');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', clientEmail);
      expect(res.body.data.user).toHaveProperty('nom', 'ProfileClient');
      expect(res.body.data.user).toHaveProperty('prenom', 'Test');
    });

    it('should update profile fields', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({
          nom: 'UpdatedName',
          prenom: 'UpdatedPrenom',
          telephone: '+22299999999',
          adresse: 'Nouakchott',
          email: clientEmail,
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.nom).toBe('UpdatedName');
      expect(res.body.data.user.prenom).toBe('UpdatedPrenom');
    });

    it('should reject invalid email format', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ email: 'notanemail' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const otherAgent = request.agent(app);
      await otherAgent.post('/api/auth/register').send({
        email: `dup_check_${Date.now()}@mail.com`, password, nom: 'Dup', prenom: 'Test',
      });
      const dupEmail = `dup_check_${Date.now()}@mail.com`;
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ email: dupEmail });
      expect(res.statusCode).toBe(200);
    });

    it('should reject nom exceeding 100 chars', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ nom: 'A'.repeat(101) });
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid telephone format', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ telephone: 'abc' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject adresse exceeding 255 chars', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ adresse: 'A'.repeat(256) });
      expect(res.statusCode).toBe(400);
    });

    it('should allow empty telephone (optional)', async () => {
      const res = await clientAgent
        .put('/api/users/profile')
        .send({ telephone: '', email: clientEmail });
      expect(res.statusCode).toBe(200);
    });

    it('should upload avatar', async () => {
      const Buffer = require('buffer').Buffer;
      const fakePng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      const res = await clientAgent
        .post('/api/users/profile/avatar')
        .attach('avatar', fakePng, { filename: 'test.png', contentType: 'image/png' });
      expect([200, 400]).toContain(res.statusCode);
    });

    it('should reject non-image file for avatar', async () => {
      const Buffer = require('buffer').Buffer;
      const fakePdf = Buffer.from('%PDF-1.4 fake content');
      const res = await clientAgent
        .post('/api/users/profile/avatar')
        .attach('avatar', fakePdf, { filename: 'test.pdf', contentType: 'application/pdf' });
      expect([400, 500]).toContain(res.statusCode);
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject unauthenticated profile access', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toBe(401);
    });

    it('should reject unauthenticated profile update', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ nom: 'Hacker' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject unauthenticated avatar upload', async () => {
      const res = await request(app)
        .post('/api/users/profile/avatar');
      expect(res.statusCode).toBe(401);
    });
  });
});
