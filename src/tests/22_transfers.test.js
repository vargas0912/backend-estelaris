const request = require('supertest');
const server = require('../../app');

const {
  transferCreate,
  transferNoFromBranch,
  transferNoToBranch,
  transferSameBranch,
  transferNoItems,
  transferUpdate,
  receiveAllItems,
  receivePartialItems,
  receiveExceedsQty
} = require('./helper/transfersData');

let Token = '';
let transferId = null; // Borrador, se usa en update/delete
let dispatchTransferId = null; // Para dispatch + receive tests
let detailId = null; // Detail del dispatchTransfer
let detailQty = null; // Qty del detail para calcular receive

const FROM_BRANCH = 1;
const TO_BRANCH = 2;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Tests para el módulo de Transferencias
 *
 * Setup: Login + crear transferencias de prueba dinámicamente
 *
 * POST /api/transfers
 *   1. Crear transferencia válida → 200, status Borrador
 *   2. Misma sucursal origen/destino → 400
 *   3. Sin from_branch_id → 400
 *   4. Sin to_branch_id → 400
 *   5. Items vacíos → 400
 *   6. Sin token → 401
 *
 * GET /api/transfers
 *   7. Listar todos → 200
 *   8. Por sucursal origen → 200
 *   9. Por sucursal destino → 200
 *   10. Por id → 200
 *   11. Por id inexistente → 404
 *   12. Sin token → 401
 *
 * PUT /api/transfers/:id
 *   13. Actualizar borrador → 200
 *   14. Actualizar En_Transito → 409
 *
 * PATCH /api/transfers/:id/dispatch
 *   15. Despachar borrador válido → 200, status En_Transito
 *   16. Despachar ya En_Transito → 409
 *   17. Despachar con stock insuficiente → 422
 *
 * PATCH /api/transfers/:id/receive
 *   18. Recibir todo → 200, stock en destino incrementado
 *   19. Recibir parcialmente → 200
 *   20. Recibir con qty_received > qty → 422
 *   21. Recibir En_Transito inexistente → 409
 *
 * DELETE /api/transfers/:id
 *   22. Eliminar Borrador (sin reversal) → 200
 *   23. Eliminar En_Transito (con reversal de stock) → 200
 *   24. Eliminar Recibido → 409
 *   25. Eliminar inexistente → 404
 *   26. Sin token → 401
 */

describe('[TRANSFERS] Test api transfers /api/transfers/', () => {
  beforeAll(async () => {
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Crear transferencia para dispatch/receive tests
    const dispatchRes = await api
      .post('/api/transfers')
      .auth(Token, { type: 'bearer' })
      .send(transferCreate(FROM_BRANCH, TO_BRANCH))
      .expect(200);

    dispatchTransferId = dispatchRes.body.transfer.id;
    detailId = dispatchRes.body.transfer.details[0].id;
    detailQty = parseFloat(dispatchRes.body.transfer.details[0].qty);
  });

  // ============================================
  // POST /api/transfers
  // ============================================
  describe('POST /api/transfers', () => {
    test('1. Crear transferencia válida. Expect 200, status Borrador', async () => {
      const response = await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferCreate(FROM_BRANCH, TO_BRANCH))
        .expect(200);

      expect(response.body).toHaveProperty('transfer');
      expect(response.body.transfer).toHaveProperty('id');
      expect(response.body.transfer.status).toBe('Borrador');
      expect(response.body.transfer.from_branch_id).toBe(FROM_BRANCH);
      expect(response.body.transfer.to_branch_id).toBe(TO_BRANCH);
      expect(Array.isArray(response.body.transfer.details)).toBe(true);
      expect(response.body.transfer.details.length).toBe(1);

      transferId = response.body.transfer.id;
    });

    test('2. Misma sucursal origen y destino. Expect 400', async () => {
      await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferSameBranch(FROM_BRANCH))
        .expect(400);
    });

    test('3. Sin from_branch_id. Expect 400', async () => {
      await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferNoFromBranch(TO_BRANCH))
        .expect(400);
    });

    test('4. Sin to_branch_id. Expect 400', async () => {
      await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferNoToBranch(FROM_BRANCH))
        .expect(400);
    });

    test('5. Items vacíos. Expect 400', async () => {
      await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferNoItems(FROM_BRANCH, TO_BRANCH))
        .expect(400);
    });

    test('6. Sin token. Expect 401', async () => {
      await api
        .post('/api/transfers')
        .send(transferCreate(FROM_BRANCH, TO_BRANCH))
        .expect(401);
    });
  });

  // ============================================
  // GET /api/transfers
  // ============================================
  describe('GET /api/transfers', () => {
    test('7. Listar todas las transferencias. Expect 200', async () => {
      const response = await api
        .get('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
      expect(response.body.transfers.length).toBeGreaterThan(0);
    });

    test('8. Listar por sucursal origen. Expect 200', async () => {
      const response = await api
        .get(`/api/transfers/from-branch/${FROM_BRANCH}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
      expect(response.body.transfers.every(t => t.from_branch_id === FROM_BRANCH)).toBe(true);
    });

    test('9. Listar por sucursal destino. Expect 200', async () => {
      const response = await api
        .get(`/api/transfers/to-branch/${TO_BRANCH}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transfers');
      expect(Array.isArray(response.body.transfers)).toBe(true);
      expect(response.body.transfers.every(t => t.to_branch_id === TO_BRANCH)).toBe(true);
    });

    test('10. Obtener por id. Expect 200', async () => {
      const response = await api
        .get(`/api/transfers/${transferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('transfer');
      expect(response.body.transfer.id).toBe(transferId);
      expect(response.body.transfer).toHaveProperty('fromBranch');
      expect(response.body.transfer).toHaveProperty('toBranch');
      expect(response.body.transfer).toHaveProperty('details');
    });

    test('11. Obtener id inexistente. Expect 404', async () => {
      await api
        .get('/api/transfers/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('12. Sin token. Expect 401', async () => {
      await api
        .get('/api/transfers')
        .expect(401);
    });
  });

  // ============================================
  // PUT /api/transfers/:id
  // ============================================
  describe('PUT /api/transfers/:id', () => {
    test('13. Actualizar transferencia en Borrador. Expect 200', async () => {
      const response = await api
        .put(`/api/transfers/${transferId}`)
        .auth(Token, { type: 'bearer' })
        .send(transferUpdate())
        .expect(200);

      expect(response.body).toHaveProperty('transfer');
      expect(response.body.transfer.transport_plate).toBe('XYZ-999');
      expect(response.body.transfer.notes).toBe('Notas actualizadas');
    });

    test('14. Actualizar transferencia En_Transito. Expect 409', async () => {
      // Despachar primero
      await api
        .patch(`/api/transfers/${dispatchTransferId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      await api
        .put(`/api/transfers/${dispatchTransferId}`)
        .auth(Token, { type: 'bearer' })
        .send(transferUpdate())
        .expect(409);
    });
  });

  // ============================================
  // PATCH /api/transfers/:id/dispatch
  // ============================================
  describe('PATCH /api/transfers/:id/dispatch', () => {
    test('15. Verificar que el dispatch fue exitoso (test anterior). Expect En_Transito', async () => {
      const response = await api
        .get(`/api/transfers/${dispatchTransferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body.transfer.status).toBe('En_Transito');
    });

    test('16. Despachar transferencia ya En_Transito. Expect 409', async () => {
      await api
        .patch(`/api/transfers/${dispatchTransferId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(409);
    });

    test('17. Despachar con stock insuficiente (qty alta). Expect 422', async () => {
      // Crear transferencia con qty muy grande que exceda el stock disponible
      const bigQtyTransfer = {
        from_branch_id: FROM_BRANCH,
        to_branch_id: TO_BRANCH,
        transfer_date: '2026-03-02',
        items: [
          { product_id: 'TEST-001', qty: 999999, unit_cost: 100.00 }
        ]
      };

      const createRes = await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(bigQtyTransfer)
        .expect(200);

      const bigTransferId = createRes.body.transfer.id;

      await api
        .patch(`/api/transfers/${bigTransferId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(422);

      // Cleanup: eliminar el borrador
      await api
        .delete(`/api/transfers/${bigTransferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);
    });
  });

  // ============================================
  // PATCH /api/transfers/:id/receive
  // ============================================
  describe('PATCH /api/transfers/:id/receive', () => {
    test('18. Recibir transferencia completa. Expect 200, status Recibido', async () => {
      const response = await api
        .patch(`/api/transfers/${dispatchTransferId}/receive`)
        .auth(Token, { type: 'bearer' })
        .send(receiveAllItems(detailId, detailQty))
        .expect(200);

      expect(response.body).toHaveProperty('transfer');
      expect(response.body.transfer.status).toBe('Recibido');
      expect(response.body.transfer.received_at).toBeTruthy();
      expect(response.body.transfer.received_by).toBeTruthy();
    });

    test('19. Recibir transferencia parcialmente. Expect 200', async () => {
      // Crear y despachar una nueva transferencia para recibirla parcialmente
      const partialRes = await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferCreate(FROM_BRANCH, TO_BRANCH))
        .expect(200);

      const partialId = partialRes.body.transfer.id;
      const partialDetailId = partialRes.body.transfer.details[0].id;
      const partialQty = parseFloat(partialRes.body.transfer.details[0].qty);

      await api
        .patch(`/api/transfers/${partialId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      const response = await api
        .patch(`/api/transfers/${partialId}/receive`)
        .auth(Token, { type: 'bearer' })
        .send(receivePartialItems(partialDetailId, partialQty))
        .expect(200);

      expect(response.body.transfer.status).toBe('Recibido');
      const receivedQty = parseFloat(response.body.transfer.details[0].qty_received);
      expect(receivedQty).toBeCloseTo(partialQty / 2, 2);
    });

    test('20. qty_received excede qty enviada. Expect 422', async () => {
      // dispatchTransferId ya está Recibido; crear nueva transferencia para este test
      const exceedRes = await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferCreate(FROM_BRANCH, TO_BRANCH))
        .expect(200);

      const exceedId = exceedRes.body.transfer.id;
      const exceedDetailId = exceedRes.body.transfer.details[0].id;
      const exceedQty = parseFloat(exceedRes.body.transfer.details[0].qty);

      await api
        .patch(`/api/transfers/${exceedId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      await api
        .patch(`/api/transfers/${exceedId}/receive`)
        .auth(Token, { type: 'bearer' })
        .send(receiveExceedsQty(exceedDetailId, exceedQty))
        .expect(422);
    });

    test('21. Recibir transferencia ya Recibida. Expect 409', async () => {
      await api
        .patch(`/api/transfers/${dispatchTransferId}/receive`)
        .auth(Token, { type: 'bearer' })
        .send(receiveAllItems(detailId, detailQty))
        .expect(409);
    });
  });

  // ============================================
  // DELETE /api/transfers/:id
  // ============================================
  describe('DELETE /api/transfers/:id', () => {
    test('22. Eliminar transferencia en Borrador (sin reversal). Expect 200', async () => {
      const response = await api
        .delete(`/api/transfers/${transferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');

      // Verificar que ya no existe
      await api
        .get(`/api/transfers/${transferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('23. Eliminar transferencia En_Transito (con reversal de stock). Expect 200', async () => {
      // Crear y despachar
      const createRes = await api
        .post('/api/transfers')
        .auth(Token, { type: 'bearer' })
        .send(transferCreate(FROM_BRANCH, TO_BRANCH))
        .expect(200);

      const cancelId = createRes.body.transfer.id;

      await api
        .patch(`/api/transfers/${cancelId}/dispatch`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      // Eliminar En_Transito
      const response = await api
        .delete(`/api/transfers/${cancelId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
    });

    test('24. Eliminar transferencia Recibida. Expect 409', async () => {
      await api
        .delete(`/api/transfers/${dispatchTransferId}`)
        .auth(Token, { type: 'bearer' })
        .expect(409);
    });

    test('25. Eliminar transferencia inexistente. Expect 404', async () => {
      await api
        .delete('/api/transfers/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('26. Eliminar sin token. Expect 401', async () => {
      await api
        .delete('/api/transfers/1')
        .expect(401);
    });
  });
});
