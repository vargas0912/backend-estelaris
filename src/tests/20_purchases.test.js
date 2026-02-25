const request = require('supertest');
const server = require('../../app');

const {
  purchaseCreate,
  purchaseCreateCredit,
  purchaseCreateNoSupplier,
  purchaseCreateNoBranch,
  purchaseCreateNoDate,
  purchaseCreateNoItems,
  purchaseCreateEmptyItems,
  purchaseCreateInvalidProduct,
  purchaseUpdate,
  purchaseUpdateStatus,
  purchaseForReceive
} = require('./helper/purchasesData');

let Token = '';
let createdPurchaseId = null;
let creditPurchaseId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Purchases
 *
 * 1. Login
 * 2. Listar compras
 * 3. Crear compra válida (contado)
 * 4. Crear compra a crédito con múltiples items
 * 5. Obtener compra por id
 * 6. Obtener compra inexistente
 * 7. Actualizar compra
 * 8. Cancelar compra
 * 9. Soft delete
 * Tests de validación, autenticación e IDs inválidos
 */

describe('[PURCHASES] Test api purchases /api/purchases/', () => {
  test('Login para obtener token. 200', async () => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Listar compras. Expect 200', async () => {
    const response = await api
      .get('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('purchases');
    expect(Array.isArray(response.body.purchases)).toBe(true);
  });

  test('2. Crear compra contado válida. Expect 200', async () => {
    const response = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseCreate)
      .expect(200);

    expect(response.body).toHaveProperty('purchase');
    expect(response.body.purchase).toHaveProperty('id');
    expect(response.body.purchase.supplier_id).toBe(purchaseCreate.supplier_id);
    expect(response.body.purchase.status).toBe('Pendiente');
    expect(response.body.purchase).toHaveProperty('details');
    expect(Array.isArray(response.body.purchase.details)).toBe(true);
    expect(response.body.purchase.details.length).toBe(1);

    createdPurchaseId = response.body.purchase.id;
  });

  test('3. Crear compra a crédito con múltiples items. Expect 200', async () => {
    const response = await api
      .post('/api/purchases')
      .auth(Token, { type: 'bearer' })
      .send(purchaseCreateCredit)
      .expect(200);

    expect(response.body).toHaveProperty('purchase');
    expect(response.body.purchase.purch_type).toBe('Credito');
    expect(response.body.purchase.details.length).toBe(2);

    creditPurchaseId = response.body.purchase.id;
  });

  test('4. Obtener compra por id. Expect 200', async () => {
    const response = await api
      .get(`/api/purchases/${createdPurchaseId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('purchase');
    expect(response.body.purchase.id).toBe(createdPurchaseId);
    expect(response.body.purchase).toHaveProperty('supplier');
    expect(response.body.purchase).toHaveProperty('branch');
    expect(response.body.purchase).toHaveProperty('details');
  });

  test('5. Obtener compra inexistente. Expect 404', async () => {
    await api
      .get('/api/purchases/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('6. Obtener compras por proveedor. Expect 200', async () => {
    const response = await api
      .get('/api/purchases/supplier/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('purchases');
    expect(Array.isArray(response.body.purchases)).toBe(true);
  });

  test('7. Obtener compras por sucursal. Expect 200', async () => {
    const response = await api
      .get('/api/purchases/branch/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('purchases');
    expect(Array.isArray(response.body.purchases)).toBe(true);
  });

  test('8. Actualizar compra (status + método de pago). Expect 200', async () => {
    const response = await api
      .put(`/api/purchases/${createdPurchaseId}`)
      .auth(Token, { type: 'bearer' })
      .send(purchaseUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('purchase');
    expect(response.body.purchase.status).toBe('Pagado');
    expect(response.body.purchase.payment_method).toBe('Transferencia');
  });

  test('9. Verificar totales calculados correctamente', async () => {
    const response = await api
      .get(`/api/purchases/${createdPurchaseId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const purchase = response.body.purchase;
    // 5 unidades × $100 = $500 subtotal, 16% de IVA = $80, total = $580
    expect(parseFloat(purchase.subtotal)).toBeCloseTo(500, 2);
    expect(parseFloat(purchase.tax_amount)).toBeCloseTo(80, 2);
    expect(parseFloat(purchase.purch_total)).toBeCloseTo(580, 2);
  });

  // ============================================
  // Tests de cancelación
  // ============================================
  describe('Tests de cancelación', () => {
    test('10. Cancelar compra a crédito. Expect 200', async () => {
      const response = await api
        .put(`/api/purchases/${creditPurchaseId}/cancel`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('purchase');
      expect(response.body.purchase.status).toBe('Cancelado');
    });

    test('11. Cancelar compra ya cancelada. Expect 400', async () => {
      await api
        .put(`/api/purchases/${creditPurchaseId}/cancel`)
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('12. Cancelar compra inexistente. Expect 404', async () => {
      await api
        .put('/api/purchases/99999/cancel')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('13. Crear compra sin proveedor. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateNoSupplier)
        .expect(400);
    });

    test('14. Crear compra sin sucursal. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateNoBranch)
        .expect(400);
    });

    test('15. Crear compra sin fecha. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateNoDate)
        .expect(400);
    });

    test('16. Crear compra sin items. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateNoItems)
        .expect(400);
    });

    test('17. Crear compra con items vacíos. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateEmptyItems)
        .expect(400);
    });

    test('18. Crear compra con producto inexistente. Expect 400', async () => {
      await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreateInvalidProduct)
        .expect(400);
    });

    test('19. Actualizar compra con status inválido. Expect 400', async () => {
      await api
        .put(`/api/purchases/${createdPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .send({ status: 'EstadoInvalido' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('20. Listar compras sin token. Expect 401', async () => {
      await api
        .get('/api/purchases')
        .expect(401);
    });

    test('21. Crear compra sin token. Expect 401', async () => {
      await api
        .post('/api/purchases')
        .send(purchaseCreate)
        .expect(401);
    });

    test('22. Actualizar compra sin token. Expect 401', async () => {
      await api
        .put('/api/purchases/1')
        .send(purchaseUpdate)
        .expect(401);
    });

    test('23. Eliminar compra sin token. Expect 401', async () => {
      await api
        .delete('/api/purchases/1')
        .expect(401);
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('24. Obtener compra con ID no numérico. Expect 400', async () => {
      await api
        .get('/api/purchases/abc')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('25. Actualizar compra inexistente. Expect 404', async () => {
      await api
        .put('/api/purchases/99999')
        .auth(Token, { type: 'bearer' })
        .send(purchaseUpdateStatus)
        .expect(404);
    });
  });

  // ============================================
  // Tests de eliminación
  // ============================================
  describe('Tests de eliminacion', () => {
    test('26. Eliminar compra con status != Pendiente. Expect 400', async () => {
      // La compra createdPurchaseId ya está en Pagado
      await api
        .delete(`/api/purchases/${createdPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('27. Crear y eliminar compra Pendiente. Expect 200', async () => {
      const createResponse = await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseCreate)
        .expect(200);

      const newId = createResponse.body.purchase.id;

      const deleteResponse = await api
        .delete(`/api/purchases/${newId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('result');
      expect(deleteResponse.body.result).toBe(1);
    });

    test('28. Eliminar compra inexistente. Expect 404', async () => {
      await api
        .delete('/api/purchases/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de recepción de compra
  // ============================================
  describe('Tests de recepción de compra', () => {
    let receivePurchaseId = null;

    test('R1. Crear compra para recibir. Expect 200', async () => {
      const response = await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseForReceive)
        .expect(200);

      expect(response.body.purchase.status).toBe('Pendiente');
      receivePurchaseId = response.body.purchase.id;
    });

    test('R2. Recibir compra (happy path). Expect 200', async () => {
      const response = await api
        .patch(`/api/purchases/${receivePurchaseId}/receive`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('purchase');
      expect(response.body.purchase.status).toBe('Recibido');
      expect(response.body.purchase.received_at).not.toBeNull();
    });

    test('R3. Verificar que productStock.quantity se actualizó. Expect > 0', async () => {
      const response = await api
        .get('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const stocks = response.body.stocks;
      const stockForProduct = stocks.find(s =>
        s.product_id === purchaseForReceive.items[0].product_id &&
        s.branch_id === purchaseForReceive.branch_id
      );

      expect(stockForProduct).toBeDefined();
      expect(parseFloat(stockForProduct.quantity)).toBeGreaterThan(0);
    });

    test('R4. Recibir compra ya recibida. Expect 409', async () => {
      await api
        .patch(`/api/purchases/${receivePurchaseId}/receive`)
        .auth(Token, { type: 'bearer' })
        .expect(409);
    });

    test('R5. Recibir compra inexistente. Expect 404', async () => {
      await api
        .patch('/api/purchases/99999/receive')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('R6. Recibir compra cancelada. Expect 409', async () => {
      // creditPurchaseId fue cancelado en test 10
      await api
        .patch(`/api/purchases/${creditPurchaseId}/cancel`)
        .auth(Token, { type: 'bearer' });

      // Crear una compra nueva para cancelar y luego intentar recibir
      const createRes = await api
        .post('/api/purchases')
        .auth(Token, { type: 'bearer' })
        .send(purchaseForReceive)
        .expect(200);

      const cancelId = createRes.body.purchase.id;

      await api
        .put(`/api/purchases/${cancelId}/cancel`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      await api
        .patch(`/api/purchases/${cancelId}/receive`)
        .auth(Token, { type: 'bearer' })
        .expect(409);
    });

    test('R7. Recibir sin token. Expect 401', async () => {
      await api
        .patch(`/api/purchases/${receivePurchaseId}/receive`)
        .expect(401);
    });

    test('R8. Recibir con ID no numérico. Expect 400', async () => {
      await api
        .patch('/api/purchases/abc/receive')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('29. Verificar estructura completa de compra', async () => {
      const response = await api
        .get(`/api/purchases/${createdPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const purchase = response.body.purchase;
      expect(purchase).toHaveProperty('id');
      expect(purchase).toHaveProperty('supplier_id');
      expect(purchase).toHaveProperty('branch_id');
      expect(purchase).toHaveProperty('user_id');
      expect(purchase).toHaveProperty('purch_date');
      expect(purchase).toHaveProperty('purch_type');
      expect(purchase).toHaveProperty('status');
      expect(purchase).toHaveProperty('subtotal');
      expect(purchase).toHaveProperty('tax_amount');
      expect(purchase).toHaveProperty('purch_total');
      expect(purchase).toHaveProperty('supplier');
      expect(purchase).toHaveProperty('branch');
      expect(purchase).toHaveProperty('details');
    });

    test('30. Verificar estructura de detalle de compra', async () => {
      const response = await api
        .get(`/api/purchases/${createdPurchaseId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const detail = response.body.purchase.details[0];
      expect(detail).toHaveProperty('product_id');
      expect(detail).toHaveProperty('qty');
      expect(detail).toHaveProperty('unit_price');
      expect(detail).toHaveProperty('discount');
      expect(detail).toHaveProperty('tax_rate');
      expect(detail).toHaveProperty('subtotal');
      expect(detail).toHaveProperty('product');
    });
  });
});
