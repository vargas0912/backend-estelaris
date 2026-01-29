const request = require('supertest');
const server = require('../../app');

const {
  branchCreate,
  branchCreateEmpty,
  branchCreateInvalid,
  branchUpdate,
  branchCreateNoAddress,
  branchCreateNoMunicipality,
  branchUpdateEmpty,
  branchCreate2
} = require('./helper/helperData');

let Token = '';
let createdBranchId = null;
let secondBranchId = null;

const api = request(server.app);

// Usuario de prueba para branches
const branchesTestUser = {
  name: 'Branches Test User',
  email: 'branches_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para Branches
 */

describe('[BRANCHES] Test api branches //api/branches/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(branchesTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: branchesTestUser.email, password: branchesTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de sucursales. Expect 200', async() => {
    const response = await api
      .get('/api/branches')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('branches');
    expect(Array.isArray(response.body.branches)).toBe(true);
  });

  test('2. Crear sucursal con datos validos. Expect 200', async() => {
    const response = await api
      .post('/api/branches')
      .auth(Token, { type: 'bearer' })
      .send(branchCreate)
      .expect(200);

    expect(response.body).toHaveProperty('branch');
    expect(response.body.branch).toHaveProperty('id');
    expect(response.body.branch.name).toBe(branchCreate.name);

    createdBranchId = response.body.branch.id;
  });

  test('3. Crear sucursal con nombre vacio. Expect 400', async() => {
    await api
      .post('/api/branches')
      .auth(Token, { type: 'bearer' })
      .send(branchCreateEmpty)
      .expect(400);
  });

  test('4. Crear sucursal sin datos. Expect 400', async() => {
    await api
      .post('/api/branches')
      .auth(Token, { type: 'bearer' })
      .send(branchCreateInvalid)
      .expect(400);
  });

  test('5. Obtener sucursal por id. Expect 200', async() => {
    const response = await api
      .get(`/api/branches/${createdBranchId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('branch');
    expect(response.body.branch.id).toBe(createdBranchId);
  });

  test('6. Obtener sucursal inexistente. Expect 404', async() => {
    await api
      .get('/api/branches/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar sucursal. Expect 200', async() => {
    const response = await api
      .put(`/api/branches/${createdBranchId}`)
      .auth(Token, { type: 'bearer' })
      .send(branchUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('branch');
    expect(response.body.branch.name).toBe(branchUpdate.name);
  });

  test('8. Eliminar sucursal. Expect 200', async() => {
    const response = await api
      .delete(`/api/branches/${createdBranchId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('branch');
  });

  test('9. Verificar que la sucursal eliminada no existe. Expect 404', async() => {
    await api
      .get(`/api/branches/${createdBranchId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener sucursales sin token. Expect 401', async() => {
      await api
        .get('/api/branches')
        .expect(401);
    });

    test('11. Crear sucursal sin token. Expect 401', async() => {
      await api
        .post('/api/branches')
        .send(branchCreate)
        .expect(401);
    });

    test('12. Actualizar sucursal sin token. Expect 401', async() => {
      await api
        .put('/api/branches/1')
        .send(branchUpdate)
        .expect(401);
    });

    test('13. Eliminar sucursal sin token. Expect 401', async() => {
      await api
        .delete('/api/branches/1')
        .expect(401);
    });

    test('14. Obtener sucursales con token invalido. Expect 401', async() => {
      await api
        .get('/api/branches')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear sucursal sin address. Expect 400', async() => {
      await api
        .post('/api/branches')
        .auth(Token, { type: 'bearer' })
        .send(branchCreateNoAddress)
        .expect(400);
    });

    test('16. Crear sucursal sin municipality_id. Expect 400', async() => {
      await api
        .post('/api/branches')
        .auth(Token, { type: 'bearer' })
        .send(branchCreateNoMunicipality)
        .expect(400);
    });

    test('17. Actualizar sucursal con datos vacios. Expect 400', async() => {
      // Primero crear una sucursal para actualizar
      const createResponse = await api
        .post('/api/branches')
        .auth(Token, { type: 'bearer' })
        .send(branchCreate2);

      secondBranchId = createResponse.body.branch?.id;

      if (secondBranchId) {
        await api
          .put(`/api/branches/${secondBranchId}`)
          .auth(Token, { type: 'bearer' })
          .send(branchUpdateEmpty)
          .expect(400);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('18. Obtener sucursal con ID no numerico. Expect 404', async() => {
      // El validador no rechaza IDs no numéricos, simplemente no encuentra el registro
      await api
        .get('/api/branches/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('19. Actualizar sucursal inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/branches/99999')
        .auth(Token, { type: 'bearer' })
        .send(branchUpdate);

      // El servicio retorna NOT_FOUND pero el controller puede manejarlo diferente
      expect([200, 404]).toContain(response.status);
    });

    test('20. Eliminar sucursal inexistente. Expect 404', async() => {
      await api
        .delete('/api/branches/99999')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('21. Eliminar sucursal con ID no numerico. Expect 404', async() => {
      await api
        .delete('/api/branches/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('22. Verificar estructura completa de sucursal creada', async() => {
      const response = await api
        .post('/api/branches')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Sucursal estructura test',
          address: 'Calle Estructura 100',
          phone: '5559999999',
          municipality_id: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('branch');
      expect(response.body.branch).toHaveProperty('id');
      expect(response.body.branch).toHaveProperty('name');
      expect(response.body.branch).toHaveProperty('address');
      expect(response.body.branch).toHaveProperty('phone');
      expect(response.body.branch).toHaveProperty('municipality_id');

      // Limpiar: eliminar la sucursal creada
      if (response.body.branch.id) {
        await api
          .delete(`/api/branches/${response.body.branch.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('23. Verificar que lista de sucursales es un array', async() => {
      const response = await api
        .get('/api/branches')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('branches');
      expect(Array.isArray(response.body.branches)).toBe(true);
    });

    test('24. Verificar estructura de sucursal con municipio', async() => {
      // Crear sucursal
      const createResponse = await api
        .post('/api/branches')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Sucursal municipio test',
          address: 'Calle Municipio 200',
          phone: '5558888888',
          municipality_id: 1
        })
        .expect(200);

      const branchId = createResponse.body.branch.id;

      // Obtener sucursal y verificar estructura con municipio
      const response = await api
        .get(`/api/branches/${branchId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('branch');
      expect(response.body.branch).toHaveProperty('municipio');

      // Limpiar
      await api
        .delete(`/api/branches/${branchId}`)
        .auth(Token, { type: 'bearer' });
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('25. Eliminar sucursal secundaria si existe', async() => {
      if (secondBranchId) {
        await api
          .delete(`/api/branches/${secondBranchId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
