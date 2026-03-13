const request = require('supertest');
const server = require('../../app');

let Token = '';
const api = request(server.app);

const dashboardTestUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

describe('[DASHBOARD - EXPENSES] Test api dashboard expenses //api/dashboard/', () => {
  beforeAll(async () => {
    // Intentar login primero
    let response = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(dashboardTestUser);

    // Si no existe el usuario, crear el superadmin
    if (response.status !== 200) {
      response = await api
        .post('/api/auth/registerSuperUser')
        .send({
          name: 'Super admin',
          email: 'superadmin@estelaris.com',
          role: 'superadmin',
          password: 'Admin123'
        });
    }

    // Obtener token
    const loginResponse = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(dashboardTestUser);

    Token = loginResponse.body.sesion.token;
  });

  test('1. Obtener gastos por mes. Expect 200', async() => {
    const response = await api
      .get('/api/dashboard/expenses-by-month')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expensesByMonth');
    expect(Array.isArray(response.body.expensesByMonth)).toBe(true);
  });

  test('2. Obtener gastos por mes con parametros personalizados. Expect 200', async() => {
    const response = await api
      .get('/api/dashboard/expenses-by-month?months=6')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expensesByMonth');
  });

  test('3. Obtener gastos por mes con parametro invalido. Expect 400', async() => {
    await api
      .get('/api/dashboard/expenses-by-month?months=100')
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });

  test('4. Obtener gastos por sucursal. Expect 200', async() => {
    const response = await api
      .get('/api/dashboard/expenses-by-branch')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expensesByBranch');
    expect(Array.isArray(response.body.expensesByBranch)).toBe(true);
  });

  test('5. Verificar estructura de respuesta expenses-by-branch', async() => {
    const response = await api
      .get('/api/dashboard/expenses-by-branch')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    if (response.body.expensesByBranch.length > 0) {
      const firstItem = response.body.expensesByBranch[0];
      expect(firstItem).toHaveProperty('branch_id');
      expect(firstItem).toHaveProperty('sucursal');
      expect(firstItem).toHaveProperty('total_gastos');
      expect(firstItem).toHaveProperty('cantidad_gastos');
    }
  });

  test('6. Verificar estructura de respuesta expenses-by-month', async() => {
    const response = await api
      .get('/api/dashboard/expenses-by-month?months=3')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('expensesByMonth');
  });

  test('7. Acceso sin token. Expect 401', async() => {
    await api
      .get('/api/dashboard/expenses-by-month')
      .expect(401);
  });

  test('8. Acceso sin token a expenses-by-branch. Expect 401', async() => {
    await api
      .get('/api/dashboard/expenses-by-branch')
      .expect(401);
  });
});
