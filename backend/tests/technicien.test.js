process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('TECHNICIEN MODULE TESTS', () => {
  const ts = Date.now();
  const adminEmail = `tech_admin_${ts}@mail.com`;
  const password = 'Test1234!';

  let adminAgent, adminUserId;
  let technicienId;

  beforeAll(async () => {
    adminAgent = request.agent(app);

    await adminAgent.post('/api/auth/register').send({
      email: adminEmail, password, nom: 'TechAdm', prenom: 'Test',
    });
    const [[adminRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    adminUserId = adminRow.id;
    await pool.execute("INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)", [adminUserId, 'TechAdm']);

    const [[existingTech]] = await pool.execute(
      "SELECT id FROM techniciens WHERE est_verifie = 1 LIMIT 1"
    );
    if (existingTech) {
      technicienId = existingTech.id;
    } else {
      const techAgent2 = request.agent(app);
      const techEmail2 = `tech_data_${ts}@mail.com`;
      await techAgent2.post('/api/auth/register').send({
        email: techEmail2, password, nom: 'TechData', prenom: 'Test',
      });
      const [[techRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [techEmail2]);
      const [tp] = await pool.execute(
        "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, adresse, est_verifie) VALUES (?, ?, ?, ?, ?, ?, 1)",
        [techRow.id, 'TechData', 'Test', '+22212345678', 'Plomberie', 'Nouakchott']
      );
      technicienId = tp.insertId;
    }
  });

  afterAll(async () => {
    if (adminUserId) {
      await pool.execute('DELETE FROM administrateurs WHERE user_id = ?', [adminUserId]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [adminUserId]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [adminUserId]);
      await tokenStore.revokeAllForUser(adminUserId);
      await pool.execute('DELETE FROM users WHERE id = ?', [adminUserId]);
    }
    tokenStore.destroy();
  });

  describe('Public Endpoints', () => {
    it('should list verified technicians (public)', async () => {
      const res = await request(app).get('/api/techniciens/public');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should list technicians via root endpoint', async () => {
      const res = await request(app).get('/api/techniciens');
      expect(res.statusCode).toBe(200);
    });

    it('should get public profile of a verified technician', async () => {
      const res = await request(app).get(`/api/techniciens/public/${technicienId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('technicien');
      expect(res.body.data).toHaveProperty('galerie');
      expect(res.body.data).toHaveProperty('avis');
    });

    it('should return 404 for non-existent technician profile', async () => {
      const res = await request(app).get('/api/techniciens/public/999999');
      expect(res.statusCode).toBe(404);
    });

    it('should return 404 for unverified technician', async () => {
      const ts2 = Date.now();
      const unverifiedAgent = request.agent(app);
      const unverifiedEmail = `unverified_${ts2}@mail.com`;
      await unverifiedAgent.post('/api/auth/register').send({
        email: unverifiedEmail, password, nom: 'Unverified', prenom: 'Tech',
      });
      const [[uvRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [unverifiedEmail]);
      const [uv] = await pool.execute(
        "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, est_verifie) VALUES (?, ?, ?, ?, ?, 0)",
        [uvRow.id, 'Unverified', 'Tech', '+22200000000', 'Autre']
      );
      const res = await request(app).get(`/api/techniciens/public/${uv.insertId}`);
      expect(res.statusCode).toBe(404);
      await pool.execute('DELETE FROM techniciens WHERE id = ?', [uv.insertId]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [uvRow.id]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [uvRow.id]);
      await tokenStore.revokeAllForUser(uvRow.id);
      await pool.execute('DELETE FROM users WHERE id = ?', [uvRow.id]);
    });
  });

  describe('Search', () => {
    it('should search technicians by name', async () => {
      const res = await request(app).get('/api/techniciens/search?q=Tech');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should search by specialite', async () => {
      const res = await request(app).get('/api/techniciens/search?specialite=Plomberie');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return empty for non-existent search', async () => {
      const res = await request(app).get('/api/techniciens/search?q=ZZZZNONEXISTENT');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('Admin Technician Management', () => {
    it('should list all technicians as admin', async () => {
      const res = await adminAgent.get('/api/techniciens/all');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
    });

    it('should get technician by id as admin', async () => {
      const res = await adminAgent.get(`/api/techniciens/${technicienId}`);
      expect(res.statusCode).toBe(200);
    });

    it('should update technician as admin', async () => {
      const res = await adminAgent
        .put(`/api/techniciens/${technicienId}`)
        .send({ nom: 'UpdatedTech' });
      expect(res.statusCode).toBe(200);
    });

    it('should reject non-admin access to admin endpoints', async () => {
      const clientAgent = request.agent(app);
      const clientEmail = `tech_client_${ts}@mail.com`;
      await clientAgent.post('/api/auth/register').send({
        email: clientEmail, password, nom: 'No', prenom: 'Admin',
      });
      const res = await clientAgent.get('/api/techniciens/all');
      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent technician', async () => {
      const res = await adminAgent.get('/api/techniciens/999999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Demande (Registration Request)', () => {
    it('should reject demande without required fields', async () => {
      const res = await request(app)
        .post('/api/techniciens/demande')
        .send({ nom: 'Test' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject demande with invalid email', async () => {
      const res = await request(app)
        .post('/api/techniciens/demande')
        .send({
          nom: 'Demande', prenom: 'Test', email: 'bademail', specialite: 'Test',
        });
      expect(res.statusCode).toBe(400);
    });

    it('should reject demande with existing email', async () => {
      const res = await request(app)
        .post('/api/techniciens/demande')
        .send({
          nom: 'Demande', prenom: 'Test', email: adminEmail, specialite: 'Plomberie',
        });
      expect([400, 409]).toContain(res.statusCode);
    });
  });
});
