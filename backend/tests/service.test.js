process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('SERVICE MODULE TESTS', () => {
  const ts = Date.now();
  const techEmail = `svc_tech_${ts}@mail.com`;
  const adminEmail = `svc_admin_${ts}@mail.com`;
  const otherTechEmail = `svc_other_${ts}@mail.com`;
  const clientEmail = `svc_client_${ts}@mail.com`;
  const password = 'Test1234!';

  let techAgent, adminAgent;
  let technicienId, serviceId, categoryId, techUserId, adminUserId;

  beforeAll(async () => {
    techAgent = request.agent(app);
    adminAgent = request.agent(app);

    await techAgent.post('/api/auth/register').send({
      email: techEmail, password, nom: 'SvcTech', prenom: 'Test',
    });
    const [[techRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [techEmail]);
    techUserId = techRow.id;
    const [tp] = await pool.execute(
      "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, est_verifie) VALUES (?, ?, ?, ?, ?, 1)",
      [techUserId, 'SvcTech', 'Test', '+22212345678', 'Electricite']
    );
    technicienId = tp.insertId;

    await adminAgent.post('/api/auth/register').send({
      email: adminEmail, password, nom: 'SvcAdmin', prenom: 'Test',
    });
    const [[adminRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    adminUserId = adminRow.id;
    await pool.execute("INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)", [adminUserId, 'SvcAdmin']);

    const [[existingCat]] = await pool.execute("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const [cr] = await pool.execute("INSERT INTO categories (nom) VALUES (?)", [`SvcCat_${ts}`]);
      categoryId = cr.insertId;
    }

    const [sr] = await pool.execute(
      "INSERT INTO services (technicien_id, categorie_id, titre, description, prix, duree, est_actif) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [technicienId, categoryId, `TestService_${ts}`, 'Description test', 10000, 60]
    );
    serviceId = sr.insertId;
  });

  afterAll(async () => {
    if (serviceId) {
      await pool.execute('DELETE FROM reservations WHERE service_id = ?', [serviceId]);
      await pool.execute('DELETE FROM services WHERE id = ?', [serviceId]);
    }
    if (technicienId) {
      await pool.execute('DELETE FROM services WHERE technicien_id = ?', [technicienId]);
      await pool.execute('DELETE FROM techniciens WHERE id = ?', [technicienId]);
    }
    for (const uid of [techUserId, adminUserId]) {
      if (!uid) continue;
      await pool.execute('DELETE FROM administrateurs WHERE user_id = ?', [uid]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [uid]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [uid]);
      await tokenStore.revokeAllForUser(uid);
      await pool.execute('DELETE FROM users WHERE id = ?', [uid]);
    }
    tokenStore.destroy();
  });

  describe('Public Endpoints', () => {
    it('should list active services with pagination', async () => {
      const res = await request(app).get('/api/services?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should return default pagination', async () => {
      const res = await request(app).get('/api/services');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('total');
    });

    it('should search services by query', async () => {
      const res = await request(app).get('/api/services/search?q=Test');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should search services with filters', async () => {
      const res = await request(app).get(`/api/services/search?categorie_id=${categoryId}&prix_min=0&prix_max=50000`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should return empty results for non-existent search', async () => {
      const res = await request(app).get('/api/services/search?q=ZZZZNONEXISTENT');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(0);
    });
  });

  describe('Technicien Service Management', () => {
    it('should get technicien own services', async () => {
      const res = await techAgent.get('/api/services/mine');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create a service', async () => {
      const res = await techAgent
        .post('/api/services')
        .send({
          categorie_id: categoryId,
          titre: `NewService_${ts}`,
          description: 'Nouveau service',
          prix: 8000,
          duree: 45,
        });
      expect(res.statusCode).toBe(201);
    });

    it('should update a service', async () => {
      const res = await techAgent
        .put(`/api/services/${serviceId}`)
        .send({ titre: `Updated_${ts}`, prix: 12000 });
      expect(res.statusCode).toBe(200);
    });

    it('should reject update by another technicien', async () => {
      const otherAgent = request.agent(app);
      await otherAgent.post('/api/auth/register').send({
        email: otherTechEmail, password, nom: 'Other', prenom: 'Tech',
      });
      const [[otherRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [otherTechEmail]);
      await pool.execute(
        "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, est_verifie) VALUES (?, ?, ?, ?, ?, 1)",
        [otherRow.id, 'Other', 'Tech', '+22299999999', 'Autre']
      );

      const res = await otherAgent.put(`/api/services/${serviceId}`).send({ titre: 'Hacked' });
      expect(res.statusCode).toBe(403);
    });

    it('should delete a service', async () => {
      const [newService] = await pool.execute(
        "INSERT INTO services (technicien_id, categorie_id, titre, prix, est_actif) VALUES (?, ?, ?, ?, 1)",
        [technicienId, categoryId, `ToDelete_${ts}`, 1000]
      );
      const res = await techAgent.delete(`/api/services/${newService.insertId}`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject unauthenticated create', async () => {
      const res = await request(app)
        .post('/api/services')
        .send({ categorie_id: categoryId, titre: 'Nope' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Admin Service Management', () => {
    it('should list all services as admin', async () => {
      const res = await adminAgent.get('/api/services/all');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
    });

    it('should toggle service active status', async () => {
      const res = await adminAgent.put(`/api/services/${serviceId}/toggle`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject toggle by non-admin', async () => {
      const res = await techAgent.put(`/api/services/${serviceId}/toggle`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Non-existent Service', () => {
    it('should return not found for non-existent service', async () => {
      const res = await techAgent.put('/api/services/999999').send({ titre: 'Nope' });
      expect(res.statusCode).toBe(404);
    });

    it('should reject delete of non-existent service', async () => {
      const res = await techAgent.delete('/api/services/999999');
      expect(res.statusCode).toBe(404);
    });
  });
});
