const request = require('supertest');
const server = require('../../app');

const {
  customerCreate,
  customerCreateEmpty,
  customerCreateInvalid,
  customerUpdate,
  customerCreate2,
  customerCreateInternational,
  customerCreateNoPhone,
  customerCreateInvalidInternational,
  testAuthRegisterSuperAdmin
} = require('./helper/helperData');

let Token = '';
let createdCustomerId = null;
let secondCustomerId = null;

const api = request(server.app);

const customersTestLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Customers
 */

describe('[CUSTOMERS] Test api customers //api/customers/', () => {
  beforeAll(async() => {
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(customersTestLogin)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de clientes. Expect 200', async() => {
    const response = await api
      .get('/api/customers')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('customers');
    expect(Array.isArray(response.body.customers)).toBe(true);
  });

  test('2. Crear cliente con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreate)
      .expect(200);

    expect(response.body).toHaveProperty('customer');
    expect(response.body.customer).toHaveProperty('id');
    expect(response.body.customer.name).toBe(customerCreate.name);
    expect(response.body.customer.email).toBe(customerCreate.email);
    expect(response.body.customer.is_international).toBe(false);

    createdCustomerId = response.body.customer.id;
  });

  test('3. Crear cliente con nombre vacío. Expect 400', async() => {
    await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreateEmpty)
      .expect(400);
  });

  test('4. Crear cliente sin datos. Expect 400', async() => {
    await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreateInvalid)
      .expect(400);
  });

  test('5. Crear cliente sin teléfono ni móvil. Expect 400', async() => {
    await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreateNoPhone)
      .expect(400);
  });

  test('6. Crear cliente internacional. Expect 200', async() => {
    const response = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreateInternational)
      .expect(200);

    expect(response.body).toHaveProperty('customer');
    expect(response.body.customer.is_international).toBe(true);
    expect(response.body.customer.country).toBe('USA');
    expect(response.body.customer.municipality_id).toBeFalsy();
    expect(response.body.customer.branch_id).toBeFalsy();
  });

  test('7. Crear cliente internacional con municipality_id. Expect 400', async() => {
    await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreateInvalidInternational)
      .expect(400);
  });

  test('8. Obtener cliente por id. Expect 200', async() => {
    const response = await api
      .get(`/api/customers/${createdCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('customer');
    expect(response.body.customer.id).toBe(createdCustomerId);
    expect(response.body.customer).toHaveProperty('addresses');
    expect(Array.isArray(response.body.customer.addresses)).toBe(true);
  });

  test('9. Obtener cliente inexistente. Expect 404', async() => {
    await api
      .get('/api/customers/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('10. Actualizar cliente. Expect 200', async() => {
    const response = await api
      .put(`/api/customers/${createdCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .send(customerUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('customer');
    expect(response.body.customer.name).toBe(customerUpdate.name);
    expect(response.body.customer.email).toBe(customerUpdate.email);
  });

  test('11. Crear segundo cliente. Expect 200', async() => {
    const response = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(customerCreate2)
      .expect(200);

    expect(response.body).toHaveProperty('customer');
    expect(response.body.customer.name).toBe(customerCreate2.name);

    secondCustomerId = response.body.customer.id;
  });

  test('12. Obtener clientes por sucursal. Expect 200', async() => {
    const response = await api
      .get('/api/customers/branch/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('customers');
    expect(Array.isArray(response.body.customers)).toBe(true);
  });

  test('13. Obtener clientes por municipio. Expect 200', async() => {
    const response = await api
      .get('/api/customers/municipality/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('customers');
    expect(Array.isArray(response.body.customers)).toBe(true);
  });

  test('14. Eliminar cliente. Expect 200', async() => {
    const response = await api
      .delete(`/api/customers/${createdCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('customer');
  });

  test('15. Verificar que el cliente eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/customers/${createdCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // Tests de autenticación
  describe('Tests de autenticación', () => {
    test('16. Obtener clientes sin token. Expect 401', async() => {
      await api
        .get('/api/customers')
        .expect(401);
    });

    test('17. Crear cliente sin token. Expect 401', async() => {
      await api
        .post('/api/customers')
        .send(customerCreate)
        .expect(401);
    });

    test('18. Actualizar cliente sin token. Expect 401', async() => {
      await api
        .put('/api/customers/1')
        .send(customerUpdate)
        .expect(401);
    });

    test('19. Eliminar cliente sin token. Expect 401', async() => {
      await api
        .delete('/api/customers/1')
        .expect(401);
    });
  });

  // Tests de activación de portal
  describe('Tests de activación de portal', () => {
    test('20. Activar portal para cliente. Expect 200', async() => {
      const response = await api
        .post(`/api/customers/${secondCustomerId}/activate-portal`)
        .auth(Token, { type: 'bearer' })
        .send({ password: 'TempPass123' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('customer');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tempPassword');
      expect(response.body.user.role).toBe('customer');
    });

    test('21. Intentar activar portal nuevamente para el mismo cliente. Expect 400', async() => {
      await api
        .post(`/api/customers/${secondCustomerId}/activate-portal`)
        .auth(Token, { type: 'bearer' })
        .send({ password: 'AnotherPass123' })
        .expect(400);
    });

    test('22. Activar portal para cliente inexistente. Expect 400', async() => {
      await api
        .post('/api/customers/99999/activate-portal')
        .auth(Token, { type: 'bearer' })
        .send({ password: 'TempPass123' })
        .expect(400);
    });
  });
});
