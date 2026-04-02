const request = require('supertest');
const server = require('../../app');

const { saleCustomerCreate, saleAddressCreate, purchaseForSaleStock, saleCreateCredito } = require('./helper/salesData');
const {
  paymentCreate,
  paymentCreateFull,
  paymentNoBranchId,
  paymentNoSaleId,
  paymentNoAmount,
  paymentNoDate,
  paymentNoMethod,
  paymentExceedsDue
} = require('./helper/salePaymentsData');

let Token = '';
let creditoSaleId = null;
let cancelledSaleId = null;
let createdPaymentId = null;
let fullPaymentSaleId = null;
let customerId = null;
let addressId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Sale Payments
 *
 * POST /api/sale-payments
 *   1. Cobro parcial válido → 200, due_payment reducido, installments actualizados
 *   2. Cobro que salda la venta → 200, status=Pagado
 *   3. Sin sale_id → 400
 *   4. Sin payment_amount → 400
 *   5. Sin payment_date → 400
 *   6. Sin payment_method → 400
 *   7. Cobro excede due_payment → 422
 *   8. Cobro a venta Cancelada → 422
 *   9. Cobro a venta Pagada → 422
 *  10. Sin token → 401
 *  11. Sin branch_id → 400
 *  12. Cobro en sucursal diferente → 200, branch_id registrado
 *
 * GET /api/sale-payments
 *  13. Listar todos → 200
 *  14. Por venta → 200
 *  15. Por id → 200
 *  16. Por id inexistente → 404
 *
 * DELETE /api/sale-payments/:id
 *  17. Eliminar cobro → 200, due_payment restaurado
 *  18. Eliminar cobro que revierte status Pagado → 200
 *  19. Eliminar inexistente → 404
 */

describe('[SALE_PAYMENTS] Test api sale-payments /api/sale-payments/', () => {
  beforeAll(async () => {
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
      .send({ ...saleCustomerCreate, email: 'cliente.payments@test.com' })
      .expect(200);

    customerId = custRes.body.customer.id;

    // Create own address
    const addrRes = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(saleAddressCreate(customerId))
      .expect(200);

    addressId = addrRes.body.address.id;

    // Ensure stock exists
    const purchRes = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseForSaleStock)
      .expect(200);

    await api
      .patch(`/api/purchases/${purchRes.body.purchase.id}/receive`)
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .expect(200);

    // Create credit sale for payment tests
    const saleRes = await api
      .post('/api/sales')
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .send(saleCreateCredito(customerId, addressId))
      .expect(200);

    creditoSaleId = saleRes.body.sale.id;

    // Create and cancel a sale for error test
    const cancelRes = await api
      .post('/api/sales')
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .send(saleCreateCredito(customerId, addressId))
      .expect(200);

    cancelledSaleId = cancelRes.body.sale.id;

    await api
      .put(`/api/sales/${cancelledSaleId}/cancel`)
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  // ============================================
  // POST /api/sale-payments
  // ============================================
  describe('POST /api/sale-payments', () => {
    test('1. Cobro parcial válido. Expect 200', async () => {
      const response = await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(creditoSaleId))
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(parseFloat(response.body.payment.payment_amount)).toBe(100.00);

      // Verify due_payment reduced
      const saleRes = await api
        .get(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(saleRes.body.sale.status).toBe('Pendiente');

      createdPaymentId = response.body.payment.id;
    });

    test('2. Cobro que salda la venta. Expect 200, status=Pagado', async () => {
      // Create a new credit sale
      const newSaleRes = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId))
        .expect(200);

      fullPaymentSaleId = newSaleRes.body.sale.id;
      const duePayment = parseFloat(newSaleRes.body.sale.due_payment);

      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreateFull(fullPaymentSaleId, duePayment))
        .expect(200);

      // Verify Pagado
      const saleRes = await api
        .get(`/api/sales/${fullPaymentSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(parseFloat(saleRes.body.sale.due_payment)).toBe(0);
      expect(saleRes.body.sale.status).toBe('Pagado');

      // Verify installments all Pagado
      const allPaid = saleRes.body.sale.installments.every(i => i.status === 'Pagado');
      expect(allPaid).toBe(true);
    });

    test('3. Sin sale_id. Expect 400', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoSaleId)
        .expect(400);
    });

    test('4. Sin payment_amount. Expect 400', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoAmount(creditoSaleId))
        .expect(400);
    });

    test('5. Sin payment_date. Expect 400', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoDate(creditoSaleId))
        .expect(400);
    });

    test('6. Sin payment_method. Expect 400', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoMethod(creditoSaleId))
        .expect(400);
    });

    test('7. Cobro excede due_payment. Expect 422', async () => {
      const saleRes = await api
        .get(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const currentDue = parseFloat(saleRes.body.sale.due_payment);

      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentExceedsDue(creditoSaleId, currentDue))
        .expect(422);
    });

    test('8. Cobro a venta Cancelada. Expect 422', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(cancelledSaleId))
        .expect(422);
    });

    test('9. Cobro a venta Pagada. Expect 422', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(fullPaymentSaleId))
        .expect(422);
    });

    test('10. Sin token. Expect 401', async () => {
      await api
        .post('/api/sale-payments')
        .send(paymentCreate(creditoSaleId))
        .expect(401);
    });

    test('11. Sin branch_id. Expect 400', async () => {
      await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoBranchId(creditoSaleId))
        .expect(400);
    });

    test('12. Cobro en sucursal diferente a la de la venta. Expect 200, branch_id registrado', async () => {
      const newSaleRes = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId))
        .expect(200);

      const response = await api
        .post('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(newSaleRes.body.sale.id, 2))
        .expect(200);

      expect(response.body.payment.branch_id).toBe(2);
      expect(response.body.payment.branch).toHaveProperty('id', 2);
    });
  });

  // ============================================
  // GET /api/sale-payments
  // ============================================
  describe('GET /api/sale-payments', () => {
    test('13. Listar todos. Expect 200', async () => {
      const response = await api
        .get('/api/sale-payments')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    test('14. Por venta. Expect 200', async () => {
      const response = await api
        .get(`/api/sale-payments/sale/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payments');
    });

    test('15. Por id. Expect 200', async () => {
      const response = await api
        .get(`/api/sale-payments/${createdPaymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.id).toBe(createdPaymentId);
    });

    test('16. Por id inexistente. Expect 404', async () => {
      await api
        .get('/api/sale-payments/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // DELETE /api/sale-payments/:id
  // ============================================
  describe('DELETE /api/sale-payments/:id', () => {
    test('17. Eliminar cobro. Expect 200, due_payment restaurado', async () => {
      const beforeRes = await api
        .get(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const dueBefore = parseFloat(beforeRes.body.sale.due_payment);

      await api
        .delete(`/api/sale-payments/${createdPaymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const afterRes = await api
        .get(`/api/sales/${creditoSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(parseFloat(afterRes.body.sale.due_payment)).toBeCloseTo(dueBefore + 100, 2);
    });

    test('18. Eliminar cobro que revierte status Pagado. Expect 200', async () => {
      const paymentsRes = await api
        .get(`/api/sale-payments/sale/${fullPaymentSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const paymentId = paymentsRes.body.payments[0].id;

      await api
        .delete(`/api/sale-payments/${paymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const saleRes = await api
        .get(`/api/sales/${fullPaymentSaleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(saleRes.body.sale.status).toBe('Pendiente');
      expect(parseFloat(saleRes.body.sale.due_payment)).toBeGreaterThan(0);
    });

    test('19. Eliminar inexistente. Expect 404', async () => {
      await api
        .delete('/api/sale-payments/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });
});
