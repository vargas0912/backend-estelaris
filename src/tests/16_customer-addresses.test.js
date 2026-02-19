const request = require('supertest');
const server = require('../../app');

const {
  customerAddressCreate,
  customerAddressCreateEmpty,
  customerAddressCreateInvalid,
  customerAddressUpdate,
  customerAddressCreate2,
  customerAddressCreateNoCustomer,
  testAuthRegisterSuperAdmin
} = require('./helper/helperData');

let Token = '';
let createdAddressId = null;
let secondAddressId = null;
let testCustomerId = null;

const api = request(server.app);

const addressesTestLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Customer Addresses
 */

describe('[CUSTOMER ADDRESSES] Test api customer-addresses //api/customer-addresses/', () => {
  beforeAll(async() => {
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(addressesTestLogin)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  // Crear un cliente de prueba primero
  test('Setup: Crear cliente para pruebas de direcciones. Expect 200', async() => {
    const testCustomer = {
      name: 'Cliente para direcciones',
      email: 'cliente.direcciones@test.com',
      mobile: '5551111111',
      is_international: false,
      country: 'México',
      municipality_id: 1
    };

    const response = await api
      .post('/api/customers')
      .auth(Token, { type: 'bearer' })
      .send(testCustomer)
      .expect(200);

    testCustomerId = response.body.customer.id;
    customerAddressCreate.customer_id = testCustomerId;
    customerAddressCreate2.customer_id = testCustomerId;
  });

  test('1. Obtener lista de direcciones. Expect 200', async() => {
    const response = await api
      .get('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('addresses');
    expect(Array.isArray(response.body.addresses)).toBe(true);
  });

  test('2. Crear dirección con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(customerAddressCreate)
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body.address).toHaveProperty('id');
    expect(response.body.address.street).toBe(customerAddressCreate.street);
    expect(response.body.address.address_type).toBe(customerAddressCreate.address_type);
    expect(response.body.address.is_default).toBe(true);

    createdAddressId = response.body.address.id;
  });

  test('3. Crear dirección con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(customerAddressCreateEmpty)
      .expect(400);
  });

  test('4. Crear dirección sin datos. Expect 400', async() => {
    await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(customerAddressCreateInvalid)
      .expect(400);
  });

  test('5. Crear dirección sin customer_id. Expect 400', async() => {
    await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(customerAddressCreateNoCustomer)
      .expect(400);
  });

  test('6. Obtener dirección por id. Expect 200', async() => {
    const response = await api
      .get(`/api/customer-addresses/${createdAddressId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body.address.id).toBe(createdAddressId);
  });

  test('7. Obtener dirección inexistente. Expect 404', async() => {
    await api
      .get('/api/customer-addresses/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('8. Actualizar dirección. Expect 200', async() => {
    const response = await api
      .put(`/api/customer-addresses/${createdAddressId}`)
      .auth(Token, { type: 'bearer' })
      .send(customerAddressUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body.address.street).toBe(customerAddressUpdate.street);
  });

  test('9. Crear segunda dirección del mismo tipo. Expect 200', async() => {
    const response = await api
      .post('/api/customer-addresses')
      .auth(Token, { type: 'bearer' })
      .send(customerAddressCreate2)
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body.address.address_type).toBe(customerAddressCreate2.address_type);

    secondAddressId = response.body.address.id;
  });

  test('10. Obtener direcciones por cliente. Expect 200', async() => {
    const response = await api
      .get(`/api/customer-addresses/customer/${testCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('addresses');
    expect(Array.isArray(response.body.addresses)).toBe(true);
    expect(response.body.addresses.length).toBeGreaterThan(0);
  });

  test('11. Marcar segunda dirección como default. Expect 200', async() => {
    const response = await api
      .put(`/api/customer-addresses/${secondAddressId}`)
      .auth(Token, { type: 'bearer' })
      .send({ is_default: true })
      .expect(200);

    expect(response.body).toHaveProperty('address');
    expect(response.body.address.is_default).toBe(true);
  });

  test('12. Verificar que solo una dirección es default por tipo. Expect 200', async() => {
    const response = await api
      .get(`/api/customer-addresses/customer/${testCustomerId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const billingAddresses = response.body.addresses.filter(a => a.address_type === 'billing');
    const defaultBilling = billingAddresses.filter(a => a.is_default);

    expect(defaultBilling.length).toBe(1);
  });

  test('13. Eliminar dirección. Expect 200', async() => {
    const response = await api
      .delete(`/api/customer-addresses/${createdAddressId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('address');
  });

  test('14. Verificar que la dirección eliminada no existe. Expect 404', async() => {
    await api
      .get(`/api/customer-addresses/${createdAddressId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // Tests de autenticación
  describe('Tests de autenticación', () => {
    test('15. Obtener direcciones sin token. Expect 401', async() => {
      await api
        .get('/api/customer-addresses')
        .expect(401);
    });

    test('16. Crear dirección sin token. Expect 401', async() => {
      await api
        .post('/api/customer-addresses')
        .send(customerAddressCreate)
        .expect(401);
    });

    test('17. Actualizar dirección sin token. Expect 401', async() => {
      await api
        .put('/api/customer-addresses/1')
        .send(customerAddressUpdate)
        .expect(401);
    });

    test('18. Eliminar dirección sin token. Expect 401', async() => {
      await api
        .delete('/api/customer-addresses/1')
        .expect(401);
    });
  });
});
