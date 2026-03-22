const request = require('supertest');
const server = require('../../app');

let Token = '';
let periodId = null;
let acc1Id = null;
let acc2Id = null;

// Voucher IDs captured across tests
let voucherId = null; // 1st voucher: balanced borrador → applied → cancelled (borrador cancel)
let unbalancedVoucherId = null; // 2nd voucher: unbalanced borrador → apply fails
let appliedVoucherId = null; // 3rd voucher: balanced borrador → applied → cancelled (applied cancel + reversal)
let reversalVoucherId = null; // auto-generated reversal of the 3rd voucher
let deleteVoucherId = null; // 4th voucher: borrador → deleted

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para AccountingVouchers
 *
 * Setup (beforeAll):
 *   - Login, obtener token
 *   - Crear período contable 2025-06 (abierto, año distinto al de test 30)
 *   - Buscar dos cuentas de nivel 3 que permitan movimientos (allows_movements=true)
 *
 * 1.  GET / — lista vacía para este período
 * 2.  POST sin token → 401
 * 3.  POST con líneas balanceadas (debit=credit) → 200, status='borrador'
 * 4.  POST con solo 1 línea → 422
 * 5.  POST con account_id inexistente → 422/404
 * 6.  GET /:id → 200 con lines
 * 7.  GET /99999 → 404
 * 8.  PUT /:id actualizar description → 200
 * 9.  PUT /:id/apply — póliza balanceada → 200, status='aplicada'
 * 10. PUT /:id/apply — ya aplicada → 409
 * 11. PUT /:id (update) en póliza aplicada → 409
 * 12. POST segunda póliza con líneas desbalanceadas → 200 (borrador acepta)
 * 13. PUT segunda/:id/apply → 422 (UNBALANCED_VOUCHER)
 * 14. PUT /:id/cancel en póliza borrador → 200, status='cancelada', sin reversión
 * 15. POST tercera póliza balanceada → 200
 * 16. PUT tercera/:id/apply → 200, status='aplicada'
 * 17. PUT aplicada/:id/cancel → 200, status='cancelada', reversión creada
 * 18. Verificar que la reversión existe con type='ajuste' y líneas invertidas
 * 19. DELETE en póliza aplicada → 409
 * 20. POST cuarta póliza (borrador) → 200
 * 21. DELETE cuarta/:id → 200
 * 22. GET / filtro status=aplicada → solo pólizas aplicadas
 * 23. GET / filtro period_id → resultados filtrados por período
 */

describe('[ACCOUNTING VOUCHERS] Test api /api/accounting/vouchers', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Crear período contable en 2025-06 para no colisionar con los períodos de test 30 (2026)
    const periodRes = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'Voucher Test Period', year: 2025, month: 6 })
      .expect(200);

    periodId = periodRes.body.period.id;

    // Obtener cuentas de nivel 3 que permitan movimientos
    const accountsRes = await api
      .get('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const movableAccounts = accountsRes.body.accounts.filter(
      (a) => a.allows_movements === true && a.active === true
    );

    expect(movableAccounts.length).toBeGreaterThanOrEqual(2);

    acc1Id = movableAccounts[0].id;
    acc2Id = movableAccounts[1].id;
  });

  test('1. GET / lista para el período recién creado. Expect 200 con array vacío', async () => {
    const response = await api
      .get(`/api/accounting/vouchers?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('vouchers');
    expect(Array.isArray(response.body.vouchers)).toBe(true);
    expect(response.body.vouchers).toHaveLength(0);
  });

  test('2. POST sin token. Expect 401', async () => {
    await api
      .post('/api/accounting/vouchers')
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-15',
        description: 'Sin token',
        lines: [
          { account_id: acc1Id, debit: 1000, credit: 0, description: 'Cargo' },
          { account_id: acc2Id, debit: 0, credit: 1000, description: 'Abono' }
        ]
      })
      .expect(401);
  });

  test('3. POST con líneas balanceadas → 200, status borrador, folio generado', async () => {
    const response = await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-15',
        description: 'Póliza de prueba balanceada',
        lines: [
          { account_id: acc1Id, debit: 1000, credit: 0, description: 'Cargo' },
          { account_id: acc2Id, debit: 0, credit: 1000, description: 'Abono' }
        ]
      })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher).toHaveProperty('id');
    expect(response.body.voucher.status).toBe('borrador');
    expect(response.body.voucher.type).toBe('diario');
    expect(response.body.voucher.folio).toBeDefined();
    expect(response.body.voucher.period_id).toBe(periodId);

    voucherId = response.body.voucher.id;
  });

  test('4. POST con solo 1 línea → 422 (mínimo 2 líneas)', async () => {
    await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-15',
        description: 'Póliza con una sola línea',
        lines: [
          { account_id: acc1Id, debit: 500, credit: 0, description: 'Solo cargo' }
        ]
      })
      .expect(422);
  });

  test('5. POST con account_id inexistente → error (404 o 422)', async () => {
    const response = await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-15',
        description: 'Póliza con cuenta inexistente',
        lines: [
          { account_id: 99999, debit: 500, credit: 0, description: 'Cuenta inexistente' },
          { account_id: acc2Id, debit: 0, credit: 500, description: 'Abono' }
        ]
      });

    expect([404, 422]).toContain(response.status);
  });

  test('6. GET /:id retorna póliza con lines. Expect 200', async () => {
    const response = await api
      .get(`/api/accounting/vouchers/${voucherId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher.id).toBe(voucherId);
    expect(response.body.voucher).toHaveProperty('lines');
    expect(Array.isArray(response.body.voucher.lines)).toBe(true);
    expect(response.body.voucher.lines.length).toBeGreaterThanOrEqual(2);
  });

  test('7. GET /99999 → 404', async () => {
    await api
      .get('/api/accounting/vouchers/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('8. PUT /:id actualizar description en borrador → 200', async () => {
    const response = await api
      .put(`/api/accounting/vouchers/${voucherId}`)
      .auth(Token, { type: 'bearer' })
      .send({ description: 'Póliza de prueba actualizada' })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher.description).toBe('Póliza de prueba actualizada');
  });

  test('9. PUT /:id/apply — póliza balanceada borrador → 200, status aplicada', async () => {
    const response = await api
      .put(`/api/accounting/vouchers/${voucherId}/apply`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher.status).toBe('aplicada');
  });

  test('10. PUT /:id/apply — póliza ya aplicada → 409', async () => {
    await api
      .put(`/api/accounting/vouchers/${voucherId}/apply`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('11. PUT /:id (update) en póliza aplicada → 409', async () => {
    await api
      .put(`/api/accounting/vouchers/${voucherId}`)
      .auth(Token, { type: 'bearer' })
      .send({ description: 'Intentando modificar póliza aplicada' })
      .expect(409);
  });

  test('12. POST póliza desbalanceada (borrador) → 200 (balance se verifica al aplicar)', async () => {
    const response = await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-16',
        description: 'Póliza desbalanceada en borrador',
        lines: [
          { account_id: acc1Id, debit: 1500, credit: 0, description: 'Cargo mayor' },
          { account_id: acc2Id, debit: 0, credit: 500, description: 'Abono menor' }
        ]
      })
      .expect(200);

    expect(response.body.voucher.status).toBe('borrador');
    unbalancedVoucherId = response.body.voucher.id;
  });

  test('13. PUT unbalanced/:id/apply → 422 (UNBALANCED_VOUCHER)', async () => {
    await api
      .put(`/api/accounting/vouchers/${unbalancedVoucherId}/apply`)
      .auth(Token, { type: 'bearer' })
      .expect(422);
  });

  test('14. PUT /:id/cancel en póliza borrador → 200, status cancelada, sin reversión', async () => {
    const response = await api
      .put(`/api/accounting/vouchers/${unbalancedVoucherId}/cancel`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher.status).toBe('cancelada');
    // Para borrador no se genera póliza de reversión
    expect(response.body.reversal).toBeUndefined();
  });

  test('15. POST tercera póliza balanceada (para probar cancel aplicada) → 200', async () => {
    const response = await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-17',
        description: 'Póliza para cancelar después de aplicar',
        lines: [
          { account_id: acc1Id, debit: 2000, credit: 0, description: 'Cargo para reversión' },
          { account_id: acc2Id, debit: 0, credit: 2000, description: 'Abono para reversión' }
        ]
      })
      .expect(200);

    appliedVoucherId = response.body.voucher.id;
  });

  test('16. PUT tercera/:id/apply → 200, status aplicada', async () => {
    const response = await api
      .put(`/api/accounting/vouchers/${appliedVoucherId}/apply`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.voucher.status).toBe('aplicada');
  });

  test('17. PUT aplicada/:id/cancel → 200, status cancelada, reversión creada', async () => {
    const response = await api
      .put(`/api/accounting/vouchers/${appliedVoucherId}/cancel`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('voucher');
    expect(response.body.voucher.status).toBe('cancelada');
    // Al cancelar una póliza aplicada se genera póliza de reversión
    expect(response.body).toHaveProperty('reversal');
    expect(response.body.reversal).toHaveProperty('id');

    reversalVoucherId = response.body.reversal.id;
  });

  test('18. Verificar reversión: type=ajuste, líneas invertidas. Expect 200', async () => {
    const response = await api
      .get(`/api/accounting/vouchers/${reversalVoucherId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.voucher.type).toBe('ajuste');
    expect(response.body.voucher.status).toBe('aplicada');
    expect(Array.isArray(response.body.voucher.lines)).toBe(true);
    expect(response.body.voucher.lines.length).toBeGreaterThanOrEqual(2);

    // Verificar que las líneas están invertidas respecto a la original
    const reversalLines = response.body.voucher.lines;
    const cargoLine = reversalLines.find((l) => l.account_id === acc1Id);
    const abonoLine = reversalLines.find((l) => l.account_id === acc2Id);

    expect(cargoLine).toBeDefined();
    expect(abonoLine).toBeDefined();
    // En la original acc1 tenía debit=2000; en la reversión debe tener credit=2000
    expect(parseFloat(cargoLine.credit)).toBeCloseTo(2000, 1);
    expect(parseFloat(abonoLine.debit)).toBeCloseTo(2000, 1);
  });

  test('19. DELETE en póliza aplicada → 409', async () => {
    await api
      .delete(`/api/accounting/vouchers/${voucherId}`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('20. POST cuarta póliza borrador → 200', async () => {
    const response = await api
      .post('/api/accounting/vouchers')
      .auth(Token, { type: 'bearer' })
      .send({
        type: 'diario',
        period_id: periodId,
        date: '2025-06-18',
        description: 'Póliza para eliminar',
        lines: [
          { account_id: acc1Id, debit: 100, credit: 0, description: 'Cargo a eliminar' },
          { account_id: acc2Id, debit: 0, credit: 100, description: 'Abono a eliminar' }
        ]
      })
      .expect(200);

    deleteVoucherId = response.body.voucher.id;
  });

  test('21. DELETE cuarta/:id (borrador) → 200', async () => {
    const response = await api
      .delete(`/api/accounting/vouchers/${deleteVoucherId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('22. GET / filtro status=aplicada → solo pólizas aplicadas', async () => {
    const response = await api
      .get('/api/accounting/vouchers?status=aplicada')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('vouchers');
    expect(Array.isArray(response.body.vouchers)).toBe(true);
    response.body.vouchers.forEach((v) => {
      expect(v.status).toBe('aplicada');
    });
  });

  test('23. GET / filtro period_id → solo pólizas del período. Expect 200', async () => {
    const response = await api
      .get(`/api/accounting/vouchers?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('vouchers');
    expect(Array.isArray(response.body.vouchers)).toBe(true);
    response.body.vouchers.forEach((v) => {
      expect(v.period_id).toBe(periodId);
    });
  });
});
