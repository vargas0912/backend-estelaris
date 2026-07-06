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
  saleUpdate,
  saleCreateWithCampaign
} = require('./helper/salesData');

const settleBody = (amount) => ({
  settlement_amount: amount,
  payment_date: '2026-07-01',
  payment_method: 'Efectivo'
});

let Token = '';
let contadoSaleId = null;
let creditoSaleId = null;
let cancelSaleId = null;
let customerId = null;
let addressId = null;
let purchaseId = null;

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

    purchaseId = purchRes.body.purchase.id;

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
        .send(saleCreateContado(customerId, addressId, purchaseId))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.status).toBe('Pagado');
      expect(parseFloat(response.body.sale.due_payment)).toBe(0);
      expect(response.body.sale.sales_type).toBe('Contado');
      expect(response.body.sale.details.length).toBe(1);
      expect(response.body.sale.ticket).toMatch(/^[A-Z0-9]+-\d{2}-\d{6}$/);

      contadoSaleId = response.body.sale.id;
    });

    test('2. Crear venta a crédito con installments. Expect 200', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      expect(response.body.sale.status).toBe('Pendiente');
      expect(response.body.sale.sales_type).toBe('Credito');
      expect(parseFloat(response.body.sale.due_payment)).toBeGreaterThan(0);
      expect(parseFloat(response.body.sale.due_payment)).toBe(parseFloat(response.body.sale.sales_total));
      expect(response.body.sale.due_date).not.toBeNull();
      expect(response.body.sale.payment_periods).toBe('Quincenal');
      expect(response.body.sale.ticket).toMatch(/^[A-Z0-9]+-\d{2}-\d{6}$/);

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
        .send(saleCreateEntregado(customerId, addressId, purchaseId))
        .expect(200);

      expect(response.body.sale.delivery_status).toBe('Entregado');
    });

    test('9. Crear venta sin delivery_status. Expect 200, delivery_status=Pendiente (default)', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId, purchaseId))
        .expect(200);

      expect(response.body.sale.delivery_status).toBe('Pendiente');
    });

    test('10. Crear venta sin token. Expect 401', async () => {
      await api
        .post('/api/sales')
        .send(saleCreateContado(customerId, addressId, purchaseId))
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
  // GET /api/sales — ordenamiento
  // ============================================
  describe('GET /api/sales - sorting', () => {
    test('20. Sin params de orden → 200, respuesta tiene sales y pagination', async () => {
      const response = await api
        .get('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.sales)).toBe(true);
    });

    test('21. ?sortBy=sales_date&sortOrder=ASC → 200', async () => {
      const response = await api
        .get('/api/sales?sortBy=sales_date&sortOrder=ASC')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(Array.isArray(response.body.sales)).toBe(true);
    });

    test('22. ?sortBy=sales_total&sortOrder=DESC → 200', async () => {
      const response = await api
        .get('/api/sales?sortBy=sales_total&sortOrder=DESC')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
    });

    test('23. ?sortBy=status → 200', async () => {
      const response = await api
        .get('/api/sales?sortBy=status')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
    });

    test('24. ?sortBy=invalid_column → 400 (validator rechaza)', async () => {
      await api
        .get('/api/sales?sortBy=invalid_column')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(400);
    });

    test('25. ?sortOrder=RANDOM → 400 (validator rechaza)', async () => {
      await api
        .get('/api/sales?sortOrder=RANDOM')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(400);
    });

    test('26. ?sortBy=id&sortOrder=ASC combinado con search → 200', async () => {
      const response = await api
        .get('/api/sales?sortBy=id&sortOrder=ASC&search=test')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  // ============================================
  // GET /api/sales/branch/:branchId — ordenamiento
  // ============================================
  describe('GET /api/sales/branch/:branchId - sorting', () => {
    test('27. ?sortBy=sales_date&sortOrder=ASC → 200', async () => {
      const response = await api
        .get('/api/sales/branch/1?sortBy=sales_date&sortOrder=ASC')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.sales)).toBe(true);
    });

    test('28. ?sortBy=sales_total&sortOrder=ASC → 200', async () => {
      const response = await api
        .get('/api/sales/branch/1?sortBy=sales_total&sortOrder=ASC')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(200);

      expect(response.body).toHaveProperty('sales');
    });

    test('29. ?sortBy=invalid_column → 400 (validator rechaza)', async () => {
      await api
        .get('/api/sales/branch/1?sortBy=invalid_column')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(400);
    });

    test('30. ?sortOrder=asc (minúsculas) → 400 (validator rechaza)', async () => {
      await api
        .get('/api/sales/branch/1?sortOrder=asc')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .expect(400);
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
        .send(saleCreateCredito(customerId, addressId, purchaseId))
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
    test('18. Soft delete venta Contado sin pagos. Expect 200', async () => {
      const newSaleRes = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId, purchaseId))
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

  // ============================================
  // POST /api/sales — campaign_product_id
  // ============================================
  describe('POST /api/sales - campaign_product_id', () => {
    test('30. Venta con campaign_product_id válido → 200 y sold_quantity incrementado por qty', async () => {
      const response = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateWithCampaign(customerId, addressId, purchaseId))
        .expect(200);

      expect(response.body.sale.status).toBe('Pagado');

      const cpRes = await api
        .get('/api/campaignProducts/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(cpRes.body.data.sold_quantity).toBe(2);
    });

    test('31. campaign_product_id inválido (string) → 400', async () => {
      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateWithCampaign(customerId, addressId, purchaseId, 'abc', 1))
        .expect(400);
    });

    test('32. campaign_product_id omitido no incrementa sold_quantity', async () => {
      const beforeRes = await api
        .get('/api/campaignProducts/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const soldBefore = beforeRes.body.data.sold_quantity;

      await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId, purchaseId))
        .expect(200);

      const afterRes = await api
        .get('/api/campaignProducts/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(afterRes.body.data.sold_quantity).toBe(soldBefore);
    });
  });

  // ============================================
  // PUT /api/sales/:id/settle
  // ============================================
  describe('PUT /api/sales/:id/settle', () => {
    let discountSaleId = null;
    let discountSaleDue = null;
    let fullSettleSaleId = null;
    let fullSettleSaleDue = null;
    let alreadyPaidSaleId = null;
    let contadoGuardId = null;
    let amountGuardSaleId = null;
    let amountGuardSaleDue = null;

    beforeAll(async () => {
      // Sale for discounted settlement (test 40)
      const r1 = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);
      discountSaleId = r1.body.sale.id;
      discountSaleDue = parseFloat(r1.body.sale.due_payment);

      // Sale for full-price early closure (test 41)
      const r2 = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);
      fullSettleSaleId = r2.body.sale.id;
      fullSettleSaleDue = parseFloat(r2.body.sale.due_payment);

      // Pre-settle a sale for the SALE_NOT_SETTLEABLE guard (test 44)
      const r3 = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);
      const preSettleDue = parseFloat(r3.body.sale.due_payment);
      await api
        .put(`/api/sales/${r3.body.sale.id}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(preSettleDue))
        .expect(200);
      alreadyPaidSaleId = r3.body.sale.id;

      // Contado sale for SALE_NOT_CREDIT guard (test 43)
      const r4 = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateContado(customerId, addressId, purchaseId))
        .expect(200);
      contadoGuardId = r4.body.sale.id;

      // Credit sale for amount guard tests (tests 45, 46)
      const r5 = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);
      amountGuardSaleId = r5.body.sale.id;
      amountGuardSaleDue = parseFloat(r5.body.sale.due_payment);
    });

    test('40. Liquidación con descuento. Expect 200, settlement_discount > 0', async () => {
      const settleAmount = parseFloat((discountSaleDue - 50).toFixed(2));

      const response = await api
        .put(`/api/sales/${discountSaleId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(settleAmount))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      const sale = response.body.sale;
      expect(parseFloat(sale.due_payment)).toBe(0);
      expect(sale.status).toBe('Pagado');
      expect(sale.settlement_discount).not.toBeNull();
      expect(parseFloat(sale.settlement_discount)).toBeCloseTo(discountSaleDue - settleAmount, 2);

      // Verify all installments are Pagado
      expect(sale.installments.every(i => i.status === 'Pagado')).toBe(true);
    });

    test('41. Liquidación precio completo (settlement_discount = 0). Expect 200', async () => {
      const response = await api
        .put(`/api/sales/${fullSettleSaleId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(fullSettleSaleDue))
        .expect(200);

      expect(response.body).toHaveProperty('sale');
      const sale = response.body.sale;
      expect(parseFloat(sale.due_payment)).toBe(0);
      expect(sale.status).toBe('Pagado');
      expect(parseFloat(sale.settlement_discount)).toBe(0);

      // This sale should appear in GET /settlements
      const listRes = await api
        .get('/api/sales/settlements')
        .auth(Token, { type: 'bearer' })
        .expect(200);
      expect(listRes.body.sales.some(s => s.id === fullSettleSaleId)).toBe(true);
    });

    test('42. Guard: venta no encontrada. Expect 404', async () => {
      await api
        .put('/api/sales/99999/settle')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(100))
        .expect(404);
    });

    test('43. Guard: SALE_NOT_CREDIT (venta de contado). Expect 400', async () => {
      const response = await api
        .put(`/api/sales/${contadoGuardId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(100))
        .expect(400);

      expect(response.body.error).toBe('SALE_NOT_CREDIT');
    });

    test('44. Guard: SALE_NOT_SETTLEABLE (ya liquidada). Expect 400', async () => {
      const response = await api
        .put(`/api/sales/${alreadyPaidSaleId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(100))
        .expect(400);

      expect(response.body.error).toBe('SALE_NOT_SETTLEABLE');
    });

    test('45. Guard: INVALID_SETTLEMENT_AMOUNT (amount > due_payment). Expect 400', async () => {
      const response = await api
        .put(`/api/sales/${amountGuardSaleId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(amountGuardSaleDue + 100))
        .expect(400);

      expect(response.body.error).toBe('INVALID_SETTLEMENT_AMOUNT');
    });

    test('46. Guard: INVALID_SETTLEMENT_AMOUNT (amount = 0). Expect 400', async () => {
      await api
        .put(`/api/sales/${amountGuardSaleId}/settle`)
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(0))
        .expect(400);
    });

    test('47. Guard: sin X-Branch-ID. Expect 400', async () => {
      const r = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);

      await api
        .put(`/api/sales/${r.body.sale.id}/settle`)
        .auth(Token, { type: 'bearer' })
        // No x-branch-id header
        .send(settleBody(100))
        .expect(400);
    });
  });

  // ============================================
  // GET /api/sales/settlements
  // ============================================
  describe('GET /api/sales/settlements', () => {
    test('50. Lista ventas liquidadas. Expect 200, contiene ventas con settlement_discount', async () => {
      const response = await api
        .get('/api/sales/settlements')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.sales)).toBe(true);
      expect(response.body.sales.length).toBeGreaterThan(0);
      // All returned sales must have settlement_discount set (not null)
      expect(response.body.sales.every(s => s.settlement_discount !== null)).toBe(true);
    });

    test('51. Excluye ventas no liquidadas (settlement_discount = null). Expect 200', async () => {
      // Create a new credit sale without settling it
      const r = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId))
        .expect(200);

      const unsettledId = r.body.sale.id;

      const response = await api
        .get('/api/sales/settlements')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      // The unsettled sale must NOT appear in settlements
      expect(response.body.sales.some(s => s.id === unsettledId)).toBe(false);
    });

    test('52. Paginación respetada. Expect 200 con limit=1', async () => {
      const response = await api
        .get('/api/sales/settlements?page=1&limit=1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body.sales.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    test('53. Sin token. Expect 401', async () => {
      await api
        .get('/api/sales/settlements')
        .expect(401);
    });

    test('54. Sin privilegio view_sale_settlements. Expect 403', async () => {
      const superadminLoginRes = await api.post('/api/auth/login').send({ email: 'superadmin@estelaris.com', password: 'Admin123' });
      const superadminTok = superadminLoginRes.body.sesion.token;

      const userRes = await api.post('/api/auth/register').auth(superadminTok, { type: 'bearer' }).send({
        name: 'No Settle Privilege User',
        email: 'no_settle_priv@test.com',
        role: 'user',
        password: 'Test1234'
      });

      let noPrivToken = '';
      if (userRes.status === 200) {
        const loginRes = await api.post('/api/auth/login').send({ email: 'no_settle_priv@test.com', password: 'Test1234' });
        if (loginRes.status === 200) noPrivToken = loginRes.body.sesion.token;
      }

      if (!noPrivToken) return;

      await api
        .get('/api/sales/settlements')
        .auth(noPrivToken, { type: 'bearer' })
        .expect(403);
    });
  });

  // ============================================
  // Privilege checks for settle endpoint
  // ============================================
  describe('PUT /api/sales/:id/settle - privilege check', () => {
    test('55. Sin privilegio settle_sale. Expect 403', async () => {
      const superadminLoginRes = await api.post('/api/auth/login').send({ email: 'superadmin@estelaris.com', password: 'Admin123' });
      const superadminTok = superadminLoginRes.body.sesion.token;

      const userRes = await api.post('/api/auth/register').auth(superadminTok, { type: 'bearer' }).send({
        name: 'No Settle Action User',
        email: 'no_settle_action@test.com',
        role: 'user',
        password: 'Test1234'
      });

      let noPrivToken = '';
      if (userRes.status === 200) {
        const loginRes = await api.post('/api/auth/login').send({ email: 'no_settle_action@test.com', password: 'Test1234' });
        if (loginRes.status === 200) noPrivToken = loginRes.body.sesion.token;
      }

      if (!noPrivToken) return;

      const r = await api
        .post('/api/sales')
        .auth(Token, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(saleCreateCredito(customerId, addressId, purchaseId));

      if (r.status !== 200) return;

      await api
        .put(`/api/sales/${r.body.sale.id}/settle`)
        .auth(noPrivToken, { type: 'bearer' })
        .set('x-branch-id', '1')
        .send(settleBody(100))
        .expect(403);
    });
  });
});
