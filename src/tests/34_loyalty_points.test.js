const request = require('supertest');
const server = require('../../app');

const { testAuthRegisterSuperAdmin } = require('./helper/helperData');

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

let Token = '';
let configId = null;
let customerId = null;
let addressId = null;
let saleWithPointsId = null;

// ─── Fixture helpers ───────────────────────────────────────────────────────────

const loyaltyConfigCreate = {
  branch_id: null,
  is_active: true,
  points_per_peso: '0.1000', // 1 punto por cada $10
  earn_on_tax: false,
  earn_on_discount: false,
  earn_on_credit: true,
  earn_on_credit_when: 'sale', // acreditar al crear (para poder probar en el mismo test)
  peso_per_point: '0.10', // 1 punto = $0.10
  min_points_redeem: 10, // umbral bajo para poder probar canje
  max_redeem_pct: '50.00',
  max_redeem_points: null,
  points_expiry_days: null,
  rounding_strategy: 'floor'
};

const loyaltyConfigUpdate = {
  is_active: true,
  min_points_redeem: 5
};

const loyaltyCustomerCreate = {
  name: 'Cliente Loyalty Test',
  email: 'loyalty.test@estelaris.com',
  mobile: '5551112222',
  is_international: false,
  country: 'México',
  municipality_id: 1
};

const loyaltyAddressCreate = (cId) => ({
  customer_id: cId,
  street: 'Calle Loyalty 100',
  neighborhood: 'Col. Test',
  postal_code: '06600',
  address_type: 'shipping',
  is_default: true,
  municipality_id: 1
});

const loyaltyPurchaseStock = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-03-01',
  purch_type: 'Contado',
  payment_method: 'Efectivo',
  items: [
    { product_id: 'TEST-001', qty: 200, unit_price: 50.00, discount: 0, tax_rate: 0 }
  ]
};

const saleContadoForPoints = (cId, aId) => ({
  branch_id: 1,
  customer_id: cId,
  customer_address_id: aId,
  employee_id: 1,
  sales_date: '2026-03-31',
  sales_type: 'Contado',
  items: [
    { product_id: 'TEST-001', qty: 5, unit_price: 100.00, discount: 0, tax_rate: 0 }
  ]
  // subtotal=500, tax=0, total=500 → points = floor(500 * 0.1) = 50
});

const saleContadoForRedeem = (cId, aId, pointsToRedeem) => ({
  branch_id: 1,
  customer_id: cId,
  customer_address_id: aId,
  employee_id: 1,
  sales_date: '2026-03-31',
  sales_type: 'Contado',
  points_redeemed: pointsToRedeem,
  items: [
    { product_id: 'TEST-001', qty: 10, unit_price: 100.00, discount: 0, tax_rate: 0 }
  ]
  // subtotal=1000, total=1000
  // redeeming 20 pts → discount = 20 * 0.10 = $2
});

/**
 * Tests para el módulo de Loyalty Points
 *
 * Setup: Login + crear compra y recibirla (stock), crear cliente + dirección
 *
 * POST /api/loyaltyPoints/config
 *   1. Crear configuración global → 201
 *   2. Sin token → 401
 *
 * GET /api/loyaltyPoints/config
 *   3. Obtener config activa → 200
 *
 * PUT /api/loyaltyPoints/config/:id
 *   4. Actualizar config → 200
 *   5. Id inexistente → 404
 *
 * POST /api/sales (con loyalty activo)
 *   6. Crear venta de contado → 200, points_earned > 0
 *   7. Verificar puntos acreditados en GET /customer/:id → total_points = 50
 *   8. Verificar historial → 1 transacción tipo 'earn'
 *
 * POST /api/sales con points_redeemed
 *   9.  Canjear puntos válidos → 200, points_discount en respuesta
 *  10.  Verificar saldo reducido → total_points disminuyó
 *  11.  Verificar 'redeem' en historial de transacciones
 *  12.  Canjear más puntos de los que tiene → 422
 *  13.  Canjear menos del mínimo (min=5, send=3) → 422
 *  14.  Canjear excediendo max_redeem_pct → 422
 *
 * POST /api/loyaltyPoints/customer/:id/adjust
 *  15.  Ajuste positivo → 200, saldo incrementa
 *  16.  Ajuste negativo → 200, saldo decrementa
 *  17.  Ajuste que deja saldo negativo → 422
 *  18.  Ajuste con amount=0 → 400
 *
 * Cancelar venta con puntos ganados
 *  19.  Cancelar venta de contado con puntos → 200, puntos revertidos
 *  20.  Verificar 'void' en historial
 *
 * POST /api/loyaltyPoints/expire
 *  21.  Procesar vencimientos (ninguno) → 200, affectedCustomers=0
 *
 * GET /api/loyaltyPoints/customer/:id/transactions con paginación
 *  22.  Historial paginado → 200, meta correcto
 */

describe('[LOYALTY POINTS] Test api loyalty /api/loyaltyPoints/', () => {
  beforeAll(async () => {
    // Registrar superadmin (idempotente si ya existe)
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin);

    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Crear cliente propio para los tests
    const custRes = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(loyaltyCustomerCreate)
      .expect(200);

    customerId = custRes.body.customer.id;

    // Crear dirección
    const addrRes = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(loyaltyAddressCreate(customerId))
      .expect(200);

    addressId = addrRes.body.address.id;

    // Crear compra y recibirla para tener stock
    const purchRes = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(loyaltyPurchaseStock)
      .expect(200);

    await api
      .patch(`/api/purchases/${purchRes.body.purchase.id}/receive`)
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .expect(200);
  });

  // ============================================================
  // POST /api/loyaltyPoints/config
  // ============================================================
  describe('POST /api/loyaltyPoints/config', () => {
    test('1. Crear configuración global de lealtad. Expect 201', async () => {
      const response = await api
        .post('/api/loyaltyPoints/config')
        .auth(Token, { type: 'bearer' })
        .send(loyaltyConfigCreate)
        .expect(201);

      expect(response.body).toHaveProperty('config');
      expect(response.body.config).toHaveProperty('id');

      configId = response.body.config.id;

      expect(response.body.config.is_active).toBe(true);
      // branch_id can be null or undefined depending on Sequelize serialization
      expect(response.body.config.branch_id ?? null).toBeNull();
      expect(parseFloat(response.body.config.points_per_peso)).toBe(0.1);
      expect(parseFloat(response.body.config.peso_per_point)).toBe(0.10);
    });

    test('2. Sin token → 401', async () => {
      await api
        .post('/api/loyaltyPoints/config')
        .send(loyaltyConfigCreate)
        .expect(401);
    });
  });

  // ============================================================
  // GET /api/loyaltyPoints/config
  // ============================================================
  describe('GET /api/loyaltyPoints/config', () => {
    test('3. Obtener configuración activa. Expect 200', async () => {
      const response = await api
        .get('/api/loyaltyPoints/config')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('config');
      expect(response.body.config.is_active).toBe(true);
    });
  });

  // ============================================================
  // PUT /api/loyaltyPoints/config/:id
  // ============================================================
  describe('PUT /api/loyaltyPoints/config/:id', () => {
    test('4. Actualizar configuración existente. Expect 200', async () => {
      const response = await api
        .put(`/api/loyaltyPoints/config/${configId}`)
        .auth(Token, { type: 'bearer' })
        .send(loyaltyConfigUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('config');
      expect(response.body.config.min_points_redeem).toBe(5);
    });

    test('5. Actualizar config con id inexistente. Expect 404', async () => {
      await api
        .put('/api/loyaltyPoints/config/999999')
        .auth(Token, { type: 'bearer' })
        .send({ is_active: false })
        .expect(404);
    });
  });

  // ============================================================
  // POST /api/sales — earn points
  // ============================================================
  describe('POST /api/sales — acumulación de puntos', () => {
    test('6. Crear venta de contado con loyalty activo → points_earned > 0', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleContadoForPoints(customerId, addressId))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.status).toBe('Pagado');
      // subtotal=500, points_per_peso=0.1, floor(500*0.1)=50
      expect(parseFloat(response.body.sale.points_earned)).toBe(50);
      expect(parseFloat(response.body.sale.points_redeemed)).toBe(0);
      expect(parseFloat(response.body.sale.points_discount)).toBe(0);

      saleWithPointsId = response.body.sale.id;
    });

    test('7. Verificar puntos acreditados al cliente. Expect total_points=50', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('points');
      expect(parseFloat(response.body.points.total_points)).toBe(50);
      expect(parseFloat(response.body.points.lifetime_points)).toBe(50);
    });

    test('8. Verificar historial: 1 transacción tipo earn', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}/transactions`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.total).toBeGreaterThanOrEqual(1);

      const earnTx = response.body.transactions.find(t => t.type === 'earn');
      expect(earnTx).toBeDefined();
      expect(parseFloat(earnTx.points)).toBe(50);
    });
  });

  // ============================================================
  // POST /api/sales — redeem points
  // ============================================================
  describe('POST /api/sales — canje de puntos', () => {
    test('9. Canjear 20 puntos en nueva venta. Expect 200, points_discount=2', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleContadoForRedeem(customerId, addressId, 20))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(parseFloat(response.body.sale.points_redeemed)).toBe(20);
      // 20 pts * $0.10 = $2.00
      expect(parseFloat(response.body.sale.points_discount)).toBe(2.00);
      // due_payment = 0 (contado), pero points_discount ya está aplicado al calcular
      expect(parseFloat(response.body.sale.due_payment)).toBe(0);
    });

    test('10. Verificar saldo reducido tras canje. Expect total_points = 50 - 20 + earned_on_new_sale', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      // Tras canjear 20 puntos y ganar puntos por la nueva venta (subtotal 1000, tax 0 → 100 pts)
      // balance = 50 - 20 + 100 = 130
      expect(parseFloat(response.body.points.total_points)).toBe(130);
    });

    test('11. Historial debe tener transacción tipo redeem', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}/transactions`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const redeemTx = response.body.transactions.find(t => t.type === 'redeem');
      expect(redeemTx).toBeDefined();
      expect(parseFloat(redeemTx.points)).toBe(-20);
    });

    test('12. Canjear más puntos de los disponibles. Expect 422', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleContadoForRedeem(customerId, addressId, 99999))
        .expect(422);
    });

    test('13. Canjear menos del mínimo (min=5, send=3). Expect 422', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleContadoForRedeem(customerId, addressId, 3))
        .expect(422);
    });

    test('14. Canjear excediendo max_redeem_pct. Expect 422', async () => {
      // Venta de $100. max_redeem_pct=50% → máx $50.
      // Intentar canjear 60 pts * $0.10 = $6... necesitamos > $50:
      // canjear 600 pts = $60 > $50 (50% de $100)
      const smallSale = {
        branch_id: 1,
        customer_id: customerId,
        customer_address_id: addressId,
        employee_id: 1,
        sales_date: '2026-03-31',
        sales_type: 'Contado',
        points_redeemed: 600, // 600 * $0.10 = $60 > 50% de $100 ($50)
        items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100.00, discount: 0, tax_rate: 0 }]
      };
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(smallSale)
        .expect(422);
    });
  });

  // ============================================================
  // POST /api/loyaltyPoints/customer/:id/adjust
  // ============================================================
  describe('POST /api/loyaltyPoints/customer/:id/adjust', () => {
    let balanceBefore = 0;

    beforeAll(async () => {
      const res = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' });
      balanceBefore = parseFloat(res.body.points.total_points);
    });

    test('15. Ajuste positivo de 10 puntos. Expect 200', async () => {
      const response = await api
        .post(`/api/loyaltyPoints/customer/${customerId}/adjust`)
        .auth(Token, { type: 'bearer' })
        .send({ amount: 10, notes: 'Ajuste positivo de prueba' })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updated = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' });
      expect(parseFloat(updated.body.points.total_points)).toBe(balanceBefore + 10);
    });

    test('16. Ajuste negativo de 5 puntos. Expect 200', async () => {
      const response = await api
        .post(`/api/loyaltyPoints/customer/${customerId}/adjust`)
        .auth(Token, { type: 'bearer' })
        .send({ amount: -5, notes: 'Ajuste negativo de prueba' })
        .expect(200);

      expect(response.body.success).toBe(true);

      const updated = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' });
      expect(parseFloat(updated.body.points.total_points)).toBe(balanceBefore + 10 - 5);
    });

    test('17. Ajuste negativo mayor al saldo. Expect 422', async () => {
      await api
        .post(`/api/loyaltyPoints/customer/${customerId}/adjust`)
        .auth(Token, { type: 'bearer' })
        .send({ amount: -999999, notes: 'Debería fallar' })
        .expect(422);
    });

    test('18. Ajuste con amount=0. Expect 400 (validación)', async () => {
      await api
        .post(`/api/loyaltyPoints/customer/${customerId}/adjust`)
        .auth(Token, { type: 'bearer' })
        .send({ amount: 0 })
        .expect(400);
    });
  });

  // ============================================================
  // Cancelar venta con puntos ganados → puntos revertidos
  // ============================================================
  describe('PUT /api/sales/:id/cancel — reversión de puntos', () => {
    let balanceBeforeCancel = 0;

    test('19. Cancelar venta que generó puntos → puntos deben revertirse', async () => {
      const balRes = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' });
      balanceBeforeCancel = parseFloat(balRes.body.points.total_points);

      await api
        .put(`/api/sales/${saleWithPointsId}/cancel`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const updatedBal = await api
        .get(`/api/loyaltyPoints/customer/${customerId}`)
        .auth(Token, { type: 'bearer' });

      // 50 puntos ganados deben haberse revertido
      expect(parseFloat(updatedBal.body.points.total_points)).toBe(balanceBeforeCancel - 50);
    });

    test('20. Historial debe contener transacción tipo void', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}/transactions`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const voidTx = response.body.transactions.find(
        t => t.type === 'void' && parseFloat(t.points) < 0
      );
      expect(voidTx).toBeDefined();
    });
  });

  // ============================================================
  // POST /api/loyaltyPoints/expire
  // ============================================================
  describe('POST /api/loyaltyPoints/expire', () => {
    test('21. Procesar vencimientos cuando no hay puntos expirados. Expect affectedCustomers=0', async () => {
      const response = await api
        .post('/api/loyaltyPoints/expire')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('affectedCustomers');
      expect(response.body.affectedCustomers).toBe(0);
    });
  });

  // ============================================================
  // GET /api/loyaltyPoints/customer/:id/transactions — paginación
  // ============================================================
  describe('GET /api/loyaltyPoints/customer/:id/transactions — paginación', () => {
    test('22. Historial paginado con limit=2. Expect meta correcto', async () => {
      const response = await api
        .get(`/api/loyaltyPoints/customer/${customerId}/transactions?page=1&limit=2`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.transactions.length).toBeLessThanOrEqual(2);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('pages');
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
    });

    test('23. Sin token → 401', async () => {
      await api
        .get(`/api/loyaltyPoints/customer/${customerId}/transactions`)
        .expect(401);
    });
  });
});
