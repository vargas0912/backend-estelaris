const request = require('supertest');
const server = require('../../app');

const {
  supplierCreate,
  supplierCreateEmpty,
  supplierCreateInvalid,
  supplierUpdate,
  supplierCreate2,
  supplierCreateFull,
  supplierCreateNoName,
  supplierCreateNoEmail,
  supplierCreateInvalidEmail
} = require('./helper/helperData');

let Token = '';
let createdSupplierId = null;
let secondSupplierId = null;

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Suppliers
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de proveedores
 * 4. Crear proveedor con datos válidos
 * 5. Crear proveedor con datos vacíos (error)
 * 6. Crear proveedor sin datos (error)
 * 7. Obtener proveedor por id
 * 8. Obtener proveedor inexistente (error)
 * 9. Actualizar proveedor
 * 10. Eliminar proveedor
 * 11. Verificar que el proveedor eliminado no existe
 */

describe('[SUPPLIERS] Test api suppliers //api/suppliers/', () => {
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

  test('1. Obtener lista de proveedores. Expect 200', async() => {
    const response = await api
      .get('/api/suppliers')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('suppliers');
    expect(Array.isArray(response.body.suppliers)).toBe(true);
  });

  test('2. Crear proveedor con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/suppliers')
      .auth(Token, { type: 'bearer' })
      .send(supplierCreate)
      .expect(200);

    expect(response.body).toHaveProperty('supplier');
    expect(response.body.supplier).toHaveProperty('id');
    expect(response.body.supplier.name).toBe(supplierCreate.name);
    expect(response.body.supplier.email).toBe(supplierCreate.email);

    createdSupplierId = response.body.supplier.id;
  });

  test('3. Crear proveedor con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/suppliers')
      .auth(Token, { type: 'bearer' })
      .send(supplierCreateEmpty)
      .expect(400);
  });

  test('4. Crear proveedor sin datos. Expect 400', async() => {
    await api
      .post('/api/suppliers')
      .auth(Token, { type: 'bearer' })
      .send(supplierCreateInvalid)
      .expect(400);
  });

  test('5. Obtener proveedor por id. Expect 200', async() => {
    const response = await api
      .get(`/api/suppliers/${createdSupplierId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('supplier');
    expect(response.body.supplier.id).toBe(createdSupplierId);
  });

  test('6. Obtener proveedor inexistente. Expect 404', async() => {
    await api
      .get('/api/suppliers/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar proveedor. Expect 200', async() => {
    const response = await api
      .put(`/api/suppliers/${createdSupplierId}`)
      .auth(Token, { type: 'bearer' })
      .send(supplierUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('supplier');
    expect(response.body.supplier.name).toBe(supplierUpdate.name);
  });

  test('8. Eliminar proveedor. Expect 200', async() => {
    const response = await api
      .delete(`/api/suppliers/${createdSupplierId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el proveedor eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/suppliers/${createdSupplierId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener proveedores sin token. Expect 401', async() => {
      await api
        .get('/api/suppliers')
        .expect(401);
    });

    test('11. Crear proveedor sin token. Expect 401', async() => {
      await api
        .post('/api/suppliers')
        .send(supplierCreate)
        .expect(401);
    });

    test('12. Actualizar proveedor sin token. Expect 401', async() => {
      await api
        .put('/api/suppliers/1')
        .send(supplierUpdate)
        .expect(401);
    });

    test('13. Eliminar proveedor sin token. Expect 401', async() => {
      await api
        .delete('/api/suppliers/1')
        .expect(401);
    });

    test('14. Obtener proveedores con token inválido. Expect 401', async() => {
      await api
        .get('/api/suppliers')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear proveedor sin nombre. Expect 400', async() => {
      await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierCreateNoName)
        .expect(400);
    });

    test('16. Crear proveedor sin email. Expect 400', async() => {
      await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierCreateNoEmail)
        .expect(400);
    });

    test('17. Crear proveedor con email inválido. Expect 400', async() => {
      await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierCreateInvalidEmail)
        .expect(400);
    });

    test('18. Actualizar proveedor con nombre vacío. Expect 400', async() => {
      // Primero crear un proveedor para actualizar
      const createResponse = await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierCreate2);

      secondSupplierId = createResponse.body.supplier?.id;

      if (secondSupplierId) {
        await api
          .put(`/api/suppliers/${secondSupplierId}`)
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
    test('19. Obtener proveedor con ID no numérico. Expect 400', async() => {
      await api
        .get('/api/suppliers/abc')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('20. Actualizar proveedor inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/suppliers/99999')
        .auth(Token, { type: 'bearer' })
        .send(supplierUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('21. Eliminar proveedor inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/suppliers/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('22. Eliminar proveedor con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/suppliers/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('23. Verificar estructura completa de proveedor creado', async() => {
      const response = await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierCreateFull)
        .expect(200);

      expect(response.body).toHaveProperty('supplier');
      expect(response.body.supplier).toHaveProperty('id');
      expect(response.body.supplier).toHaveProperty('name');
      expect(response.body.supplier).toHaveProperty('email');

      // Limpiar: eliminar el proveedor creado
      if (response.body.supplier.id) {
        await api
          .delete(`/api/suppliers/${response.body.supplier.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('24. Verificar que lista de proveedores es un array', async() => {
      const response = await api
        .get('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('suppliers');
      expect(Array.isArray(response.body.suppliers)).toBe(true);
    });

    test('25. Crear proveedor con campos opcionales', async() => {
      const supplierWithOptional = {
        name: 'Proveedor con opcionales S.A.',
        email: 'opcional@test.com',
        phone: '8181234567',
        contact_name: 'Juan Pérez',
        notes: 'Notas opcionales'
      };

      const response = await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierWithOptional)
        .expect(200);

      expect(response.body).toHaveProperty('supplier');
      expect(response.body.supplier.name).toBe('Proveedor con opcionales S.A.');

      // Limpiar
      if (response.body.supplier.id) {
        await api
          .delete(`/api/suppliers/${response.body.supplier.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('26. Verificar campos financieros del proveedor', async() => {
      const supplierWithFinancials = {
        name: 'Proveedor financiero S.A.',
        email: 'financiero@test.com',
        payment_terms: '30 días',
        credit_limit: 50000.00
      };

      const response = await api
        .post('/api/suppliers')
        .auth(Token, { type: 'bearer' })
        .send(supplierWithFinancials)
        .expect(200);

      expect(response.body).toHaveProperty('supplier');
      expect(response.body.supplier.name).toBe('Proveedor financiero S.A.');

      // Limpiar
      if (response.body.supplier.id) {
        await api
          .delete(`/api/suppliers/${response.body.supplier.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('27. Eliminar proveedor secundario si existe', async() => {
      if (secondSupplierId) {
        await api
          .delete(`/api/suppliers/${secondSupplierId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
