const request = require('supertest');
const server = require('../../app');

const {
  expenseCreate,
  expenseCreateNoType,
  expenseCreateNoDate,
  expenseCreateNoAmount,
  expenseUpdate
} = require('./helper/helperData');

let Token = '';
let createdExpenseId = null;

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Expenses
 *
 * 1. Login para obtener token (usando superadmin existente)
 * 2. Obtener lista de todos los gastos
 * 3. Crear gasto con datos validos (con X-Branch-ID: 1)
 * 4. Crear gasto sin expense_type_id (error 400)
 * 5. Crear gasto sin trans_date (error 400)
 * 6. Crear gasto sin expense_amount (error 400)
 * 7. Obtener gasto por id
 * 8. Obtener gasto inexistente (error 404)
 * 9. Obtener gastos por sucursal
 * 10. Actualizar gasto
 * 11. Eliminar gasto
 * 12. Verificar que el gasto eliminado no existe
 */

describe('[EXPENSES] Test api expenses //api/expenses/', () => {
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

  test('1. Obtener lista de todos los gastos. Expect 200', async() => {
    const response = await api
      .get('/api/expenses')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expenses');
    expect(Array.isArray(response.body.expenses)).toBe(true);
  });

  test('2. Crear gasto con datos validos. Expect 200', async() => {
    const response = await api
      .post('/api/expenses')
      .auth(Token, { type: 'bearer' })
      .set('X-Branch-ID', '1')
      .send(expenseCreate)
      .expect(200);

    expect(response.body).toHaveProperty('expense');
    expect(response.body.expense).toHaveProperty('id');
    expect(response.body.expense.expense_type_id).toBe(expenseCreate.expense_type_id);

    createdExpenseId = response.body.expense.id;
  });

  test('3. Crear gasto sin expense_type_id. Expect 400', async() => {
    await api
      .post('/api/expenses')
      .auth(Token, { type: 'bearer' })
      .set('X-Branch-ID', '1')
      .send(expenseCreateNoType)
      .expect(400);
  });

  test('4. Crear gasto sin trans_date. Expect 400', async() => {
    await api
      .post('/api/expenses')
      .auth(Token, { type: 'bearer' })
      .set('X-Branch-ID', '1')
      .send(expenseCreateNoDate)
      .expect(400);
  });

  test('5. Crear gasto sin expense_amount. Expect 400', async() => {
    await api
      .post('/api/expenses')
      .auth(Token, { type: 'bearer' })
      .set('X-Branch-ID', '1')
      .send(expenseCreateNoAmount)
      .expect(400);
  });

  test('6. Obtener gasto por id. Expect 200', async() => {
    const response = await api
      .get(`/api/expenses/${createdExpenseId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expense');
    expect(response.body.expense.id).toBe(createdExpenseId);
  });

  test('7. Obtener gasto inexistente. Expect 404', async() => {
    await api
      .get('/api/expenses/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('8. Obtener gastos por sucursal. Expect 200', async() => {
    const response = await api
      .get('/api/expenses/branch/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expenses');
    expect(Array.isArray(response.body.expenses)).toBe(true);
  });

  test('9. Actualizar gasto. Expect 200', async() => {
    const response = await api
      .put(`/api/expenses/${createdExpenseId}`)
      .auth(Token, { type: 'bearer' })
      .send(expenseUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('expense');
    expect(parseFloat(response.body.expense.expense_amount)).toBe(parseFloat(expenseUpdate.expense_amount));
  });

  test('10. Eliminar gasto. Expect 200', async() => {
    const response = await api
      .delete(`/api/expenses/${createdExpenseId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('11. Verificar que el gasto eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/expenses/${createdExpenseId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });
});
