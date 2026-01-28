const request = require('supertest');
const server = require('../../app');

const {
  productCategoryCreate,
  productCategoryCreateEmpty,
  productCategoryCreateInvalid,
  productCategoryUpdate,
  productCategoryCreate2
} = require('./helper/helperData');

let Token = '';
let createdCategoryId = null;
let secondCategoryId = null;

const api = request(server.app);

// Usuario de prueba para productCategories
const productCategoriesTestUser = {
  name: 'ProductCategories Test User',
  email: 'productcategories_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para Product Categories
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de categorías
 * 4. Crear categoría con datos válidos
 * 5. Crear categoría con datos vacíos (error)
 * 6. Crear categoría sin datos (error)
 * 7. Obtener categoría por id
 * 8. Obtener categoría inexistente (error)
 * 9. Actualizar categoría
 * 10. Eliminar categoría
 * 11. Verificar que la categoría eliminada no existe
 */

describe('[PRODUCT CATEGORIES] Test api productCategories //api/productCategories/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(productCategoriesTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: productCategoriesTestUser.email, password: productCategoriesTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de categorías. Expect 200', async() => {
    const response = await api
      .get('/api/productCategories')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('productCategories');
    expect(Array.isArray(response.body.productCategories)).toBe(true);
  });

  test('2. Crear categoría con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/productCategories')
      .auth(Token, { type: 'bearer' })
      .send(productCategoryCreate)
      .expect(200);

    expect(response.body).toHaveProperty('productCategory');
    expect(response.body.productCategory).toHaveProperty('id');
    expect(response.body.productCategory.name).toBe(productCategoryCreate.name);

    createdCategoryId = response.body.productCategory.id;
  });

  test('3. Crear categoría con nombre vacío. Expect 400', async() => {
    await api
      .post('/api/productCategories')
      .auth(Token, { type: 'bearer' })
      .send(productCategoryCreateEmpty)
      .expect(400);
  });

  test('4. Crear categoría sin datos. Expect 400', async() => {
    await api
      .post('/api/productCategories')
      .auth(Token, { type: 'bearer' })
      .send(productCategoryCreateInvalid)
      .expect(400);
  });

  test('5. Obtener categoría por id. Expect 200', async() => {
    const response = await api
      .get(`/api/productCategories/${createdCategoryId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('productCategory');
    expect(response.body.productCategory.id).toBe(createdCategoryId);
  });

  test('6. Obtener categoría inexistente. Expect 404', async() => {
    await api
      .get('/api/productCategories/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar categoría. Expect 200', async() => {
    const response = await api
      .put(`/api/productCategories/${createdCategoryId}`)
      .auth(Token, { type: 'bearer' })
      .send(productCategoryUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('productCategory');
    expect(response.body.productCategory.name).toBe(productCategoryUpdate.name);
  });

  test('8. Eliminar categoría. Expect 200', async() => {
    const response = await api
      .delete(`/api/productCategories/${createdCategoryId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que la categoría eliminada no existe. Expect 404', async() => {
    await api
      .get(`/api/productCategories/${createdCategoryId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener categorías sin token. Expect 401', async() => {
      await api
        .get('/api/productCategories')
        .expect(401);
    });

    test('11. Crear categoría sin token. Expect 401', async() => {
      await api
        .post('/api/productCategories')
        .send(productCategoryCreate)
        .expect(401);
    });

    test('12. Actualizar categoría sin token. Expect 401', async() => {
      await api
        .put('/api/productCategories/1')
        .send(productCategoryUpdate)
        .expect(401);
    });

    test('13. Eliminar categoría sin token. Expect 401', async() => {
      await api
        .delete('/api/productCategories/1')
        .expect(401);
    });

    test('14. Obtener categorías con token inválido. Expect 401', async() => {
      await api
        .get('/api/productCategories')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear categoría solo con descripción (sin nombre). Expect 400', async() => {
      await api
        .post('/api/productCategories')
        .auth(Token, { type: 'bearer' })
        .send({ description: 'Solo descripción' })
        .expect(400);
    });

    test('16. Actualizar categoría con nombre vacío. Expect 400', async() => {
      // Primero crear una categoría para actualizar
      const createResponse = await api
        .post('/api/productCategories')
        .auth(Token, { type: 'bearer' })
        .send(productCategoryCreate2);

      secondCategoryId = createResponse.body.productCategory?.id;

      if (secondCategoryId) {
        await api
          .put(`/api/productCategories/${secondCategoryId}`)
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
    test('17. Obtener categoría con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/productCategories/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('18. Actualizar categoría inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/productCategories/99999')
        .auth(Token, { type: 'bearer' })
        .send(productCategoryUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('19. Eliminar categoría inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/productCategories/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('20. Eliminar categoría con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/productCategories/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('21. Verificar estructura completa de categoría creada', async() => {
      const response = await api
        .post('/api/productCategories')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Categoría estructura test',
          description: 'Descripción de prueba'
        })
        .expect(200);

      expect(response.body).toHaveProperty('productCategory');
      expect(response.body.productCategory).toHaveProperty('id');
      expect(response.body.productCategory).toHaveProperty('name');

      // Limpiar: eliminar la categoría creada
      if (response.body.productCategory.id) {
        await api
          .delete(`/api/productCategories/${response.body.productCategory.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('22. Verificar que lista de categorías es un array', async() => {
      const response = await api
        .get('/api/productCategories')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('productCategories');
      expect(Array.isArray(response.body.productCategories)).toBe(true);
    });

    test('23. Crear categoría sin descripción (solo nombre)', async() => {
      const response = await api
        .post('/api/productCategories')
        .auth(Token, { type: 'bearer' })
        .send({ name: 'Categoría sin descripción' })
        .expect(200);

      expect(response.body).toHaveProperty('productCategory');
      expect(response.body.productCategory.name).toBe('Categoría sin descripción');

      // Limpiar
      if (response.body.productCategory.id) {
        await api
          .delete(`/api/productCategories/${response.body.productCategory.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('24. Eliminar categoría secundaria si existe', async() => {
      if (secondCategoryId) {
        await api
          .delete(`/api/productCategories/${secondCategoryId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
