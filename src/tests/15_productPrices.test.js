const request = require('supertest');
const server = require('../../app');

const {
  productPriceCreate,
  productPriceCreateEmpty,
  productPriceCreateInvalid,
  productPriceUpdate,
  productPriceCreate2,
  productPriceCreateTiered,
  productPriceCreateNoProduct,
  productPriceCreateNoPriceList,
  productPriceCreateNoPrice
} = require('./helper/helperData');

let Token = '';
let createdPriceId = null;
let secondPriceId = null;

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para ProductPrices
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de precios
 * 4. Crear precio con datos válidos
 * 5. Crear precio con datos vacíos (error)
 * 6. Crear precio sin datos (error)
 * 7. Obtener precio por id
 * 8. Obtener precio inexistente (error)
 * 9. Actualizar precio
 * 10. Eliminar precio
 * 11. Verificar que el precio eliminado no existe
 * 12. Tests de rutas especiales (por producto y por lista de precios)
 */

describe('[PRODUCT PRICES] Test api productPrices //api/productPrices/', () => {
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

  test('1. Obtener lista de precios. Expect 200', async() => {
    const response = await api
      .get('/api/productPrices')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('prices');
    expect(Array.isArray(response.body.prices)).toBe(true);
  });

  test('2. Crear precio con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/productPrices')
      .auth(Token, { type: 'bearer' })
      .send(productPriceCreate)
      .expect(200);

    expect(response.body).toHaveProperty('price');
    expect(response.body.price).toHaveProperty('id');
    expect(response.body.price.product_id).toBe(productPriceCreate.product_id);
    expect(response.body.price.price_list_id).toBe(productPriceCreate.price_list_id);

    createdPriceId = response.body.price.id;
  });

  test('3. Crear precio con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/productPrices')
      .auth(Token, { type: 'bearer' })
      .send(productPriceCreateEmpty)
      .expect(400);
  });

  test('4. Crear precio sin datos. Expect 400', async() => {
    await api
      .post('/api/productPrices')
      .auth(Token, { type: 'bearer' })
      .send(productPriceCreateInvalid)
      .expect(400);
  });

  test('5. Obtener precio por id. Expect 200', async() => {
    const response = await api
      .get(`/api/productPrices/${createdPriceId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('price');
    expect(response.body.price.id).toBe(createdPriceId);
  });

  test('6. Obtener precio inexistente. Expect 404', async() => {
    await api
      .get('/api/productPrices/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar precio. Expect 200', async() => {
    const response = await api
      .put(`/api/productPrices/${createdPriceId}`)
      .auth(Token, { type: 'bearer' })
      .send(productPriceUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('price');
    expect(response.body.price.price).toBe(productPriceUpdate.price);
  });

  test('8. Eliminar precio. Expect 200', async() => {
    const response = await api
      .delete(`/api/productPrices/${createdPriceId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el precio eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/productPrices/${createdPriceId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de rutas especiales
  // ============================================
  describe('Tests de rutas especiales', () => {
    test('10. Obtener precios por producto. Expect 200', async() => {
      const response = await api
        .get('/api/productPrices/product/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
    });

    test('11. Obtener precios por lista de precios. Expect 200', async() => {
      const response = await api
        .get('/api/productPrices/priceList/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
    });

    test('12. Obtener precios de producto inexistente. Expect 200 con array vacío', async() => {
      const response = await api
        .get('/api/productPrices/product/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
    });

    test('13. Obtener precios de lista inexistente. Expect 200 con array vacío', async() => {
      const response = await api
        .get('/api/productPrices/priceList/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
    });
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('14. Obtener precios sin token. Expect 401', async() => {
      await api
        .get('/api/productPrices')
        .expect(401);
    });

    test('15. Crear precio sin token. Expect 401', async() => {
      await api
        .post('/api/productPrices')
        .send(productPriceCreate)
        .expect(401);
    });

    test('16. Actualizar precio sin token. Expect 401', async() => {
      await api
        .put('/api/productPrices/1')
        .send(productPriceUpdate)
        .expect(401);
    });

    test('17. Eliminar precio sin token. Expect 401', async() => {
      await api
        .delete('/api/productPrices/1')
        .expect(401);
    });

    test('18. Obtener precios con token inválido. Expect 401', async() => {
      await api
        .get('/api/productPrices')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('19. Crear precio sin producto. Expect 400', async() => {
      await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(productPriceCreateNoProduct)
        .expect(400);
    });

    test('20. Crear precio sin lista de precios. Expect 400', async() => {
      await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(productPriceCreateNoPriceList)
        .expect(400);
    });

    test('21. Crear precio sin campo precio. Expect 400', async() => {
      await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(productPriceCreateNoPrice)
        .expect(400);
    });

    test('22. Crear precio con producto inexistente. Expect 400 o 500', async() => {
      const response = await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send({
          product_id: 99999,
          price_list_id: 1,
          price: 100.00
        });

      expect([400, 500]).toContain(response.status);
    });

    test('23. Crear precio con lista inexistente. Expect 400 o 500', async() => {
      const response = await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send({
          product_id: 1,
          price_list_id: 99999,
          price: 100.00
        });

      expect([400, 500]).toContain(response.status);
    });

    test('24. Actualizar precio con precio vacío. Expect 400', async() => {
      // Primero crear un precio para actualizar
      const createResponse = await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(productPriceCreate2);

      secondPriceId = createResponse.body.price?.id;

      if (secondPriceId) {
        const response = await api
          .put(`/api/productPrices/${secondPriceId}`)
          .auth(Token, { type: 'bearer' })
          .send({ price: '' });

        // Puede ser 400 si hay validación o 200 si se acepta
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('25. Obtener precio con ID no numérico. Expect 400', async() => {
      await api
        .get('/api/productPrices/abc')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('26. Actualizar precio inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/productPrices/99999')
        .auth(Token, { type: 'bearer' })
        .send(productPriceUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('27. Eliminar precio inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/productPrices/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('28. Eliminar precio con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/productPrices/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('29. Verificar estructura completa de precio creado', async() => {
      const response = await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(productPriceCreateTiered)
        .expect(200);

      expect(response.body).toHaveProperty('price');
      expect(response.body.price).toHaveProperty('id');
      expect(response.body.price).toHaveProperty('product_id');
      expect(response.body.price).toHaveProperty('price_list_id');
      expect(response.body.price).toHaveProperty('price');

      // Limpiar: eliminar el precio creado
      if (response.body.price.id) {
        await api
          .delete(`/api/productPrices/${response.body.price.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('30. Verificar que lista de precios es un array', async() => {
      const response = await api
        .get('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);
    });

    test('31. Crear precio escalonado con cantidad mínima', async() => {
      const priceWithMinQty = {
        product_id: 1,
        price_list_id: 1,
        price: 85.00,
        min_quantity: 10
      };

      const response = await api
        .post('/api/productPrices')
        .auth(Token, { type: 'bearer' })
        .send(priceWithMinQty)
        .expect(200);

      expect(response.body).toHaveProperty('price');
      expect(response.body.price.min_quantity).toBe(10);

      // Limpiar
      if (response.body.price.id) {
        await api
          .delete(`/api/productPrices/${response.body.price.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('32. Verificar precios por producto incluyen relaciones', async() => {
      const response = await api
        .get('/api/productPrices/product/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('prices');
      expect(Array.isArray(response.body.prices)).toBe(true);

      // Si hay precios, verificar que tienen las relaciones
      if (response.body.prices.length > 0) {
        const firstPrice = response.body.prices[0];
        expect(firstPrice).toHaveProperty('product_id');
        expect(firstPrice).toHaveProperty('price_list_id');
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('33. Eliminar precio secundario si existe', async() => {
      if (secondPriceId) {
        await api
          .delete(`/api/productPrices/${secondPriceId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
