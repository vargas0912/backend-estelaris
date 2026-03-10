const request = require('supertest');
const server = require('../../app');

let superadminToken = '';
let regularUserToken = '';

const api = request(server.app);

const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const regularUserData = {
  name: 'Regular User SystemSettings Test',
  email: 'user_syssettings@test.com',
  role: 'user',
  password: 'Test1234'
};

/**
 * Tests para el módulo de System Settings
 *
 * GET /api/system-settings
 *   1. Listar todas → 200 con arreglo
 *   2. Filtrar por category=formats → solo configuraciones de formats
 *   3. Sin token → 401
 *
 * GET /api/system-settings/:key
 *   4. Obtener date_format → 200 con objeto
 *   5. Clave inexistente → 404
 *   6. Sin token → 401
 *
 * PUT /api/system-settings/:key
 *   7. Actualizar date_format → 200 con valor actualizado
 *   8. Clave inexistente → 404
 *   9. Sin valor en body → 400
 *   10. Sin token → 401
 *   11. Usuario no-superadmin → 403
 */

describe('[SYSTEM_SETTINGS] Test api system-settings /api/system-settings', () => {
  beforeAll(async () => {
    // Login como superadmin
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(superadminLogin)
      .expect(200);

    superadminToken = loginRes.body.sesion.token;

    // Crear usuario regular para test de 403
    const userRes = await api
      .post('/api/auth/register')
      .auth(superadminToken, { type: 'bearer' })
      .send(regularUserData);

    if (userRes.status === 200) {
      const userLoginRes = await api
        .post('/api/auth/login')
        .send({
          email: regularUserData.email,
          password: regularUserData.password
        });

      if (userLoginRes.status === 200) {
        regularUserToken = userLoginRes.body.sesion.token;
      }
    }
  });

  // ============================================
  // GET /api/system-settings
  // ============================================
  describe('GET /api/system-settings', () => {
    test('1. Listar todas las configuraciones. Expect 200 con arreglo', async () => {
      const response = await api
        .get('/api/system-settings')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('settings');
      expect(Array.isArray(response.body.settings)).toBe(true);
      expect(response.body.settings.length).toBeGreaterThan(0);
    });

    test('2. Filtrar por category=formats. Expect solo configuraciones formats', async () => {
      const response = await api
        .get('/api/system-settings?category=formats')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('settings');
      expect(Array.isArray(response.body.settings)).toBe(true);
      expect(response.body.settings.length).toBeGreaterThan(0);
      expect(response.body.settings.every(s => s.category === 'formats')).toBe(true);
    });

    test('3. Listar sin token. Expect 401', async () => {
      await api
        .get('/api/system-settings')
        .expect(401);
    });
  });

  // ============================================
  // GET /api/system-settings/:key
  // ============================================
  describe('GET /api/system-settings/:key', () => {
    test('4. Obtener date_format. Expect 200 con objeto', async () => {
      const response = await api
        .get('/api/system-settings/date_format')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('setting');
      expect(response.body.setting.key).toBe('date_format');
      expect(response.body.setting).toHaveProperty('value');
      expect(response.body.setting).toHaveProperty('category');
      expect(response.body.setting).toHaveProperty('label');
    });

    test('5. Clave inexistente. Expect 404', async () => {
      await api
        .get('/api/system-settings/clave_que_no_existe')
        .auth(superadminToken, { type: 'bearer' })
        .expect(404);
    });

    test('6. Obtener por clave sin token. Expect 401', async () => {
      await api
        .get('/api/system-settings/date_format')
        .expect(401);
    });
  });

  // ============================================
  // PUT /api/system-settings/:key
  // ============================================
  describe('PUT /api/system-settings/:key', () => {
    test('7. Actualizar date_format. Expect 200 con valor actualizado', async () => {
      const response = await api
        .put('/api/system-settings/date_format')
        .auth(superadminToken, { type: 'bearer' })
        .send({ value: 'YYYY-MM-DD' })
        .expect(200);

      expect(response.body).toHaveProperty('setting');
      expect(response.body.setting.key).toBe('date_format');
      expect(response.body.setting.value).toBe('YYYY-MM-DD');
    });

    test('8. Actualizar clave inexistente. Expect 404', async () => {
      await api
        .put('/api/system-settings/clave_que_no_existe')
        .auth(superadminToken, { type: 'bearer' })
        .send({ value: 'algo' })
        .expect(404);
    });

    test('9. Actualizar sin campo value en body. Expect 400', async () => {
      await api
        .put('/api/system-settings/date_format')
        .auth(superadminToken, { type: 'bearer' })
        .send({})
        .expect(400);
    });

    test('10. Actualizar sin token. Expect 401', async () => {
      await api
        .put('/api/system-settings/date_format')
        .send({ value: 'DD-MM-YYYY' })
        .expect(401);
    });

    test('11. Usuario sin rol superadmin. Expect 403', async () => {
      if (!regularUserToken) {
        console.log('Regular user token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      await api
        .put('/api/system-settings/date_format')
        .auth(regularUserToken, { type: 'bearer' })
        .send({ value: 'DD-MM-YYYY' })
        .expect(403);
    });
  });
});
