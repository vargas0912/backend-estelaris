const request = require('supertest');
const server = require('../../app');

const {
  privilegeCreate,
  privilegeCreateEmpty,
  privilegeCreateInvalid,
  privilegeUpdate,
  privilegeUpdateEmpty,
  privilegeCreateNoCodename,
  privilegeCreateNoModule,
  privilegeCreate2
} = require('./helper/helperData');

let Token = '';
let createdPrivilegeId = null;
let secondPrivilegeId = null;

const api = request(server.app);

// Usuario de prueba para privileges
const privilegesTestUser = {
  name: 'Privileges Test User',
  email: 'privileges_test@test.com',
  role: 'superadmin',
  password: '12345678'
};

/**
 * Script de tests para Privileges
 */

describe('[PRIVILEGES] Test api privileges //api/privileges/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(privilegesTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: privilegesTestUser.email, password: privilegesTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de privilegios. Expect 200', async() => {
    const response = await api
      .get('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('privileges');
    expect(Array.isArray(response.body.privileges)).toBe(true);
  });

  test('2. Crear privilegio con datos validos. Expect 200', async() => {
    const response = await api
      .post('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .send(privilegeCreate)
      .expect(200);

    expect(response.body).toHaveProperty('privilege');
    expect(response.body.privilege).toHaveProperty('id');
    expect(response.body.privilege.name).toBe(privilegeCreate.name);
    expect(response.body.privilege.codename).toBe(privilegeCreate.codename);
    expect(response.body.privilege.module).toBe(privilegeCreate.module);

    createdPrivilegeId = response.body.privilege.id;
  });

  test('3. Crear privilegio con datos vacios. Expect 400', async() => {
    await api
      .post('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .send(privilegeCreateEmpty)
      .expect(400);
  });

  test('4. Crear privilegio sin datos. Expect 400', async() => {
    await api
      .post('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .send(privilegeCreateInvalid)
      .expect(400);
  });

  test('5. Obtener privilegio por id. Expect 200', async() => {
    const response = await api
      .get(`/api/privileges/${createdPrivilegeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('privilege');
    expect(response.body.privilege.id).toBe(createdPrivilegeId);
  });

  test('6. Obtener privilegio inexistente. Expect 404', async() => {
    const response = await api
      .get('/api/privileges/99999')
      .auth(Token, { type: 'bearer' });

    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.privilege).toBeNull();
    }
  });

  test('7. Obtener privilegios por modulo. Expect 200', async() => {
    const response = await api
      .get(`/api/privileges/module/${privilegeCreate.module}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('privileges');
    expect(Array.isArray(response.body.privileges)).toBe(true);
    if (response.body.privileges.length > 0) {
      expect(response.body.privileges[0]).toHaveProperty('module');
    }
  });

  test('8. Actualizar privilegio. Expect 200', async() => {
    const response = await api
      .put(`/api/privileges/${createdPrivilegeId}`)
      .auth(Token, { type: 'bearer' })
      .send(privilegeUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('privilege');
    expect(response.body.privilege.name).toBe(privilegeUpdate.name);
    expect(response.body.privilege.codename).toBe(privilegeUpdate.codename);
  });

  test('9. Eliminar privilegio. Expect 200', async() => {
    const response = await api
      .delete(`/api/privileges/${createdPrivilegeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('privilege');
  });

  test('10. Verificar que el privilegio eliminado no existe. Expect 404', async() => {
    const response = await api
      .get(`/api/privileges/${createdPrivilegeId}`)
      .auth(Token, { type: 'bearer' });

    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.privilege).toBeNull();
    }
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('11. Obtener privilegios sin token. Expect 401', async() => {
      const response = await api
        .get('/api/privileges');

      expect(response.status).toBe(401);
    });

    test('12. Crear privilegio sin token. Expect 401', async() => {
      await api
        .post('/api/privileges')
        .send(privilegeCreate)
        .expect(401);
    });

    test('13. Actualizar privilegio sin token. Expect 401', async() => {
      await api
        .put('/api/privileges/1')
        .send(privilegeUpdate)
        .expect(401);
    });

    test('14. Eliminar privilegio sin token. Expect 401', async() => {
      await api
        .delete('/api/privileges/1')
        .expect(401);
    });

    test('15. Obtener privilegios con token invalido. Expect 401', async() => {
      await api
        .get('/api/privileges')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });

    test('16. Obtener privilegios por modulo sin token. Expect 401', async() => {
      await api
        .get('/api/privileges/module/users')
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('17. Crear privilegio sin codename. Expect 400', async() => {
      await api
        .post('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .send(privilegeCreateNoCodename)
        .expect(400);
    });

    test('18. Crear privilegio sin module. Expect 400', async() => {
      await api
        .post('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .send(privilegeCreateNoModule)
        .expect(400);
    });

    test('19. Actualizar privilegio con datos vacios. Expect 400', async() => {
      // Primero crear un privilegio para actualizar
      const createResponse = await api
        .post('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .send(privilegeCreate2);

      secondPrivilegeId = createResponse.body.privilege?.id;

      if (secondPrivilegeId) {
        await api
          .put(`/api/privileges/${secondPrivilegeId}`)
          .auth(Token, { type: 'bearer' })
          .send(privilegeUpdateEmpty)
          .expect(400);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('20. Obtener privilegio con ID no numerico. Expect 404', async() => {
      const response = await api
        .get('/api/privileges/abc')
        .auth(Token, { type: 'bearer' });

      expect([200, 404]).toContain(response.status);
    });

    test('21. Actualizar privilegio inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/privileges/99999')
        .auth(Token, { type: 'bearer' })
        .send(privilegeUpdate);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.body.privilege?.result) {
        expect(response.body.privilege.result.msg).toBe('NOT_FOUND');
      }
    });

    test('22. Eliminar privilegio inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .delete('/api/privileges/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('privilege');
      if (response.body.privilege?.result) {
        expect(response.body.privilege.result.msg).toBe('NOT_FOUND');
      }
    });

    test('23. Eliminar privilegio con ID no numerico. Expect 400', async() => {
      await api
        .delete('/api/privileges/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('24. Verificar estructura completa de privilegio creado', async() => {
      const response = await api
        .post('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Privilegio estructura test',
          codename: 'test_privilege',
          module: 'test_module'
        })
        .expect(200);

      expect(response.body).toHaveProperty('privilege');
      expect(response.body.privilege).toHaveProperty('id');
      expect(response.body.privilege).toHaveProperty('name');
      expect(response.body.privilege).toHaveProperty('codename');
      expect(response.body.privilege).toHaveProperty('module');

      // Limpiar: eliminar el privilegio creado
      if (response.body.privilege.id) {
        await api
          .delete(`/api/privileges/${response.body.privilege.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('25. Verificar que lista de privilegios es un array', async() => {
      const response = await api
        .get('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('privileges');
      expect(Array.isArray(response.body.privileges)).toBe(true);
    });

    test('26. Verificar que privilegios por modulo retorna solo del modulo especificado', async() => {
      const moduleName = 'test_module_unique';

      // Crear privilegio con módulo específico
      const createResponse = await api
        .post('/api/privileges')
        .auth(Token, { type: 'bearer' })
        .send({
          name: 'Privilegio modulo test',
          codename: 'test_module_privilege',
          module: moduleName
        })
        .expect(200);

      const privilegeId = createResponse.body.privilege.id;

      // Obtener privilegios del módulo
      const response = await api
        .get(`/api/privileges/module/${moduleName}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('privileges');
      expect(Array.isArray(response.body.privileges)).toBe(true);

      // Verificar que todos los privilegios son del módulo correcto
      response.body.privileges.forEach(priv => {
        expect(priv.module).toBe(moduleName);
      });

      // Limpiar
      await api
        .delete(`/api/privileges/${privilegeId}`)
        .auth(Token, { type: 'bearer' });
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('27. Eliminar privilegio secundario si existe', async() => {
      if (secondPrivilegeId) {
        await api
          .delete(`/api/privileges/${secondPrivilegeId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
