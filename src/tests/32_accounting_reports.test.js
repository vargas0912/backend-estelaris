const request = require('supertest');
const server = require('../../app');

let Token = '';
let periodId = null;
let accountId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para AccountingReports
 *
 * Depende de test 31: el período 2025-06 y sus pólizas ya existen en la BD.
 *
 * Setup (beforeAll):
 *   - Login, obtener token
 *   - Obtener el período 2025-06 vía GET /api/accounting/periods (buscar year=2025 month=6)
 *   - Obtener una cuenta con movimientos para el mayor contable
 *
 * 1.  GET /journal sin token → 401
 * 2.  GET /journal?period_id=X → 200, tiene vouchers con lines
 * 3.  GET /journal sin filtros → 200 (retorna pólizas aplicadas)
 * 4.  GET /ledger sin account_id → 400
 * 5.  GET /ledger?account_id=X → 200, tiene account, opening_balance, movements, closing_balance
 * 6.  GET /ledger?account_id=99999 → 404
 * 7.  GET /trial-balance sin period_id → 400
 * 8.  GET /trial-balance?period_id=X → 200, tiene accounts, total_debit, total_credit, balanced
 * 9.  GET /balance-sheet sin period_id → 400
 * 10. GET /balance-sheet?period_id=X → 200, tiene activo, pasivo, capital
 * 11. GET /income-statement sin period_id → 400
 * 12. GET /income-statement?period_id=X → 200, tiene ingresos, costos, egresos, utilidad_neta
 */

describe('[ACCOUNTING REPORTS] Test api /api/accounting/reports', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    Token = loginRes.body.sesion.token;

    // Buscar el período 2025-06 creado por test 31
    const periodsRes = await api
      .get('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const period = periodsRes.body.periods.find(
      (p) => p.year === 2025 && p.month === 6
    );

    expect(period).toBeDefined();
    periodId = period.id;

    // Obtener una cuenta que permita movimientos para el mayor contable
    const accountsRes = await api
      .get('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const movableAccount = accountsRes.body.accounts.find(
      (a) => a.allows_movements === true && a.active === true
    );

    expect(movableAccount).toBeDefined();
    accountId = movableAccount.id;
  });

  test('1. GET /journal sin token. Expect 401', async () => {
    await api
      .get('/api/accounting/reports/journal')
      .expect(401);
  });

  test('2. GET /journal?period_id=X → 200, tiene vouchers con lines', async () => {
    const response = await api
      .get(`/api/accounting/reports/journal?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('vouchers');
    expect(Array.isArray(response.body.vouchers)).toBe(true);
    expect(response.body.vouchers.length).toBeGreaterThan(0);

    const firstVoucher = response.body.vouchers[0];
    expect(firstVoucher).toHaveProperty('lines');
    expect(Array.isArray(firstVoucher.lines)).toBe(true);
  });

  test('3. GET /journal sin filtros → 200 (retorna todas las pólizas aplicadas)', async () => {
    const response = await api
      .get('/api/accounting/reports/journal')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('vouchers');
    expect(Array.isArray(response.body.vouchers)).toBe(true);
  });

  test('4. GET /ledger sin account_id → 400', async () => {
    await api
      .get('/api/accounting/reports/ledger')
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });

  test('5. GET /ledger?account_id=X → 200, con account, opening_balance, movements, closing_balance', async () => {
    const response = await api
      .get(`/api/accounting/reports/ledger?account_id=${accountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('account');
    expect(response.body).toHaveProperty('opening_balance');
    expect(response.body).toHaveProperty('movements');
    expect(response.body).toHaveProperty('closing_balance');
    expect(Array.isArray(response.body.movements)).toBe(true);
  });

  test('6. GET /ledger?account_id=99999 → 404', async () => {
    await api
      .get('/api/accounting/reports/ledger?account_id=99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. GET /trial-balance sin period_id → 400', async () => {
    await api
      .get('/api/accounting/reports/trial-balance')
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });

  test('8. GET /trial-balance?period_id=X → 200, con accounts, total_debit, total_credit, balanced', async () => {
    const response = await api
      .get(`/api/accounting/reports/trial-balance?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('accounts');
    expect(response.body).toHaveProperty('total_debit');
    expect(response.body).toHaveProperty('total_credit');
    expect(response.body).toHaveProperty('balanced');
    expect(Array.isArray(response.body.accounts)).toBe(true);
    expect(typeof response.body.balanced).toBe('boolean');
  });

  test('9. GET /balance-sheet sin period_id → 400', async () => {
    await api
      .get('/api/accounting/reports/balance-sheet')
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });

  test('10. GET /balance-sheet?period_id=X → 200, con activo, pasivo, capital', async () => {
    const response = await api
      .get(`/api/accounting/reports/balance-sheet?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('activo');
    expect(response.body).toHaveProperty('pasivo');
    expect(response.body).toHaveProperty('capital');
  });

  test('11. GET /income-statement sin period_id → 400', async () => {
    await api
      .get('/api/accounting/reports/income-statement')
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });

  test('12. GET /income-statement?period_id=X → 200, con ingresos, costos, egresos, utilidad_neta', async () => {
    const response = await api
      .get(`/api/accounting/reports/income-statement?period_id=${periodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ingresos');
    expect(response.body).toHaveProperty('costos');
    expect(response.body).toHaveProperty('egresos');
    expect(response.body).toHaveProperty('utilidad_neta');
  });
});
