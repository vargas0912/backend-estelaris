const request = require('supertest');
const server = require('../../app');

const {
  periodCreate,
  periodCreateDuplicate,
  periodCreateNoName,
  periodCreateNoYear,
  periodCreateNoMonth,
  periodCreateInvalidMonth,
  periodCreate2
} = require('./helper/helperData');

let Token = '';
let createdPeriodId = null;
let secondPeriodId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para AccountingPeriods
 *
 * 1.  Login
 * 2.  GET /current — 404 (no hay períodos aún)
 * 3.  GET / — lista vacía
 * 4.  POST — crear período válido (Enero 2026)
 * 5.  POST — duplicado mismo año-mes → 422
 * 6.  POST — sin name → 400
 * 7.  POST — sin year → 400
 * 8.  POST — sin month → 400
 * 9.  POST — month inválido (13) → 400
 * 10. GET /current — retorna el período abierto
 * 11. GET /:id — obtener período creado
 * 12. GET /:id — inexistente → 404
 * 13. PUT /:id/reopen — período abierto no puede reabrirse → 409
 * 14. PUT /:id/lock — período abierto no puede bloquearse → 409
 * 15. PUT /:id/close — cerrar período → 200, status=cerrado
 * 16. PUT /:id/close — ya cerrado → 409
 * 17. GET /current — 404 (no hay abierto)
 * 18. POST — crear Feb 2026 sin anterior abierto → 200
 * 19. PUT /:id/lock — período cerrado bloqueado → 200
 * 20. PUT /:id/reopen — período bloqueado no puede reabrirse → 409
 * 21. PUT /:id/lock — ya bloqueado → 409
 * 22. PUT id1/reopen — reabrir el primer período (cerrado) → 200
 * 23. GET /current — retorna el período reabierto
 * 24. POST — crear período con anterior (Ene 2026) aún abierto → 422
 */

describe('[ACCOUNTING PERIODS] Test api /api/accounting/periods', () => {
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

  test('1. GET /current sin períodos. Expect 404', async () => {
    await api
      .get('/api/accounting/periods/current')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('2. GET / lista vacía. Expect 200', async () => {
    const response = await api
      .get('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('periods');
    expect(Array.isArray(response.body.periods)).toBe(true);
    expect(response.body.periods).toHaveLength(0);
  });

  test('3. POST crear período válido. Expect 200', async () => {
    const response = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreate)
      .expect(200);

    expect(response.body).toHaveProperty('period');
    expect(response.body.period).toHaveProperty('id');
    expect(response.body.period.status).toBe('abierto');
    expect(response.body.period.year).toBe(periodCreate.year);
    expect(response.body.period.month).toBe(periodCreate.month);

    createdPeriodId = response.body.period.id;
  });

  test('4. POST duplicado mismo año-mes. Expect 422', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreateDuplicate)
      .expect(422);
  });

  test('5. POST sin name. Expect 400', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreateNoName)
      .expect(400);
  });

  test('6. POST sin year. Expect 400', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreateNoYear)
      .expect(400);
  });

  test('7. POST sin month. Expect 400', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreateNoMonth)
      .expect(400);
  });

  test('8. POST month inválido (13). Expect 400', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreateInvalidMonth)
      .expect(400);
  });

  test('9. GET /current retorna período abierto. Expect 200', async () => {
    const response = await api
      .get('/api/accounting/periods/current')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('period');
    expect(response.body.period.status).toBe('abierto');
    expect(response.body.period.id).toBe(createdPeriodId);
  });

  test('10. GET /:id retorna período. Expect 200', async () => {
    const response = await api
      .get(`/api/accounting/periods/${createdPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.id).toBe(createdPeriodId);
    expect(response.body.period.name).toBe(periodCreate.name);
  });

  test('11. GET /:id inexistente. Expect 404', async () => {
    await api
      .get('/api/accounting/periods/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('12. PUT /reopen — período abierto no puede reabrirse. Expect 409', async () => {
    await api
      .put(`/api/accounting/periods/${createdPeriodId}/reopen`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('13. PUT /lock — período abierto no puede bloquearse. Expect 409', async () => {
    await api
      .put(`/api/accounting/periods/${createdPeriodId}/lock`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('14. PUT /close — cerrar período abierto. Expect 200', async () => {
    const response = await api
      .put(`/api/accounting/periods/${createdPeriodId}/close`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.status).toBe('cerrado');
    expect(response.body.period.closed_at).not.toBeNull();
    expect(response.body.period.closed_by_user_id).not.toBeNull();
  });

  test('15. PUT /close — ya cerrado. Expect 409', async () => {
    await api
      .put(`/api/accounting/periods/${createdPeriodId}/close`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('16. GET /current — sin período abierto. Expect 404', async () => {
    await api
      .get('/api/accounting/periods/current')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('17. POST Feb 2026 con anterior (Ene) cerrado. Expect 200', async () => {
    const response = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send(periodCreate2)
      .expect(200);

    expect(response.body.period.month).toBe(2);
    secondPeriodId = response.body.period.id;
  });

  test('18. PUT /close — cerrar Feb 2026 para poder bloquearlo. Expect 200', async () => {
    const response = await api
      .put(`/api/accounting/periods/${secondPeriodId}/close`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.status).toBe('cerrado');
  });

  test('19. PUT /lock — bloquear período cerrado. Expect 200', async () => {
    const response = await api
      .put(`/api/accounting/periods/${secondPeriodId}/lock`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.status).toBe('bloqueado');
  });

  test('20. PUT /reopen — período bloqueado no puede reabrirse. Expect 409', async () => {
    await api
      .put(`/api/accounting/periods/${secondPeriodId}/reopen`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('21. PUT /lock — ya bloqueado. Expect 409', async () => {
    await api
      .put(`/api/accounting/periods/${secondPeriodId}/lock`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('22. PUT /reopen — reabrir período cerrado. Expect 200', async () => {
    const response = await api
      .put(`/api/accounting/periods/${createdPeriodId}/reopen`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.status).toBe('abierto');
    expect(response.body.period.closed_at).toBeNull();
    expect(response.body.period.closed_by_user_id).toBeNull();
  });

  test('23. GET /current — retorna período reabierto. Expect 200', async () => {
    const response = await api
      .get('/api/accounting/periods/current')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.id).toBe(createdPeriodId);
    expect(response.body.period.status).toBe('abierto');
  });

  test('24. POST Mar 2026 con anterior (Feb) bloqueado → 200 permitido', async () => {
    // Feb 2026 está bloqueado (no abierto) → la regla no bloquea la creación de Mar
    const response = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'Marzo 2026', year: 2026, month: 3 })
      .expect(200);

    expect(response.body.period.month).toBe(3);
    expect(response.body.period.status).toBe('abierto');
  });

  test('25. POST Abril 2026 con Mar 2026 abierto → 422 anterior abierto', async () => {
    await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'Abril 2026', year: 2026, month: 4 })
      .expect(422);
  });
});
