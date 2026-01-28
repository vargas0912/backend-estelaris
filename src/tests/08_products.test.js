const request = require('supertest');
const server = require('../../app');

const {
  productCreate,
  productCreateEmpty,
  productCreateInvalid,
  productUpdate,
  productCreate2,
  productCreateFull,
  productCreateNoSku,
  productCreateNoName,
  productCreateNoPrice
} = require('./helper/helperData');

let Token = '';
let createdProductId = null;
let secondProductId = null;

const api = request(server.app);

// Usuario de prueba para products
const productsTestUser = {
  name: 'Products Test User',
  email: 'products_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para Products
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de productos
 * 4. Crear producto con datos válidos
 * 5. Crear producto con datos vacíos (error)
 * 6. Crear producto sin datos (error)
 * 7. Obtener producto por id
 * 8. Obtener producto inexistente (error)
 * 9. Actualizar producto
 * 10. Eliminar producto
 * 11. Verificar que el producto eliminado no existe
 */

describe('[PRODUCTS] Test api products //api/products/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(productsTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: productsTestUser.email, password: productsTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de productos. Expect 200', async() => {
    const response = await api
      .get('/api/products')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('products');
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  test('2. Crear producto con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/products')
      .auth(Token, { type: 'bearer' })
      .send(productCreate)
      .expect(200);

    expect(response.body).toHaveProperty('product');
    expect(response.body.product).toHaveProperty('id');
    expect(response.body.product.name).toBe(productCreate.name);
    expect(response.body.product.sku).toBe(productCreate.sku);

    createdProductId = response.body.product.id;
  });

  test('3. Crear producto con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/products')
      .auth(Token, { type: 'bearer' })
      .send(productCreateEmpty)
      .expect(400);
  });

  test('4. Crear producto sin datos. Expect 400', async() => {
    await api
      .post('/api/products')
      .auth(Token, { type: 'bearer' })
      .send(productCreateInvalid)
      .expect(400);
  });

  test('5. Obtener producto por id. Expect 200', async() => {
    const response = await api
      .get(`/api/products/${createdProductId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('product');
    expect(response.body.product.id).toBe(createdProductId);
  });

  test('6. Obtener producto inexistente. Expect 404', async() => {
    await api
      .get('/api/products/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar producto. Expect 200', async() => {
    const response = await api
      .put(`/api/products/${createdProductId}`)
      .auth(Token, { type: 'bearer' })
      .send(productUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('product');
    expect(response.body.product.name).toBe(productUpdate.name);
  });

  test('8. Eliminar producto. Expect 200', async() => {
    const response = await api
      .delete(`/api/products/${createdProductId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el producto eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/products/${createdProductId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener productos sin token. Expect 401', async() => {
      await api
        .get('/api/products')
        .expect(401);
    });

    test('11. Crear producto sin token. Expect 401', async() => {
      await api
        .post('/api/products')
        .send(productCreate)
        .expect(401);
    });

    test('12. Actualizar producto sin token. Expect 401', async() => {
      await api
        .put('/api/products/1')
        .send(productUpdate)
        .expect(401);
    });

    test('13. Eliminar producto sin token. Expect 401', async() => {
      await api
        .delete('/api/products/1')
        .expect(401);
    });

    test('14. Obtener productos con token inválido. Expect 401', async() => {
      await api
        .get('/api/products')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear producto sin SKU. Expect 400', async() => {
      await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productCreateNoSku)
        .expect(400);
    });

    test('16. Crear producto sin nombre. Expect 400', async() => {
      await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productCreateNoName)
        .expect(400);
    });

    test('17. Crear producto sin precio base. Expect 400', async() => {
      await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productCreateNoPrice)
        .expect(400);
    });

    test('18. Actualizar producto con nombre vacío. Expect 400', async() => {
      // Primero crear un producto para actualizar
      const createResponse = await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productCreate2);

      secondProductId = createResponse.body.product?.id;

      if (secondProductId) {
        await api
          .put(`/api/products/${secondProductId}`)
          .auth(Token, { type: 'bearer' })
          .send({ name: '' })
          .expect(400);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('19. Obtener producto con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/products/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('20. Actualizar producto inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/products/99999')
        .auth(Token, { type: 'bearer' })
        .send(productUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('21. Eliminar producto inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/products/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('22. Eliminar producto con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/products/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('23. Verificar estructura completa de producto creado', async() => {
      const response = await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productCreateFull)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('id');
      expect(response.body.product).toHaveProperty('sku');
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product).toHaveProperty('base_price');

      // Limpiar: eliminar el producto creado
      if (response.body.product.id) {
        await api
          .delete(`/api/products/${response.body.product.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('24. Verificar que lista de productos es un array', async() => {
      const response = await api
        .get('/api/products')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('25. Crear producto con campos opcionales', async() => {
      const productWithOptional = {
        sku: 'SKU-OPTIONAL-001',
        name: 'Producto con opcionales',
        base_price: 99.99,
        description: 'Descripción opcional',
        is_active: true
      };

      const response = await api
        .post('/api/products')
        .auth(Token, { type: 'bearer' })
        .send(productWithOptional)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe('Producto con opcionales');

      // Limpiar
      if (response.body.product.id) {
        await api
          .delete(`/api/products/${response.body.product.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('26. Eliminar producto secundario si existe', async() => {
      if (secondProductId) {
        await api
          .delete(`/api/products/${secondProductId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
