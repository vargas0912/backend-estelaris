const request = require('supertest');
const server = require('../../app');

const { saleCustomerCreate, saleAddressCreate, purchaseForSaleStock, saleCreateCredito } = require('./helper/salesData');
const {
  deliveryCreate,
  deliveryCreateWithDriver,
  deliveryCreateNoSale,
  deliveryCreateNoAddress,
  transitionData
} = require('./helper/saleDeliveriesData');

let Token = '';
let saleId = null;
let deliveryId = null;
let fullFlowDeliveryId = null;
let customerId = null;
let addressId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Sale Deliveries
 *
 * POST /api/sale-deliveries
 *   1. Crear entrega básica → 200, status=Preparando
 *   2. Crear entrega con conductor → 200
 *   3. Sin sale_id → 400
 *   4. Sin customer_address_id → 400
 *   5. Sin token → 401
 *
 * GET /api/sale-deliveries
 *   6. Por venta → 200
 *   7. Por id con logs → 200
 *   8. Por id inexistente → 404
 *
 * PATCH transitions (full flow)
 *   9. Pickup (Preparando → Recolectado) → 200
 *  10. Ship (Recolectado → En_Transito) → 200
 *  11. Out (En_Transito → En_Ruta_Entrega) → 200
 *  12. Deliver (En_Ruta_Entrega → Entregado) → 200
 *  13. Transición inválida → 422
 *
 * PATCH return
 *  14. Devolver (Preparando → Devuelto) → 200
 *
 * DELETE /api/sale-deliveries/:id
 *  15. Eliminar entrega no finalizada → 200
 *  16. Eliminar entrega Entregado → 422
 *  17. Eliminar inexistente → 404
 */

describe('[SALE_DELIVERIES] Test api sale-deliveries /api/sale-deliveries/', () => {
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
      .send({ ...saleCustomerCreate, email: 'cliente.deliveries@test.com' })
      .expect(200);

    customerId = custRes.body.customer.id;

    // Create own address
    const addrRes = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(saleAddressCreate(customerId))
      .expect(200);

    addressId = addrRes.body.address.id;

    // Ensure stock
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

    // Create sale
    const saleRes = await api
      .post('/api/sales')
      .auth(Token, { type: 'bearer' })
      .set('x-branch-id', '1')
      .send(saleCreateCredito(customerId, addressId))
      .expect(200);

    saleId = saleRes.body.sale.id;
  });

  // ============================================
  // POST /api/sale-deliveries
  // ============================================
  describe('POST /api/sale-deliveries', () => {
    test('1. Crear entrega básica. Expect 200, status=Preparando', async () => {
      const response = await api
        .post('/api/sale-deliveries')
        .auth(Token, { type: 'bearer' })
        .send(deliveryCreate(saleId, addressId))
        .expect(200);

      expect(response.body).toHaveProperty('delivery');
      expect(response.body.delivery.status).toBe('Preparando');
      expect(response.body.delivery.logs.length).toBe(1);

      deliveryId = response.body.delivery.id;
    });

    test('2. Crear entrega con conductor. Expect 200', async () => {
      const response = await api
        .post('/api/sale-deliveries')
        .auth(Token, { type: 'bearer' })
        .send(deliveryCreateWithDriver(saleId, addressId))
        .expect(200);

      expect(response.body.delivery.driver_id).toBe(1);
      expect(response.body.delivery.transport_plate).toBe('ABC-123');

      fullFlowDeliveryId = response.body.delivery.id;
    });

    test('3. Sin sale_id. Expect 400', async () => {
      await api
        .post('/api/sale-deliveries')
        .auth(Token, { type: 'bearer' })
        .send(deliveryCreateNoSale)
        .expect(400);
    });

    test('4. Sin customer_address_id. Expect 400', async () => {
      await api
        .post('/api/sale-deliveries')
        .auth(Token, { type: 'bearer' })
        .send(deliveryCreateNoAddress(saleId))
        .expect(400);
    });

    test('5. Sin token. Expect 401', async () => {
      await api
        .post('/api/sale-deliveries')
        .send(deliveryCreate(saleId, addressId))
        .expect(401);
    });
  });

  // ============================================
  // GET /api/sale-deliveries
  // ============================================
  describe('GET /api/sale-deliveries', () => {
    test('6. Entregas por venta. Expect 200', async () => {
      const response = await api
        .get(`/api/sale-deliveries/sale/${saleId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('deliveries');
      expect(response.body.deliveries.length).toBeGreaterThan(0);
    });

    test('7. Entrega por id con logs. Expect 200', async () => {
      const response = await api
        .get(`/api/sale-deliveries/${deliveryId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('delivery');
      expect(response.body.delivery.id).toBe(deliveryId);
      expect(response.body.delivery).toHaveProperty('logs');
    });

    test('8. Entrega inexistente. Expect 404', async () => {
      await api
        .get('/api/sale-deliveries/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // PATCH transitions (full flow)
  // ============================================
  describe('PATCH transitions (full flow)', () => {
    test('9. Pickup: Preparando → Recolectado. Expect 200', async () => {
      const response = await api
        .patch(`/api/sale-deliveries/${fullFlowDeliveryId}/pickup`)
        .auth(Token, { type: 'bearer' })
        .send(transitionData)
        .expect(200);

      expect(response.body.delivery.status).toBe('Recolectado');
      expect(response.body.delivery.logs.length).toBe(2);
    });

    test('10. Ship: Recolectado → En_Transito. Expect 200', async () => {
      const response = await api
        .patch(`/api/sale-deliveries/${fullFlowDeliveryId}/ship`)
        .auth(Token, { type: 'bearer' })
        .send(transitionData)
        .expect(200);

      expect(response.body.delivery.status).toBe('En_Transito');
    });

    test('11. Out: En_Transito → En_Ruta_Entrega. Expect 200', async () => {
      const response = await api
        .patch(`/api/sale-deliveries/${fullFlowDeliveryId}/out`)
        .auth(Token, { type: 'bearer' })
        .send(transitionData)
        .expect(200);

      expect(response.body.delivery.status).toBe('En_Ruta_Entrega');
    });

    test('12. Deliver: En_Ruta_Entrega → Entregado. Expect 200', async () => {
      const response = await api
        .patch(`/api/sale-deliveries/${fullFlowDeliveryId}/deliver`)
        .auth(Token, { type: 'bearer' })
        .send(transitionData)
        .expect(200);

      expect(response.body.delivery.status).toBe('Entregado');
      expect(response.body.delivery.delivered_at).not.toBeNull();
      expect(response.body.delivery.logs.length).toBe(5); // Preparando + 4 transitions
    });

    test('13. Transición inválida en entrega finalizada. Expect 422', async () => {
      await api
        .patch(`/api/sale-deliveries/${fullFlowDeliveryId}/ship`)
        .auth(Token, { type: 'bearer' })
        .send(transitionData)
        .expect(422);
    });
  });

  // ============================================
  // PATCH return
  // ============================================
  describe('PATCH return', () => {
    test('14. Devolver: Preparando → Devuelto. Expect 200', async () => {
      // Use the first delivery (still in Preparando)
      const response = await api
        .patch(`/api/sale-deliveries/${deliveryId}/return`)
        .auth(Token, { type: 'bearer' })
        .send({ notes: 'Cliente rechazó entrega' })
        .expect(200);

      expect(response.body.delivery.status).toBe('Devuelto');
    });
  });

  // ============================================
  // DELETE /api/sale-deliveries/:id
  // ============================================
  describe('DELETE /api/sale-deliveries/:id', () => {
    test('15. Eliminar entrega no finalizada. Expect 200', async () => {
      // Create a new delivery to delete
      const newDel = await api
        .post('/api/sale-deliveries')
        .auth(Token, { type: 'bearer' })
        .send(deliveryCreate(saleId, addressId))
        .expect(200);

      await api
        .delete(`/api/sale-deliveries/${newDel.body.delivery.id}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);
    });

    test('16. Eliminar entrega Entregado. Expect 422', async () => {
      await api
        .delete(`/api/sale-deliveries/${fullFlowDeliveryId}`)
        .auth(Token, { type: 'bearer' })
        .expect(422);
    });

    test('17. Eliminar inexistente. Expect 404', async () => {
      await api
        .delete('/api/sale-deliveries/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });
});
