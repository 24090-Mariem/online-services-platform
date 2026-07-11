process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('SEARCH MODULE TESTS', () => {
  const ts = Date.now();
  let techUserId;

  beforeAll(async () => {
    const [[existingTech]] = await pool.execute(
      "SELECT id, user_id FROM techniciens WHERE est_verifie = 1 LIMIT 1"
    );
    if (!existingTech) {
      const techAgent = request.agent(app);
      const techEmail = `search_tech_${ts}@mail.com`;
      await techAgent.post('/api/auth/register').send({
        email: techEmail, password: 'Test1234!', nom: 'SearchTech', prenom: 'Test',
      });
      const [[techRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [techEmail]);
      techUserId = techRow.id;
      await pool.execute(
        "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, adresse, est_verifie) VALUES (?, ?, ?, ?, ?, ?, 1)",
        [techRow.id, 'SearchTech', 'Test', '+22212345678', 'Plomberie', 'Nouakchott']
      );
    }
  });

  afterAll(async () => {
    if (techUserId) {
      await pool.execute('DELETE FROM techniciens WHERE user_id = ?', [techUserId]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [techUserId]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [techUserId]);
      await tokenStore.revokeAllForUser(techUserId);
      await pool.execute('DELETE FROM users WHERE id = ?', [techUserId]);
    }
    tokenStore.destroy();
  });

  describe('Service Search', () => {
    it('should search services with empty query', async () => {
      const res = await request(app).get('/api/services/search');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should search services by keyword', async () => {
      const res = await request(app).get('/api/services/search?q=plomb');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should search services by category', async () => {
      const [[cat]] = await pool.execute("SELECT id FROM categories LIMIT 1");
      if (!cat) return;
      const res = await request(app).get(`/api/services/search?categorie_id=${cat.id}`);
      expect(res.statusCode).toBe(200);
    });

    it('should search services with price range', async () => {
      const res = await request(app).get('/api/services/search?prix_min=1000&prix_max=50000');
      expect(res.statusCode).toBe(200);
    });

    it('should search services with pagination', async () => {
      const res = await request(app).get('/api/services/search?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('should return empty for non-existent service search', async () => {
      const res = await request(app).get('/api/services/search?q=ZZZZNONEXISTENT_SERVICE');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(0);
    });

    it('should handle special characters in search', async () => {
      const res = await request(app).get('/api/services/search?q=<script>alert(1)</script>');
      expect(res.statusCode).toBe(200);
    });

    it('should handle unicode in search', async () => {
      const res = await request(app).get('/api/services/search?q=café');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Technicien Search', () => {
    it('should search technicians with empty query', async () => {
      const res = await request(app).get('/api/techniciens/search');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should search technicians by name', async () => {
      const res = await request(app).get('/api/techniciens/search?q=Search');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should search technicians by specialite', async () => {
      const res = await request(app).get('/api/techniciens/search?specialite=Plomberie');
      expect(res.statusCode).toBe(200);
    });

    it('should search technicians by city (adresse)', async () => {
      const res = await request(app).get('/api/techniciens/search?ville=Nouakchott');
      expect(res.statusCode).toBe(200);
    });

    it('should return empty for non-existent technician search', async () => {
      const res = await request(app).get('/api/techniciens/search?q=ZZZZNONEXISTENT_TECH');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should handle special characters in technician search', async () => {
      const res = await request(app).get('/api/techniciens/search?q=<script>');
      expect(res.statusCode).toBe(200);
    });

    it('should handle unicode in technician search', async () => {
      const res = await request(app).get('/api/techniciens/search?q=électricité');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Combined Filters', () => {
    it('should search services with multiple filters', async () => {
      const [[cat]] = await pool.execute("SELECT id FROM categories LIMIT 1");
      const params = new URLSearchParams();
      if (cat) params.set('categorie_id', cat.id);
      params.set('prix_min', '0');
      params.set('prix_max', '100000');
      params.set('page', '1');
      params.set('limit', '10');

      const res = await request(app).get(`/api/services/search?${params.toString()}`);
      expect(res.statusCode).toBe(200);
    });

    it('should handle pagination edge cases', async () => {
      const res = await request(app).get('/api/services/search?page=999&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.data.length).toBe(0);
    });

    it('should handle zero limit', async () => {
      const res = await request(app).get('/api/services/search?limit=0');
      expect(res.statusCode).toBe(200);
    });
  });
});
