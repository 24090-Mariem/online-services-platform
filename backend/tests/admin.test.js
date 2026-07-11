process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('ADMIN MODULE TESTS', () => {
  const ts = Date.now();
  const adminEmail = `adm_main_${ts}@mail.com`;
  const newAdminEmail = `adm_new_${ts}@mail.com`;
  const clientEmail = `adm_client_${ts}@mail.com`;
  const password = 'Test1234!';

  let adminAgent, clientAgent;
  let adminUserId, newAdminId, categoryId;

  beforeAll(async () => {
    adminAgent = request.agent(app);
    clientAgent = request.agent(app);

    await adminAgent.post('/api/auth/register').send({
      email: adminEmail, password, nom: 'MainAdmin', prenom: 'Test',
    });
    const [[adminRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    adminUserId = adminRow.id;
    await pool.execute("INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)", [adminUserId, 'MainAdmin']);

    await clientAgent.post('/api/auth/register').send({
      email: clientEmail, password, nom: 'AdmClient', prenom: 'Test',
    });
  });

  afterAll(async () => {
    for (const email of [adminEmail, newAdminEmail, clientEmail]) {
      const [[row]] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (row) {
        await pool.execute('DELETE FROM administrateurs WHERE user_id = ?', [row.id]);
        await pool.execute('DELETE FROM clients WHERE user_id = ?', [row.id]);
        await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [row.id]);
        await tokenStore.revokeAllForUser(row.id);
        await pool.execute('DELETE FROM users WHERE id = ?', [row.id]);
      }
    }
    if (categoryId) {
      await pool.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
    }
    tokenStore.destroy();
  });

  describe('Admin CRUD', () => {
    it('should list admins', async () => {
      const res = await adminAgent.get('/api/administrateurs');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should create a new admin', async () => {
      const res = await adminAgent
        .post('/api/administrateurs')
        .send({ nom: 'NewAdmin', email: newAdminEmail, password });
      expect(res.statusCode).toBe(201);
      const userId = res.body.data?.adminId;
      const [[adminRecord]] = await pool.execute("SELECT id FROM administrateurs WHERE user_id = ?", [userId]);
      newAdminId = adminRecord?.id;
    });

    it('should reject admin creation with invalid data', async () => {
      const res = await adminAgent
        .post('/api/administrateurs')
        .send({ nom: '', email: 'bad' });
      expect(res.statusCode).toBe(400);
    });

    it('should get admin by id', async () => {
      if (!newAdminId) return;
      const res = await adminAgent.get(`/api/administrateurs/${newAdminId}`);
      expect(res.statusCode).toBe(200);
    });

    it('should update admin', async () => {
      if (!newAdminId) return;
      const res = await adminAgent
        .put(`/api/administrateurs/${newAdminId}`)
        .send({ nom: 'UpdatedAdmin' });
      expect(res.statusCode).toBe(200);
    });

    it('should delete admin', async () => {
      if (!newAdminId) return;
      const res = await adminAgent.delete(`/api/administrateurs/${newAdminId}`);
      expect(res.statusCode).toBe(200);
      newAdminId = null;
    });

    it('should return 404 for non-existent admin', async () => {
      const res = await adminAgent.get('/api/administrateurs/999999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Category Management', () => {
    it('should list categories (public)', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create category as admin', async () => {
      const res = await adminAgent
        .post('/api/categories')
        .send({ nom: `CatTest_${ts}`, description: 'Test cat' });
      expect(res.statusCode).toBe(201);
      categoryId = res.body.data?.id;
    });

    it('should update category as admin', async () => {
      if (!categoryId) return;
      const res = await adminAgent
        .put(`/api/categories/${categoryId}`)
        .send({ nom: `UpdatedCat_${ts}` });
      expect(res.statusCode).toBe(200);
    });

    it('should delete category as admin', async () => {
      if (!categoryId) return;
      const res = await adminAgent.delete(`/api/categories/${categoryId}`);
      expect(res.statusCode).toBe(200);
      categoryId = null;
    });

    it('should reject category creation by non-admin', async () => {
      const res = await clientAgent
        .post('/api/categories')
        .send({ nom: 'Nope' });
      expect(res.statusCode).toBe(403);
    });

    it('should reject category update by non-admin', async () => {
      const res = await clientAgent
        .put('/api/categories/1')
        .send({ nom: 'Nope' });
      expect(res.statusCode).toBe(403);
    });

    it('should get category by id', async () => {
      const [[row]] = await pool.execute("SELECT id FROM categories LIMIT 1");
      if (!row) return;
      const res = await request(app).get(`/api/categories/${row.id}`);
      expect(res.statusCode).toBe(200);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).get('/api/categories/999999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Security', () => {
    it('should reject unauthenticated admin access', async () => {
      const res = await request(app).get('/api/administrateurs');
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-admin user', async () => {
      const res = await clientAgent.get('/api/administrateurs');
      expect(res.statusCode).toBe(403);
    });

    it('should reject non-admin category creation', async () => {
      const res = await clientAgent.post('/api/categories').send({ nom: 'Nope' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Dashboard Stats', () => {
    it('should return overview stats', async () => {
      const res = await request(app).get('/api/stats/overview');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('techniciens');
      expect(res.body.data).toHaveProperty('reservations');
      expect(res.body.data).toHaveProperty('reviews');
    });
  });
});
