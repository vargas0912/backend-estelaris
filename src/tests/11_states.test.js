const request = require('supertest');
const server = require('../../app');

let Token = '';

const api = request(server.app);

// Usuario de prueba para states
const statesTestUser = {
  name: 'States Test User',
  email: 'states_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para States
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de estados
 * 4. Obtener estado por id
 * 5. Obtener estado inexistente (error)
 */

describe('[STATES] Test api states //api/states/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(statesTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: statesTestUser.email, password: statesTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de estados. Expect 200', async() => {
    const response = await api
      .get('/api/states')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('2. Obtener estado por id. Expect 200', async() => {
    const response = await api
      .get('/api/states/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('state');
    expect(response.body.state).toHaveProperty('id');
    expect(response.body.state.id).toBe(1);
    expect(response.body.state).toHaveProperty('name');
  });

  test('3. Obtener estado inexistente. Expect 200 con state null', async() => {
    const response = await api
      .get('/api/states/99999')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('state');
    expect(response.body.state).toBeNull();
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('4. Obtener estados sin token. Expect 401', async() => {
      await api
        .get('/api/states')
        .expect(401);
    });

    test('5. Obtener estado por id sin token. Expect 401', async() => {
      await api
        .get('/api/states/1')
        .expect(401);
    });

    test('6. Obtener estados con token inválido. Expect 401', async() => {
      await api
        .get('/api/states')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('7. Obtener estado con ID no numérico. Expect 200 con state null', async() => {
      const response = await api
        .get('/api/states/abc')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('state');
      expect(response.body.state).toBeNull();
    });

    test('8. Obtener estado con ID negativo. Expect 200 con state null', async() => {
      const response = await api
        .get('/api/states/-1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('state');
      expect(response.body.state).toBeNull();
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('9. Verificar estructura completa de estado', async() => {
      const response = await api
        .get('/api/states/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('state');
      expect(response.body.state).toHaveProperty('id');
      expect(response.body.state).toHaveProperty('name');
      expect(response.body.state).toHaveProperty('abrev');
      expect(response.body.state).toHaveProperty('key');
    });

    test('10. Verificar que lista de estados es un array con elementos', async() => {
      const response = await api
        .get('/api/states')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar estructura del primer elemento
      if (response.body.data.length > 0) {
        const firstState = response.body.data[0];
        expect(firstState).toHaveProperty('id');
        expect(firstState).toHaveProperty('name');
      }
    });
  });
});
