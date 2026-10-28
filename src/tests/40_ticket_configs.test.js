const request = require('supertest');
const server = require('../../app');
const { ticketConfigs, branches } = require('../models/index');

let superadminToken = '';
let regularUserToken = '';

const api = request(server.app);

const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const regularUserData = {
  name: 'Regular User TicketConfigs Test',
  email: 'user_ticketconfigs@test.com',
  role: 'user',
  password: 'Test1234'
};

/**
 * Tests para el módulo de Ticket Configs
 *
 * GET /api/ticket-configs
 *   1. Listar globales → 200 con sale y payment
 *   2. Sin token → 401
 *   3. Usuario sin privilegio → 403
 *
 * GET /api/ticket-configs/resolve
 *   4. type=sale → 200 con config y company
 *   5. type inválido → 400
 *   6. Sin token → 401
 *   7. Con config de sucursal → devuelve la de la sucursal
 *   8. Sucursal sin config propia → cae a la global
 *
 * PUT /api/ticket-configs/:type
 *   9. Actualizar campos → 200 y resolve refleja el cambio
 *   10. Body sin campos editables → 400
 *   11. paper_width inválido → 400
 *   12. Booleano inválido → 400
 *   13. Tipo inexistente → 400
 *   14. Sin token → 401
 *   15. Usuario sin privilegio → 403
 */

describe('[TICKET_CONFIGS] Test api ticket-configs /api/ticket-configs', () => {
  beforeAll(async () => {
    let loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(superadminLogin);

    if (loginRes.status !== 200) {
      await api
        .post('/api/auth/registerSuperUser')
        .send({
          name: 'Super admin',
          email: 'superadmin@estelaris.com',
          role: 'superadmin',
          password: 'Admin123'
        });
    }

    loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(superadminLogin);

    superadminToken = loginRes.body.sesion.token;

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
  // GET /api/ticket-configs
  // ============================================
  describe('GET /api/ticket-configs', () => {
    test('1. Listar globales. Expect 200 con sale y payment', async () => {
      const response = await api
        .get('/api/ticket-configs')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(Array.isArray(response.body.configs)).toBe(true);
      const types = response.body.configs.map((c) => c.type).sort();
      expect(types).toEqual(['payment', 'sale']);
      response.body.configs.forEach((c) => expect(c.branch_id).toBeNull());
    });

    test('2. Sin token. Expect 401', async () => {
      await api.get('/api/ticket-configs').expect(401);
    });

    test('3. Usuario sin privilegio. Expect 403', async () => {
      if (!regularUserToken) {
        console.warn('Skipping: regularUserToken not available');
        return;
      }

      const response = await api
        .get('/api/ticket-configs')
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);

      expect(response.body.code).toBe('NOT_PRIVILEGE');
    });
  });

  // ============================================
  // GET /api/ticket-configs/resolve
  // ============================================
  describe('GET /api/ticket-configs/resolve', () => {
    let branchId;
    let branchRow;

    beforeAll(async () => {
      const branch = await branches.findOne();
      branchId = branch.id;
    });

    afterAll(async () => {
      if (branchRow) {
        await branchRow.destroy({ force: true });
      }
    });

    test('4. type=sale. Expect 200 con config y company', async () => {
      const response = await api
        .get('/api/ticket-configs/resolve?type=sale')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body.config.type).toBe('sale');
      expect(response.body.config.branch_id).toBeNull();
      expect(typeof response.body.config.show_iva).toBe('boolean');
      expect(response.body).toHaveProperty('company');
      expect(response.body.company).toHaveProperty('logo_url');
    });

    test('5. type inválido. Expect 400', async () => {
      await api
        .get('/api/ticket-configs/resolve?type=invoice')
        .auth(superadminToken, { type: 'bearer' })
        .expect(400);
    });

    test('6. Sin token. Expect 401', async () => {
      await api.get('/api/ticket-configs/resolve?type=sale').expect(401);
    });

    test('7. Con config de sucursal. Expect la de la sucursal', async () => {
      branchRow = await ticketConfigs.create({
        branch_id: branchId,
        type: 'sale',
        title: 'TICKET SUCURSAL',
        show_iva: false
      });

      const response = await api
        .get('/api/ticket-configs/resolve?type=sale')
        .auth(superadminToken, { type: 'bearer' })
        .set('x-branch-id', String(branchId))
        .expect(200);

      expect(response.body.config.branch_id).toBe(branchId);
      expect(response.body.config.title).toBe('TICKET SUCURSAL');
      expect(response.body.config.show_iva).toBe(false);
    });

    test('8. Sucursal sin config propia. Expect la global', async () => {
      const response = await api
        .get('/api/ticket-configs/resolve?type=payment')
        .auth(superadminToken, { type: 'bearer' })
        .set('x-branch-id', String(branchId))
        .expect(200);

      expect(response.body.config.branch_id).toBeNull();
      expect(response.body.config.type).toBe('payment');
    });
  });

  // ============================================
  // PUT /api/ticket-configs/:type
  // ============================================
  describe('PUT /api/ticket-configs/:type', () => {
    // Los tests modifican la fila global; se restaura para no contaminar otras suites ni corridas
    afterAll(async () => {
      await ticketConfigs.update(
        {
          title: 'COMPROBANTE DE ABONO',
          footer_text: 'Conserve este comprobante',
          show_logo: true,
          show_barcode: true,
          paper_width: '80mm'
        },
        { where: { type: 'payment', branch_id: null } }
      );
    });

    test('9. Actualizar campos. Expect 200 y resolve refleja el cambio', async () => {
      const response = await api
        .put('/api/ticket-configs/payment')
        .auth(superadminToken, { type: 'bearer' })
        .send({
          title: 'ABONO TEST',
          footer_text: 'Gracias por su pago',
          show_barcode: false,
          paper_width: '58mm'
        })
        .expect(200);

      expect(response.body.config.title).toBe('ABONO TEST');
      expect(response.body.config.show_barcode).toBe(false);
      expect(response.body.config.paper_width).toBe('58mm');
      // Los campos no enviados se conservan
      expect(response.body.config.show_iva).toBe(true);

      const resolved = await api
        .get('/api/ticket-configs/resolve?type=payment')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(resolved.body.config.footer_text).toBe('Gracias por su pago');
      expect(resolved.body.config.paper_width).toBe('58mm');
    });

    test('9b. null limpia un texto, solo o junto a otros campos. Expect 200 con null', async () => {
      await api
        .put('/api/ticket-configs/payment')
        .auth(superadminToken, { type: 'bearer' })
        .send({ footer_text: 'Texto temporal' })
        .expect(200);

      const alone = await api
        .put('/api/ticket-configs/payment')
        .auth(superadminToken, { type: 'bearer' })
        .send({ footer_text: null })
        .expect(200);

      expect(alone.body.config.footer_text).toBeNull();

      await api
        .put('/api/ticket-configs/payment')
        .auth(superadminToken, { type: 'bearer' })
        .send({ footer_text: 'Texto temporal' })
        .expect(200);

      const withOther = await api
        .put('/api/ticket-configs/payment')
        .auth(superadminToken, { type: 'bearer' })
        .send({ footer_text: null, show_logo: false })
        .expect(200);

      expect(withOther.body.config.footer_text).toBeNull();
      expect(withOther.body.config.show_logo).toBe(false);
    });

    test('10. Body sin campos editables. Expect 400', async () => {
      await api
        .put('/api/ticket-configs/sale')
        .auth(superadminToken, { type: 'bearer' })
        .send({ foo: 'bar' })
        .expect(400);
    });

    test('11. paper_width inválido. Expect 400', async () => {
      await api
        .put('/api/ticket-configs/sale')
        .auth(superadminToken, { type: 'bearer' })
        .send({ paper_width: '100mm' })
        .expect(400);
    });

    test('12. Booleano inválido. Expect 400', async () => {
      await api
        .put('/api/ticket-configs/sale')
        .auth(superadminToken, { type: 'bearer' })
        .send({ show_iva: 'banana' })
        .expect(400);
    });

    test('13. Tipo inexistente. Expect 400', async () => {
      await api
        .put('/api/ticket-configs/invoice')
        .auth(superadminToken, { type: 'bearer' })
        .send({ title: 'X' })
        .expect(400);
    });

    test('14. Sin token. Expect 401', async () => {
      await api
        .put('/api/ticket-configs/sale')
        .send({ title: 'X' })
        .expect(401);
    });

    test('15. Usuario sin privilegio. Expect 403', async () => {
      if (!regularUserToken) {
        console.warn('Skipping: regularUserToken not available');
        return;
      }

      await api
        .put('/api/ticket-configs/sale')
        .auth(regularUserToken, { type: 'bearer' })
        .send({ title: 'X' })
        .expect(403);
    });
  });
});
