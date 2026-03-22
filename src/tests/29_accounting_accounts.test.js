const request = require('supertest');
const server = require('../../app');

const {
  accountCreate,
  accountCreateChild,
  accountCreateNoCode,
  accountCreateNoName,
  accountCreateNoType,
  accountCreateInvalidType,
  accountCreateInvalidNature,
  accountUpdate
} = require('./helper/helperData');

let Token = '';
let createdAccountId = null;
let createdChildAccountId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para AccountingAccounts
 *
 * 1.  Login para obtener token
 * 2.  GET /accounting/accounts — lista completa
 * 3.  GET /accounting/accounts/tree — árbol jerárquico
 * 4.  POST — crear cuenta válida (nivel 1, no system)
 * 5.  POST — crear cuenta sin code (400)
 * 6.  POST — crear cuenta sin name (400)
 * 7.  POST — crear cuenta sin type (400)
 * 8.  POST — crear cuenta con type inválido (400)
 * 9.  POST — crear cuenta con nature inválida (400)
 * 10. POST — crear cuenta con código duplicado (422)
 * 11. POST — crear subcuenta (nivel 2) con parent_id válido (200)
 * 12. POST — crear subcuenta con level incorrecto respecto al padre (422)
 * 13. POST — crear subcuenta con parent_id inexistente (404)
 * 14. GET /:id — obtener cuenta creada (200)
 * 15. GET /:id — cuenta inexistente (404)
 * 16. PUT /:id — actualizar cuenta (200)
 * 17. PUT /:id — cuenta inexistente (404)
 * 18. DELETE /:id — cuenta con hijos no puede eliminarse (422)
 * 19. DELETE /:id — eliminar cuenta hija primero (200)
 * 20. DELETE /:id — cuenta de sistema no puede eliminarse (422)
 * 21. DELETE /:id — eliminar cuenta de prueba (200)
 * 22. GET /:id — verificar que la cuenta queda inactiva (200, active=false)
 */

describe('[ACCOUNTING ACCOUNTS] Test api /api/accounting/accounts', () => {
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

  test('1. Obtener lista completa de cuentas. Expect 200', async () => {
    const response = await api
      .get('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('accounts');
    expect(Array.isArray(response.body.accounts)).toBe(true);
  });

  test('2. Obtener árbol jerárquico de cuentas. Expect 200', async () => {
    const response = await api
      .get('/api/accounting/accounts/tree')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('tree');
    expect(Array.isArray(response.body.tree)).toBe(true);

    const firstNode = response.body.tree[0];
    expect(firstNode).toHaveProperty('children');
    expect(Array.isArray(firstNode.children)).toBe(true);
  });

  test('3. Crear cuenta con datos válidos. Expect 200', async () => {
    const response = await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreate)
      .expect(200);

    expect(response.body).toHaveProperty('account');
    expect(response.body.account).toHaveProperty('id');
    expect(response.body.account.code).toBe(accountCreate.code);
    expect(response.body.account.type).toBe(accountCreate.type);
    expect(response.body.account.is_system).toBe(false);

    createdAccountId = response.body.account.id;
  });

  test('4. Crear cuenta sin code. Expect 400', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreateNoCode)
      .expect(400);
  });

  test('5. Crear cuenta sin name. Expect 400', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreateNoName)
      .expect(400);
  });

  test('6. Crear cuenta sin type. Expect 400', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreateNoType)
      .expect(400);
  });

  test('7. Crear cuenta con type inválido. Expect 400', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreateInvalidType)
      .expect(400);
  });

  test('8. Crear cuenta con nature inválida. Expect 400', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreateInvalidNature)
      .expect(400);
  });

  test('9. Crear cuenta con código duplicado. Expect 422', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send(accountCreate)
      .expect(422);
  });

  test('10. Crear subcuenta (nivel 2) con parent_id válido. Expect 200', async () => {
    const response = await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send({ ...accountCreateChild, parent_id: createdAccountId })
      .expect(200);

    expect(response.body.account).toHaveProperty('id');
    expect(response.body.account.level).toBe(2);
    expect(response.body.account.parent_id).toBe(createdAccountId);

    createdChildAccountId = response.body.account.id;
  });

  test('11. Crear subcuenta con level incorrecto respecto al padre. Expect 422', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send({ ...accountCreateChild, code: 'TEST-BAD-LEVEL', level: 3, parent_id: createdAccountId })
      .expect(422);
  });

  test('12. Crear subcuenta con parent_id inexistente. Expect 404', async () => {
    await api
      .post('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .send({ ...accountCreateChild, code: 'TEST-BAD-PARENT', parent_id: 99999 })
      .expect(404);
  });

  test('13. Obtener cuenta por id. Expect 200', async () => {
    const response = await api
      .get(`/api/accounting/accounts/${createdAccountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('account');
    expect(response.body.account.id).toBe(createdAccountId);
    expect(response.body.account.code).toBe(accountCreate.code);
  });

  test('14. Obtener cuenta inexistente. Expect 404', async () => {
    await api
      .get('/api/accounting/accounts/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('15. Actualizar cuenta. Expect 200', async () => {
    const response = await api
      .put(`/api/accounting/accounts/${createdAccountId}`)
      .auth(Token, { type: 'bearer' })
      .send(accountUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('account');
    expect(response.body.account.name).toBe(accountUpdate.name);
  });

  test('16. Actualizar cuenta inexistente. Expect 404', async () => {
    await api
      .put('/api/accounting/accounts/99999')
      .auth(Token, { type: 'bearer' })
      .send(accountUpdate)
      .expect(404);
  });

  test('17. Eliminar cuenta con hijos activos no puede eliminarse. Expect 422', async () => {
    await api
      .delete(`/api/accounting/accounts/${createdAccountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(422);
  });

  test('18. Eliminar cuenta hija (no system). Expect 200', async () => {
    const response = await api
      .delete(`/api/accounting/accounts/${createdChildAccountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('19. Eliminar cuenta de sistema. Expect 422', async () => {
    const listResponse = await api
      .get('/api/accounting/accounts')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const systemAccount = listResponse.body.accounts.find(a => a.is_system === true);
    expect(systemAccount).toBeDefined();

    await api
      .delete(`/api/accounting/accounts/${systemAccount.id}`)
      .auth(Token, { type: 'bearer' })
      .expect(422);
  });

  test('20. Eliminar cuenta de prueba (no system, sin hijos). Expect 200', async () => {
    const response = await api
      .delete(`/api/accounting/accounts/${createdAccountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('21. Verificar que la cuenta eliminada queda inactiva. Expect 200 con active=false', async () => {
    const response = await api
      .get(`/api/accounting/accounts/${createdAccountId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.account.active).toBe(false);
  });
});
