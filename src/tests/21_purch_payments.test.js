const request = require('supertest');
const server = require('../../app');

const {
  paymentCreate,
  paymentCreateFull,
  paymentNoPurchId,
  paymentNoAmount,
  paymentNoDate,
  paymentNoMethod,
  paymentExceedsDue,
  purchaseForPayments,
  purchaseForCancel
} = require('./helper/purchPaymentsData');

let Token = '';
let purchaseId = null;
let cancelledPurchaseId = null;
let createdPaymentId = null;
let fullPaymentPurchaseId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Purchase Payments
 *
 * Setup: Login + crear compra de $500 (sin IVA para simplificar aritmética)
 *
 * POST /api/purch-payments
 *   1. Pago parcial válido → 200, due_payment reducido
 *   2. Pago que salda la compra → 200, status = 'Pagado'
 *   3. Sin purch_id → 400
 *   4. Sin payment_amount → 400
 *   5. Sin payment_date → 400
 *   6. Sin payment_method → 400
 *   7. Pago excede due_payment → 422
 *   8. Pago a compra Cancelada → 422
 *   9. Pago a compra Pagada → 422
 *   10. Sin token → 401
 *
 * GET /api/purch-payments
 *   11. Listar todos → 200
 *   12. Por purchase → 200
 *   13. Por id → 200
 *   14. Por id inexistente → 404
 *   15. Sin token → 401
 *
 * DELETE /api/purch-payments/:id
 *   16. Eliminar pago → 200, due_payment restaurado
 *   17. Eliminar pago que revierte status Pagado → 200, status corregido
 *   18. Eliminar pago inexistente → 404
 *   19. Sin token → 401
 */

describe('[PURCH_PAYMENTS] Test api purch-payments /api/purch-payments/', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Crear compra de prueba principal ($500 sin IVA)
    const purchRes = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseForPayments)
      .expect(200);

    purchaseId = purchRes.body.purchase.id;

    // Crear compra para cancelar
    const cancelRes = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseForCancel)
      .expect(200);

    cancelledPurchaseId = cancelRes.body.purchase.id;

    // Cancelar esa compra
    await api
      .put(`/api/purchases/${cancelledPurchaseId}/cancel`)
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  // ============================================
  // POST /api/purch-payments
  // ============================================
  describe('POST /api/purch-payments', () => {
    test('1. Crear pago parcial válido. Expect 200', async () => {
      const response = await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(purchaseId))
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment).toHaveProperty('id');
      expect(parseFloat(response.body.payment.payment_amount)).toBe(100.00);
      expect(response.body.payment.purch_id).toBe(purchaseId);

      // Verificar que due_payment se redujo
      const purchRes = await api
        .get(`/api/purchases/${purchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(parseFloat(purchRes.body.purchase.due_payment)).toBeCloseTo(400, 2);
      expect(purchRes.body.purchase.status).toBe('Pendiente');

      createdPaymentId = response.body.payment.id;
    });

    test('2. Crear pago que salda la compra completa. Expect 200, status = Pagado', async () => {
      // Crear una compra separada para este test
      const newPurchRes = await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseForPayments)
        .expect(200);

      fullPaymentPurchaseId = newPurchRes.body.purchase.id;
      const duePayment = parseFloat(newPurchRes.body.purchase.due_payment);

      const response = await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreateFull(fullPaymentPurchaseId, duePayment))
        .expect(200);

      expect(response.body.payment.payment_method).toBe('Transferencia');

      // Verificar status Pagado
      const purchRes = await api
        .get(`/api/purchases/${fullPaymentPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(parseFloat(purchRes.body.purchase.due_payment)).toBe(0);
      expect(purchRes.body.purchase.status).toBe('Pagado');
    });

    test('3. Crear pago sin purch_id. Expect 400', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoPurchId)
        .expect(400);
    });

    test('4. Crear pago sin payment_amount. Expect 400', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoAmount(purchaseId))
        .expect(400);
    });

    test('5. Crear pago sin payment_date. Expect 400', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoDate(purchaseId))
        .expect(400);
    });

    test('6. Crear pago sin payment_method. Expect 400', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentNoMethod(purchaseId))
        .expect(400);
    });

    test('7. Pago excede due_payment. Expect 422', async () => {
      // due_payment actual es 400 (después del test 1)
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentExceedsDue(purchaseId, 400))
        .expect(422);
    });

    test('8. Pago a compra Cancelada. Expect 422', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(cancelledPurchaseId))
        .expect(422);
    });

    test('9. Pago a compra Pagada. Expect 422', async () => {
      await api
        .post('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .send(paymentCreate(fullPaymentPurchaseId))
        .expect(422);
    });

    test('10. Crear pago sin token. Expect 401', async () => {
      await api
        .post('/api/purch-payments')
        .send(paymentCreate(purchaseId))
        .expect(401);
    });
  });

  // ============================================
  // GET /api/purch-payments
  // ============================================
  describe('GET /api/purch-payments', () => {
    test('11. Listar todos los pagos. Expect 200', async () => {
      const response = await api
        .get('/api/purch-payments')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
      expect(response.body.payments.length).toBeGreaterThan(0);
    });

    test('12. Listar pagos por compra. Expect 200', async () => {
      const response = await api
        .get(`/api/purch-payments/purchase/${purchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payments');
      expect(Array.isArray(response.body.payments)).toBe(true);
      expect(response.body.payments.every(p => p.purch_id === purchaseId)).toBe(true);
    });

    test('13. Obtener pago por id. Expect 200', async () => {
      const response = await api
        .get(`/api/purch-payments/${createdPaymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.id).toBe(createdPaymentId);
      expect(response.body.payment).toHaveProperty('purchase');
      expect(response.body.payment).toHaveProperty('user');
    });

    test('14. Obtener pago inexistente. Expect 404', async () => {
      await api
        .get('/api/purch-payments/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('15. Listar sin token. Expect 401', async () => {
      await api
        .get('/api/purch-payments')
        .expect(401);
    });
  });

  // ============================================
  // DELETE /api/purch-payments/:id
  // ============================================
  describe('DELETE /api/purch-payments/:id', () => {
    test('16. Eliminar pago parcial. Expect 200, due_payment restaurado', async () => {
      // Verificar due_payment antes: 400
      const beforeRes = await api
        .get(`/api/purchases/${purchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const dueBefore = parseFloat(beforeRes.body.purchase.due_payment);

      const deleteRes = await api
        .delete(`/api/purch-payments/${createdPaymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(deleteRes.body).toHaveProperty('result');

      // Verificar que due_payment se restauró
      const afterRes = await api
        .get(`/api/purchases/${purchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(parseFloat(afterRes.body.purchase.due_payment)).toBeCloseTo(dueBefore + 100, 2);
    });

    test('17. Eliminar pago que revierte status Pagado. Expect 200, status corregido', async () => {
      // fullPaymentPurchaseId está en Pagado
      // Necesitamos el id del pago que lo saldó
      const paymentsRes = await api
        .get(`/api/purch-payments/purchase/${fullPaymentPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const paymentId = paymentsRes.body.payments[0].id;

      await api
        .delete(`/api/purch-payments/${paymentId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      // Verificar que status volvió a Pendiente (no tiene received_at)
      const purchRes = await api
        .get(`/api/purchases/${fullPaymentPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(purchRes.body.purchase.status).toBe('Pendiente');
      expect(parseFloat(purchRes.body.purchase.due_payment)).toBeGreaterThan(0);
    });

    test('18. Eliminar pago inexistente. Expect 404', async () => {
      await api
        .delete('/api/purch-payments/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('19. Eliminar sin token. Expect 401', async () => {
      await api
        .delete('/api/purch-payments/1')
        .expect(401);
    });
  });
});
