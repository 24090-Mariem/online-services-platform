process.env.CSRF_ENABLED = 'false';
process.env.COOKIE_SECURE = 'false';

const request = require('supertest');
const app = require('../server');
const pool = require('../config/db');
const tokenStore = require('../utils/tokenStore');

jest.setTimeout(20000);

describe('RESERVATION MODULE TESTS', () => {
  const ts = Date.now();
  const clientEmail = `res_client_${ts}@mail.com`;
  const techEmail = `res_tech_${ts}@mail.com`;
  const adminEmail = `res_admin_${ts}@mail.com`;
  const password = 'Test1234!';

  let clientAgent, techAgent, adminAgent;
  let clientId, clientUserId, technicienId, techUserId, serviceId, categoryId, reservationId;

  beforeAll(async () => {
    clientAgent = request.agent(app);
    techAgent = request.agent(app);
    adminAgent = request.agent(app);

    await clientAgent.post('/api/auth/register').send({
      email: clientEmail, password, nom: 'ResClient', prenom: 'Test',
    });
    const [[clientRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [clientEmail]);
    clientUserId = clientRow.id;
    const [[clProfile]] = await pool.execute("SELECT id FROM clients WHERE user_id = ?", [clientUserId]);
    clientId = clProfile.id;

    await techAgent.post('/api/auth/register').send({
      email: techEmail, password, nom: 'ResTech', prenom: 'Test',
    });
    const [[techRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [techEmail]);
    techUserId = techRow.id;
    const [techProfile] = await pool.execute(
      "INSERT INTO techniciens (user_id, nom, prenom, telephone, specialite, est_verifie) VALUES (?, ?, ?, ?, ?, 1)",
      [techUserId, 'ResTech', 'Test', '+22212345678', 'Plomberie']
    );
    technicienId = techProfile.insertId;

    await adminAgent.post('/api/auth/register').send({
      email: adminEmail, password, nom: 'ResAdmin', prenom: 'Test',
    });
    const [[adminRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    await pool.execute("INSERT INTO administrateurs (user_id, nom) VALUES (?, ?)", [adminRow.id, 'ResAdmin']);

    const [[existingCat]] = await pool.execute("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const [cr] = await pool.execute("INSERT INTO categories (nom) VALUES (?)", [`Cat_${ts}`]);
      categoryId = cr.insertId;
    }

    const [sr] = await pool.execute(
      "INSERT INTO services (technicien_id, categorie_id, titre, description, prix, est_actif) VALUES (?, ?, ?, ?, ?, 1)",
      [technicienId, categoryId, `Service_${ts}`, 'Test service', 5000]
    );
    serviceId = sr.insertId;
  });

  afterAll(async () => {
    if (reservationId) {
      await pool.execute('DELETE FROM avis WHERE reservation_id = ?', [reservationId]);
      await pool.execute('DELETE FROM reservations WHERE id = ?', [reservationId]);
    }
    if (serviceId) {
      await pool.execute('DELETE FROM reservations WHERE service_id = ?', [serviceId]);
      await pool.execute('DELETE FROM services WHERE id = ?', [serviceId]);
    }
    if (technicienId) {
      await pool.execute('DELETE FROM techniciens WHERE id = ?', [technicienId]);
    }

    for (const uid of [clientUserId, techUserId]) {
      if (!uid) continue;
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [uid]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [uid]);
      await tokenStore.revokeAllForUser(uid);
      await pool.execute('DELETE FROM users WHERE id = ?', [uid]);
    }

    const [[adminUserRow]] = await pool.execute("SELECT id FROM users WHERE email = ?", [adminEmail]);
    if (adminUserRow) {
      await pool.execute('DELETE FROM administrateurs WHERE user_id = ?', [adminUserRow.id]);
      await pool.execute('DELETE FROM clients WHERE user_id = ?', [adminUserRow.id]);
      await pool.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [adminUserRow.id]);
      await tokenStore.revokeAllForUser(adminUserRow.id);
      await pool.execute('DELETE FROM users WHERE id = ?', [adminUserRow.id]);
    }

    tokenStore.destroy();
  });

  describe('Create Reservation', () => {
    it('should create a reservation as client', async () => {
      const res = await clientAgent
        .post('/api/reservations')
        .send({ service_id: serviceId, notes: 'Test reservation' });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      reservationId = res.body.data?.reservationId;
    });

    it('should reject reservation without service_id', async () => {
      const res = await clientAgent
        .post('/api/reservations')
        .send({ notes: 'Missing service' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject reservation with invalid service_id', async () => {
      const res = await clientAgent
        .post('/api/reservations')
        .send({ service_id: 999999 });
      expect(res.statusCode).toBe(404);
    });

    it('should reject reservation by non-client', async () => {
      const res = await techAgent
        .post('/api/reservations')
        .send({ service_id: serviceId });
      expect(res.statusCode).toBe(403);
    });

    it('should reject duplicate active reservation for same service', async () => {
      const res = await clientAgent
        .post('/api/reservations')
        .send({ service_id: serviceId, notes: 'Duplicate' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/déjà/i);
    });
  });

  describe('Get Reservations', () => {
    it('should get client reservations', async () => {
      const res = await clientAgent.get('/api/reservations/mine');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get technicien reservations', async () => {
      const res = await techAgent.get('/api/reservations/technicien');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/reservations/mine');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Reservation Status Transitions', () => {
    it('should accept reservation', async () => {
      if (!reservationId) return;
      const res = await techAgent.put(`/api/reservations/${reservationId}/accept`);
      expect(res.statusCode).toBe(200);
    });

    it('should complete reservation', async () => {
      if (!reservationId) return;
      const res = await techAgent.put(`/api/reservations/${reservationId}/complete`);
      expect(res.statusCode).toBe(200);
    });

    it('should reject completing already completed reservation', async () => {
      if (!reservationId) return;
      const res = await techAgent.put(`/api/reservations/${reservationId}/complete`);
      expect(res.statusCode).toBe(400);
    });

    it('should reject accepting non-pending reservation', async () => {
      if (!reservationId) return;
      const res = await techAgent.put(`/api/reservations/${reservationId}/accept`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Admin Access', () => {
    it('should get reservations by user (admin)', async () => {
      const res = await adminAgent.get(`/api/reservations/user/${clientId}`);
      expect([200, 404]).toContain(res.statusCode);
    });

    it('should reject non-admin access to user reservations', async () => {
      const res = await clientAgent.get(`/api/reservations/user/${clientId}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Non-existent Reservation', () => {
    it('should reject accept for non-existent reservation', async () => {
      const res = await techAgent.put('/api/reservations/999999/accept');
      expect(res.statusCode).toBe(404);
    });

    it('should reject reject for non-existent reservation', async () => {
      const res = await techAgent.put('/api/reservations/999999/reject');
      expect(res.statusCode).toBe(404);
    });
  });
});
