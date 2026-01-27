const request = require('supertest');
const server = require('../../app');

const {
  userUpdate,
  userUpdateWithRole
} = require('./helper/helperData');

let Token = '';
let testUserId = null;

const api = request(server.app);

// Usuario de prueba para users
const usersTestUser = {
  name: 'Users Test User',
  email: 'users_test@test.com',
  role: 'superadmin',
  password: '12345678'
};

// Usuario adicional para pruebas
const additionalUser = {
  name: 'Usuario Adicional',
  email: 'adicional_user@test.com',
  role: 'user',
  password: '12345678'
};

/**
 * Script de tests para Users
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de usuarios
 * 4. Crear usuario adicional para pruebas
 * 5. Obtener usuario por id
 * 6. Obtener usuario inexistente (error)
 * 7. Actualizar usuario
 * 8. Eliminar usuario
 * 9. Verificar que el usuario eliminado no existe
 */

describe('[USERS] Test api users //api/users/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(usersTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: usersTestUser.email, password: usersTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de usuarios. Expect 200', async() => {
    const response = await api
      .get('/api/users')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThan(0);
  });

  test('2. Crear usuario adicional para pruebas. Expect 200', async() => {
    const response = await api
      .post('/api/auth/register')
      .auth(Token, { type: 'bearer' })
      .send(additionalUser);

    if (response.status === 200) {
      testUserId = response.body.user?.id;
    } else if (response.status === 400) {
      // Usuario ya existe, buscar su ID
      const usersResponse = await api
        .get('/api/users')
        .auth(Token, { type: 'bearer' });

      const existingUser = usersResponse.body.users.find(
        u => u.email === additionalUser.email
      );
      if (existingUser) {
        testUserId = existingUser.id;
      }
    }

    expect([200, 400]).toContain(response.status);
  });

  test('3. Obtener usuario por id. Expect 200', async() => {
    if (!testUserId) {
      // Si no tenemos testUserId, usar el ID del usuario de prueba
      const usersResponse = await api
        .get('/api/users')
        .auth(Token, { type: 'bearer' });

      testUserId = usersResponse.body.users[0]?.id;
    }

    const response = await api
      .get(`/api/users/${testUserId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.id).toBe(testUserId);
  });

  test('4. Obtener usuario inexistente. Expect 404', async() => {
    await api
      .get('/api/users/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('5. Actualizar usuario. Expect 200', async() => {
    if (testUserId) {
      const response = await api
        .put(`/api/users/${testUserId}`)
        .auth(Token, { type: 'bearer' })
        .send(userUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(userUpdate.name);
    }
  });

  test('6. Eliminar usuario. Expect 200', async() => {
    if (testUserId) {
      const response = await api
        .delete(`/api/users/${testUserId}`)
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
    }
  });

  test('7. Verificar que el usuario eliminado no existe. Expect 404', async() => {
    if (testUserId) {
      await api
        .get(`/api/users/${testUserId}`)
        .auth(Token, { type: 'bearer' })
        .expect(404);
    }
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('8. Obtener usuarios sin token. Expect 401', async() => {
      await api
        .get('/api/users')
        .expect(401);
    });

    test('9. Obtener usuario por id sin token. Expect 401', async() => {
      await api
        .get('/api/users/1')
        .expect(401);
    });

    test('10. Actualizar usuario sin token. Expect 401', async() => {
      await api
        .put('/api/users/1')
        .send(userUpdate)
        .expect(401);
    });

    test('11. Eliminar usuario sin token. Expect 401', async() => {
      await api
        .delete('/api/users/1')
        .expect(401);
    });

    test('12. Obtener usuarios con token inválido. Expect 401', async() => {
      await api
        .get('/api/users')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('13. Obtener usuario con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/users/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('14. Actualizar usuario inexistente. Expect 200 o 404', async() => {
      const response = await api
        .put('/api/users/99999')
        .auth(Token, { type: 'bearer' })
        .send(userUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('15. Eliminar usuario inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/users/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('16. Eliminar usuario con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/users/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('17. Verificar estructura completa de usuario', async() => {
      const usersResponse = await api
        .get('/api/users')
        .auth(Token, { type: 'bearer' });

      const userId = usersResponse.body.users[0]?.id;

      if (userId) {
        const response = await api
          .get(`/api/users/${userId}`)
          .auth(Token, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('role');
      }
    });

    test('18. Verificar que lista de usuarios es un array', async() => {
      const response = await api
        .get('/api/users')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    test('19. Actualizar usuario con cambio de rol', async() => {
      // Crear un nuevo usuario para esta prueba
      const newUser = {
        name: 'Usuario Rol Test',
        email: 'rol_test@test.com',
        role: 'user',
        password: '12345678'
      };

      const createResponse = await api
        .post('/api/auth/register')
        .auth(Token, { type: 'bearer' })
        .send(newUser);

      if (createResponse.status === 200 && createResponse.body.user?.id) {
        const userId = createResponse.body.user.id;

        const updateResponse = await api
          .put(`/api/users/${userId}`)
          .auth(Token, { type: 'bearer' })
          .send(userUpdateWithRole)
          .expect(200);

        expect(updateResponse.body).toHaveProperty('user');

        // Limpiar: eliminar el usuario creado
        await api
          .delete(`/api/users/${userId}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });
});
