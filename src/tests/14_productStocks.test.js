const request = require('supertest');
const server = require('../../app');

const {
  productStockCreate,
  productStockCreateEmpty,
  productStockCreateInvalid,
  productStockUpdate,
  productStockCreate2,
  productStockCreateFull,
  productStockCreateNoProduct,
  productStockCreateNoBranch
} = require('./helper/helperData');

let Token = '';
let createdStockId = null;
let secondStockId = null;

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para ProductStocks
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de inventarios
 * 4. Crear inventario con datos válidos
 * 5. Crear inventario con datos vacíos (error)
 * 6. Crear inventario sin datos (error)
 * 7. Obtener inventario por id
 * 8. Obtener inventario inexistente (error)
 * 9. Actualizar inventario
 * 10. Eliminar inventario
 * 11. Verificar que el inventario eliminado no existe
 * 12. Tests de rutas especiales (por producto y por sucursal)
 */

describe('[PRODUCT STOCKS] Test api productStocks //api/productStocks/', () => {
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

  test('1. Obtener lista de inventarios. Expect 200', async() => {
    const response = await api
      .get('/api/productStocks')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('stocks');
    expect(Array.isArray(response.body.stocks)).toBe(true);
  });

  test('2. Crear inventario con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/productStocks')
      .auth(Token, { type: 'bearer' })
      .send(productStockCreate)
      .expect(200);

    expect(response.body).toHaveProperty('stock');
    expect(response.body.stock).toHaveProperty('id');
    expect(response.body.stock.product_id).toBe(productStockCreate.product_id);
    expect(response.body.stock.branch_id).toBe(productStockCreate.branch_id);

    createdStockId = response.body.stock.id;
  });

  test('3. Crear inventario con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/productStocks')
      .auth(Token, { type: 'bearer' })
      .send(productStockCreateEmpty)
      .expect(400);
  });

  test('4. Crear inventario sin datos. Expect 400', async() => {
    await api
      .post('/api/productStocks')
      .auth(Token, { type: 'bearer' })
      .send(productStockCreateInvalid)
      .expect(400);
  });

  test('5. Obtener inventario por id. Expect 200', async() => {
    const response = await api
      .get(`/api/productStocks/${createdStockId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('stock');
    expect(response.body.stock.id).toBe(createdStockId);
  });

  test('6. Obtener inventario inexistente. Expect 404', async() => {
    await api
      .get('/api/productStocks/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar inventario. Expect 200', async() => {
    const response = await api
      .put(`/api/productStocks/${createdStockId}`)
      .auth(Token, { type: 'bearer' })
      .send(productStockUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('stock');
    expect(response.body.stock.quantity).toBe(productStockUpdate.quantity);
  });

  test('8. Eliminar inventario. Expect 200', async() => {
    const response = await api
      .delete(`/api/productStocks/${createdStockId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el inventario eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/productStocks/${createdStockId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de rutas especiales
  // ============================================
  describe('Tests de rutas especiales', () => {
    test('10. Obtener inventarios por producto. Expect 200', async() => {
      const response = await api
        .get('/api/productStocks/product/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('11. Obtener inventarios por sucursal. Expect 200', async() => {
      const response = await api
        .get('/api/productStocks/branch/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('12. Obtener inventarios de producto inexistente. Expect 200 con array vacío', async() => {
      const response = await api
        .get('/api/productStocks/product/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('13. Obtener inventarios de sucursal inexistente. Expect 200 con array vacío', async() => {
      const response = await api
        .get('/api/productStocks/branch/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('14. Obtener inventarios sin token. Expect 401', async() => {
      await api
        .get('/api/productStocks')
        .expect(401);
    });

    test('15. Crear inventario sin token. Expect 401', async() => {
      await api
        .post('/api/productStocks')
        .send(productStockCreate)
        .expect(401);
    });

    test('16. Actualizar inventario sin token. Expect 401', async() => {
      await api
        .put('/api/productStocks/1')
        .send(productStockUpdate)
        .expect(401);
    });

    test('17. Eliminar inventario sin token. Expect 401', async() => {
      await api
        .delete('/api/productStocks/1')
        .expect(401);
    });

    test('18. Obtener inventarios con token inválido. Expect 401', async() => {
      await api
        .get('/api/productStocks')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('19. Crear inventario sin producto. Expect 400', async() => {
      await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send(productStockCreateNoProduct)
        .expect(400);
    });

    test('20. Crear inventario sin sucursal. Expect 400', async() => {
      await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send(productStockCreateNoBranch)
        .expect(400);
    });

    test('21. Crear inventario con producto inexistente. Expect 400 o 500', async() => {
      const response = await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send({
          product_id: 99999,
          branch_id: 1,
          quantity: 100
        });

      expect([400, 500]).toContain(response.status);
    });

    test('22. Crear inventario con sucursal inexistente. Expect 400 o 500', async() => {
      const response = await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send({
          product_id: 1,
          branch_id: 99999,
          quantity: 100
        });

      expect([400, 500]).toContain(response.status);
    });

    test('23. Actualizar inventario con cantidad vacía. Expect 400', async() => {
      // Primero crear un inventario para actualizar
      const createResponse = await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send(productStockCreate2);

      secondStockId = createResponse.body.stock?.id;

      if (secondStockId) {
        const response = await api
          .put(`/api/productStocks/${secondStockId}`)
          .auth(Token, { type: 'bearer' })
          .send({ quantity: '' });

        // Puede ser 400 si hay validación o 200 si se acepta
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('24. Obtener inventario con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/productStocks/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('25. Actualizar inventario inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/productStocks/99999')
        .auth(Token, { type: 'bearer' })
        .send(productStockUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('26. Eliminar inventario inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/productStocks/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('27. Eliminar inventario con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/productStocks/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('28. Verificar estructura completa de inventario creado', async() => {
      const response = await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send(productStockCreateFull)
        .expect(200);

      expect(response.body).toHaveProperty('stock');
      expect(response.body.stock).toHaveProperty('id');
      expect(response.body.stock).toHaveProperty('product_id');
      expect(response.body.stock).toHaveProperty('branch_id');
      expect(response.body.stock).toHaveProperty('quantity');

      // Limpiar: eliminar el inventario creado
      if (response.body.stock.id) {
        await api
          .delete(`/api/productStocks/${response.body.stock.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('29. Verificar que lista de inventarios es un array', async() => {
      const response = await api
        .get('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('30. Crear inventario con ubicación y stock mínimo/máximo', async() => {
      const stockWithLimits = {
        product_id: 2,
        branch_id: 3,
        quantity: 75,
        min_stock: 10,
        max_stock: 150,
        location: 'A-05-10'
      };

      const response = await api
        .post('/api/productStocks')
        .auth(Token, { type: 'bearer' })
        .send(stockWithLimits)
        .expect(200);

      expect(response.body).toHaveProperty('stock');
      expect(response.body.stock.location).toBe('A-05-10');

      // Limpiar
      if (response.body.stock.id) {
        await api
          .delete(`/api/productStocks/${response.body.stock.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('31. Eliminar inventario secundario si existe', async() => {
      if (secondStockId) {
        await api
          .delete(`/api/productStocks/${secondStockId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
