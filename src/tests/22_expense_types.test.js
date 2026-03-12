const request = require('supertest');
const server = require('../../app');

const {
  expenseTypeCreate,
  expenseTypeCreateEmpty,
  expenseTypeCreateInvalid,
  expenseTypeUpdate
} = require('./helper/helperData');

let Token = '';
let createdExpenseTypeId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Expense Types
 *
 * 1. Login para obtener token (usando superadmin existente)
 * 2. Obtener lista de tipos de gastos
 * 3. Crear tipo de gasto con datos validos
 * 4. Crear tipo de gasto con nombre vacio (error)
 * 5. Crear tipo de gasto sin datos (error)
 * 6. Obtener tipo de gasto por id
 * 7. Obtener tipo de gasto inexistente (error)
 * 8. Actualizar tipo de gasto
 * 9. Eliminar tipo de gasto
 * 10. Verificar que el tipo de gasto eliminado no existe
 */

describe('[EXPENSE_TYPES] Test api expense-types //api/expense-types/', () => {
  test('Login para obtener token. 200', async() => {
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

  test('1. Obtener lista de tipos de gastos. Expect 200', async() => {
    const response = await api
      .get('/api/expense-types')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expenseTypes');
    expect(Array.isArray(response.body.expenseTypes)).toBe(true);
  });

  test('2. Crear tipo de gasto con datos validos. Expect 200', async() => {
    const response = await api
      .post('/api/expense-types')
      .auth(Token, { type: 'bearer' })
      .send(expenseTypeCreate)
      .expect(200);

    expect(response.body).toHaveProperty('expenseType');
    expect(response.body.expenseType).toHaveProperty('id');
    expect(response.body.expenseType.name).toBe(expenseTypeCreate.name);

    createdExpenseTypeId = response.body.expenseType.id;
  });

  test('3. Crear tipo de gasto con nombre vacio. Expect 400', async() => {
    await api
      .post('/api/expense-types')
      .auth(Token, { type: 'bearer' })
      .send(expenseTypeCreateEmpty)
      .expect(400);
  });

  test('4. Crear tipo de gasto sin datos. Expect 400', async() => {
    await api
      .post('/api/expense-types')
      .auth(Token, { type: 'bearer' })
      .send(expenseTypeCreateInvalid)
      .expect(400);
  });

  test('5. Obtener tipo de gasto por id. Expect 200', async() => {
    const response = await api
      .get(`/api/expense-types/${createdExpenseTypeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expenseType');
    expect(response.body.expenseType.id).toBe(createdExpenseTypeId);
  });

  test('6. Obtener tipo de gasto inexistente. Expect 404', async() => {
    await api
      .get('/api/expense-types/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar tipo de gasto. Expect 200', async() => {
    const response = await api
      .put(`/api/expense-types/${createdExpenseTypeId}`)
      .auth(Token, { type: 'bearer' })
      .send(expenseTypeUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('expenseType');
    expect(response.body.expenseType.name).toBe(expenseTypeUpdate.name);
  });

  test('8. Eliminar tipo de gasto. Expect 200', async() => {
    const response = await api
      .delete(`/api/expense-types/${createdExpenseTypeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el tipo de gasto eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/expense-types/${createdExpenseTypeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });
});
