const request = require('supertest');
const server = require('../../app');

const {
  saleCustomerCreate,
  saleAddressCreate,
  purchaseForSaleStock,
  saleCreateContado,
  saleCreateCredito,
  saleCreateEntregado,
  saleCreateNoCustomer,
  saleCreateNoAddress,
  saleCreateNoEmployee,
  saleCreateNoDate,
  saleCreateNoItems,
  saleUpdate
} = require('./helper/salesData');

let Token = '';
let contadoSaleId = null;
let creditoSaleId = null;
let cancelSaleId = null;
let customerId = null;
let addressId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Sales
 *
 * Setup: Login + crear compra y recibirla (para generar stock)
 *
 * POST /api/sales
 *   1. Crear venta de contado → 200, status=Pagado, due_payment=0
 *   2. Crear venta a crédito → 200, genera installments
 *   3. Sin customer_id → 400
 *   4. Sin customer_address_id → 400
 *   5. Sin employee_id → 400
 *   6. Sin sales_date → 400
 *   7. Sin items → 400
 *   8. Sin token → 401
 *
 * GET /api/sales
 *   9. Listar todas → 200
 *  10. Por cliente → 200
 *  11. Por sucursal → 200
 *  12. Por id (contado) → 200
 *  13. Por id (crédito con installments) → 200
 *  14. Por id inexistente → 404
 *  15. Sin token → 401
 *
 * PUT /api/sales/:id
 *  16. Actualizar invoice y notes → 200
 *
 * PUT /api/sales/:id/cancel
 *  17. Cancelar venta → 200, stock revertido
 *
 * DELETE /api/sales/:id
 *  18. Soft delete venta Pendiente → 200
 *  19. Sin token → 401
 */

describe('[SALES] Test api sales /api/sales/', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Create own customer
    const custRes = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(saleCustomerCreate)
      .expect(200);

    customerId = custRes.body.customer.id;

    // Create own address
    const addrRes = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(saleAddressCreate(customerId))
      .expect(200);

    addressId = addrRes.body.address.id;

    // Crear compra y recibirla para generar stock
    const purchRes = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseForSaleStock)
      .expect(200);

    const purchaseId = purchRes.body.purchase.id;

    await api
      .patch(`/api/purchases/${purchaseId}/receive`)
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .expect(200);
  });

  // ============================================
  // POST /api/sales
  // ============================================
  describe('POST /api/sales', () => {
    test('1. Crear venta de contado. Expect 200, status=Pagado', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.status).toBe('Pagado');
      expect(parseFloat(response.body.sale.due_payment)).toBe(0);
      expect(response.body.sale.sales_type).toBe('Contado');
      expect(response.body.sale.details.length).toBe(1);

      contadoSaleId = response.body.sale.id;
    });

    test('2. Crear venta a crédito con installments. Expect 200', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.status).toBe('Pendiente');
      expect(response.body.sale.sales_type).toBe('Credito');
      expect(parseFloat(response.body.sale.due_payment)).toBeGreaterThan(0);
      expect(parseFloat(response.body.sale.due_payment)).toBe(parseFloat(response.body.sale.sales_total));
      expect(response.body.sale.due_date).not.toBeNull();
      expect(response.body.sale.payment_periods).toBe('Quincenal');

      // Verify installments generated
      expect(response.body.sale.installments).toBeDefined();
      expect(response.body.sale.installments.length).toBeGreaterThan(0);

      // Verify installment amounts sum to total
      const installmentSum = response.body.sale.installments.reduce(
        (acc, i) => acc + parseFloat(i.amount), 0
      );
      expect(installmentSum).toBeCloseTo(parseFloat(response.body.sale.sales_total), 1);

      creditoSaleId = response.body.sale.id;
    });

    test('3. Crear venta sin customer_id. Expect 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateNoCustomer)
        .expect(400);
    });

    test('4. Crear venta sin customer_address_id. Expect 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateNoAddress)
        .expect(400);
    });

    test('5. Crear venta sin employee_id. Expect 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateNoEmployee)
        .expect(400);
    });

    test('6. Crear venta sin sales_date. Expect 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateNoDate)
        .expect(400);
    });

    test('7. Crear venta sin items. Expect 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateNoItems)
        .expect(400);
    });

    test('8. Crear venta con delivery_status=Entregado. Expect 200, delivery_status=Entregado', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateEntregado(customerId, addressId))
        .expect(200);

      expect(response.body.sale.delivery_status).toBe('Entregado');
    });

    test('9. Crear venta sin delivery_status. Expect 200, delivery_status=Pendiente (default)', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId))
        .expect(200);

      expect(response.body.sale.delivery_status).toBe('Pendiente');
    });

    test('10. Crear venta sin token. Expect 401', async () => {
      await api
        .post('/api/sales')
        .send(saleCreateContado(customerId, addressId))
        .expect(401);
    });
  });

  // ============================================
  // GET /api/sales
  // ============================================
  describe('GET /api/sales', () => {
    test('9. Listar todas las ventas. Expect 200', async () => {
      const response = await api
        .get('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(Array.isArray(response.body.sales)).toBe(true);
      expect(response.body.sales.length).toBeGreaterThan(0);
    });

    test('10. Ventas por cliente. Expect 200', async () => {
      const response = await api
        .get(`/api/sales/customer/${customerId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body.sales.every(s => s.customer_id === customerId)).toBe(true);
    });

    test('11. Ventas por sucursal. Expect 200', async () => {
      const response = await api
        .get('/api/sales/branch/1')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
    });

    test('12. Obtener venta contado por id. Expect 200', async () => {
      const response = await api
        .get(`/api/sales/${contadoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.id).toBe(contadoSaleId);
      expect(response.body.sale).toHaveProperty('customer');
      expect(response.body.sale).toHaveProperty('details');
    });

    test('13. Obtener venta crédito por id con installments. Expect 200', async () => {
      const response = await api
        .get(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body.sale.id).toBe(creditoSaleId);
      expect(response.body.sale.installments.length).toBeGreaterThan(0);
      expect(response.body.sale.installments[0]).toHaveProperty('installment_number');
      expect(response.body.sale.installments[0]).toHaveProperty('due_date');
      expect(response.body.sale.installments[0]).toHaveProperty('amount');
    });

    test('14. Obtener venta inexistente. Expect 404', async () => {
      await api
        .get('/api/sales/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('15. Listar sin token. Expect 401', async () => {
      await api
        .get('/api/sales')
        .expect(401);
    });
  });

  // ============================================
  // PUT /api/sales/:id
  // ============================================
  describe('PUT /api/sales/:id', () => {
    test('16. Actualizar invoice y notes. Expect 200', async () => {
      const response = await api
        .put(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .send(saleUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.invoice).toBe('FAC-001');
      expect(response.body.sale.notes).toBe('Nota actualizada');
    });
  });

  // ============================================
  // PUT /api/sales/:id/cancel
  // ============================================
  describe('PUT /api/sales/:id/cancel', () => {
    test('17. Cancelar venta crédito sin pagos. Expect 200, status=Cancelado', async () => {
      // Create a new credit sale specifically for cancellation
      const newSaleRes = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId))
        .expect(200);

      cancelSaleId = newSaleRes.body.sale.id;

      const response = await api
        .put(`/api/sales/${cancelSaleId}/cancel`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body.sale.status).toBe('Cancelado');
    });
  });

  // ============================================
  // DELETE /api/sales/:id
  // ============================================
  describe('DELETE /api/sales/:id', () => {
    test('18. Soft delete venta Pendiente sin pagos. Expect 200', async () => {
      // Create a new credit sale for deletion
      const newSaleRes = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId))
        .expect(200);

      const deleteSaleId = newSaleRes.body.sale.id;

      await api
        .delete(`/api/sales/${deleteSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      // Verify it's gone
      await api
        .get(`/api/sales/${deleteSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('19. Eliminar sin token. Expect 401', async () => {
      await api
        .delete('/api/sales/1')
        .expect(401);
    });
  });
});
