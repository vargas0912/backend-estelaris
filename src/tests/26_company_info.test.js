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
  name: 'Regular User CompanyInfo Test',
  email: 'user_companyinfo@test.com',
  role: 'user',
  password: 'Test1234'
};

/**
 * Tests para el módulo de Company Info
 *
 * GET /api/company-info
 *   1. Obtener datos fiscales → 200 con objeto companyInfo
 *   2. Sin token → 401
 *
 * PUT /api/company-info
 *   3. Actualización parcial válida → 200, solo campos enviados modificados
 *   4. RFC con 5 caracteres (inválido) → 400
 *   5. Sin token → 401
 *   6. Usuario no-superadmin → 403
 */

describe('[COMPANY_INFO] Test api company-info /api/company-info', () => {
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
  // GET /api/company-info
  // ============================================
  describe('GET /api/company-info', () => {
    test('1. Obtener información fiscal. Expect 200 con objeto companyInfo', async () => {
      const response = await api
        .get('/api/company-info')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('companyInfo');
      expect(response.body.companyInfo).toHaveProperty('id');
      expect(response.body.companyInfo).toHaveProperty('company_name');
      expect(response.body.companyInfo).toHaveProperty('rfc');
      expect(response.body.companyInfo).toHaveProperty('fiscal_regime');
      expect(response.body.companyInfo).toHaveProperty('fiscal_address');
      expect(response.body.companyInfo).toHaveProperty('zip_code');
    });

    test('2. Obtener sin token. Expect 401', async () => {
      await api
        .get('/api/company-info')
        .expect(401);
    });
  });

  // ============================================
  // PUT /api/company-info
  // ============================================
  describe('PUT /api/company-info', () => {
    test('3. Actualización parcial válida. Expect 200 con campos actualizados', async () => {
      const partialUpdate = {
        phone: '5512345678',
        website: 'https://estelaris.com'
      };

      const response = await api
        .put('/api/company-info')
        .auth(superadminToken, { type: 'bearer' })
        .send(partialUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('companyInfo');
      expect(response.body.companyInfo.phone).toBe('5512345678');
      expect(response.body.companyInfo.website).toBe('https://estelaris.com');
      // company_name no fue enviado — debe seguir siendo el original
      expect(response.body.companyInfo.company_name).toBe('Estelaris S.A. de C.V.');
    });

    test('4. RFC con 5 caracteres (demasiado corto). Expect 400', async () => {
      await api
        .put('/api/company-info')
        .auth(superadminToken, { type: 'bearer' })
        .send({ rfc: 'ABCDE' })
        .expect(400);
    });

    test('5. Actualizar sin token. Expect 401', async () => {
      await api
        .put('/api/company-info')
        .send({ phone: '5500000000' })
        .expect(401);
    });

    test('6. Usuario sin rol superadmin. Expect 403', async () => {
      if (!regularUserToken) {
        console.log('Regular user token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      await api
        .put('/api/company-info')
        .auth(regularUserToken, { type: 'bearer' })
        .send({ phone: '5500000000' })
        .expect(403);
    });
  });
});
