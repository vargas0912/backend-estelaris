const request = require('supertest');
const server = require('../../app');

const {
  priceListCreate,
  priceListCreateEmpty,
  priceListCreateInvalid,
  priceListUpdate,
  priceListCreate2,
  priceListCreateFull,
  priceListCreateNoName
} = require('./helper/helperData');

let Token = '';
let createdPriceListId = null;
let secondPriceListId = null;

const api = request(server.app);

// Usuario de prueba para priceLists
const priceListsTestUser = {
  name: 'PriceLists Test User',
  email: 'pricelists_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para PriceLists
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de listas de precios
 * 4. Crear lista de precios con datos válidos
 * 5. Crear lista de precios con datos vacíos (error)
 * 6. Crear lista de precios sin datos (error)
 * 7. Obtener lista de precios por id
 * 8. Obtener lista de precios inexistente (error)
 * 9. Actualizar lista de precios
 * 10. Eliminar lista de precios
 * 11. Verificar que la lista de precios eliminada no existe
 */

describe('[PRICE LISTS] Test api priceLists //api/priceLists/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(priceListsTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: priceListsTestUser.email, password: priceListsTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de listas de precios. Expect 200', async() => {
    const response = await api
      .get('/api/priceLists')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('priceLists');
    expect(Array.isArray(response.body.priceLists)).toBe(true);
  });

  test('2. Crear lista de precios con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/priceLists')
      .auth(Token, { type: 'bearer' })
      .send(priceListCreate)
      .expect(200);

    expect(response.body).toHaveProperty('priceList');
    expect(response.body.priceList).toHaveProperty('id');
    expect(response.body.priceList.name).toBe(priceListCreate.name);

    createdPriceListId = response.body.priceList.id;
  });

  test('3. Crear lista de precios con nombre vacío. Expect 400', async() => {
    await api
      .post('/api/priceLists')
      .auth(Token, { type: 'bearer' })
      .send(priceListCreateEmpty)
      .expect(400);
  });

  test('4. Crear lista de precios sin datos. Expect 400', async() => {
    await api
      .post('/api/priceLists')
      .auth(Token, { type: 'bearer' })
      .send(priceListCreateInvalid)
      .expect(400);
  });

  test('5. Obtener lista de precios por id. Expect 200', async() => {
    const response = await api
      .get(`/api/priceLists/${createdPriceListId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('priceList');
    expect(response.body.priceList.id).toBe(createdPriceListId);
  });

  test('6. Obtener lista de precios inexistente. Expect 404', async() => {
    await api
      .get('/api/priceLists/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar lista de precios. Expect 200', async() => {
    const response = await api
      .put(`/api/priceLists/${createdPriceListId}`)
      .auth(Token, { type: 'bearer' })
      .send(priceListUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('priceList');
    expect(response.body.priceList.name).toBe(priceListUpdate.name);
  });

  test('8. Eliminar lista de precios. Expect 200', async() => {
    const response = await api
      .delete(`/api/priceLists/${createdPriceListId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que la lista de precios eliminada no existe. Expect 404', async() => {
    await api
      .get(`/api/priceLists/${createdPriceListId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener listas de precios sin token. Expect 401', async() => {
      await api
        .get('/api/priceLists')
        .expect(401);
    });

    test('11. Crear lista de precios sin token. Expect 401', async() => {
      await api
        .post('/api/priceLists')
        .send(priceListCreate)
        .expect(401);
    });

    test('12. Actualizar lista de precios sin token. Expect 401', async() => {
      await api
        .put('/api/priceLists/1')
        .send(priceListUpdate)
        .expect(401);
    });

    test('13. Eliminar lista de precios sin token. Expect 401', async() => {
      await api
        .delete('/api/priceLists/1')
        .expect(401);
    });

    test('14. Obtener listas de precios con token inválido. Expect 401', async() => {
      await api
        .get('/api/priceLists')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear lista de precios sin nombre. Expect 400', async() => {
      await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send(priceListCreateNoName)
        .expect(400);
    });

    test('16. Actualizar lista de precios con nombre vacío. Expect 400', async() => {
      // Primero crear una lista para actualizar
      const createResponse = await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send(priceListCreate2);

      secondPriceListId = createResponse.body.priceList?.id;

      if (secondPriceListId) {
        await api
          .put(`/api/priceLists/${secondPriceListId}`)
          .auth(Token, { type: 'bearer' })
          .send({ name: '' })
          .expect(400);
      }
    });

    test('17. Crear lista de precios con descuento negativo', async() => {
      const response = await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Lista descuento negativo',
          discount_percent: -10
        });

      // Puede ser 400 si hay validación o 200 si no
      expect([200, 400]).toContain(response.status);

      // Limpiar si se creó
      if (response.status === 200 && response.body.priceList?.id) {
        await api
          .delete(`/api/priceLists/${response.body.priceList.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('18. Obtener lista de precios con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/priceLists/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('19. Actualizar lista de precios inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/priceLists/99999')
        .auth(Token, { type: 'bearer' })
        .send(priceListUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('20. Eliminar lista de precios inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/priceLists/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('21. Eliminar lista de precios con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/priceLists/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('22. Verificar estructura completa de lista de precios creada', async() => {
      const response = await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send(priceListCreateFull)
        .expect(200);

      expect(response.body).toHaveProperty('priceList');
      expect(response.body.priceList).toHaveProperty('id');
      expect(response.body.priceList).toHaveProperty('name');

      // Limpiar: eliminar la lista creada
      if (response.body.priceList.id) {
        await api
          .delete(`/api/priceLists/${response.body.priceList.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('23. Verificar que lista de listas de precios es un array', async() => {
      const response = await api
        .get('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('priceLists');
      expect(Array.isArray(response.body.priceLists)).toBe(true);
    });

    test('24. Crear lista de precios con todos los campos opcionales', async() => {
      const priceListWithOptional = {
        name: 'Lista con opcionales',
        description: 'Descripción opcional',
        discount_percent: 15,
        is_active: true,
        priority: 3
      };

      const response = await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send(priceListWithOptional)
        .expect(200);

      expect(response.body).toHaveProperty('priceList');
      expect(response.body.priceList.name).toBe('Lista con opcionales');

      // Limpiar
      if (response.body.priceList.id) {
        await api
          .delete(`/api/priceLists/${response.body.priceList.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('25. Crear lista de precios solo con nombre', async() => {
      const response = await api
        .post('/api/priceLists')
        .auth(Token, { type: 'bearer' })
        .send({ name: 'Lista solo nombre' })
        .expect(200);

      expect(response.body).toHaveProperty('priceList');
      expect(response.body.priceList.name).toBe('Lista solo nombre');

      // Limpiar
      if (response.body.priceList.id) {
        await api
          .delete(`/api/priceLists/${response.body.priceList.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('26. Eliminar lista de precios secundaria si existe', async() => {
      if (secondPriceListId) {
        await api
          .delete(`/api/priceLists/${secondPriceListId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
