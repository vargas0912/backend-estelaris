const request = require('supertest');
const server = require('../../app');

let Token = '';

const api = request(server.app);

// Usuario de prueba para municipalities
const municipalitiesTestUser = {
  name: 'Municipalities Test User',
  email: 'municipalities_test@test.com',
  role: 'superadmin',
  password: '12345678'
};

/**
 * Script de tests para Municipalities
 *
 * Nota: Este módulo es de solo lectura (GET).
 * No tiene operaciones de CREATE, UPDATE o DELETE.
 */

describe('[MUNICIPALITIES] Test api municipalities //api/municipalities/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(municipalitiesTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: municipalitiesTestUser.email, password: municipalitiesTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener municipio por id. Expect 200', async() => {
    const response = await api
      .get('/api/municipalities/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
  });

  test('2. Obtener municipio inexistente. Expect 404', async() => {
    await api
      .get('/api/municipalities/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('3. Obtener municipios por estado. Expect 200', async() => {
    const response = await api
      .get('/api/municipalities/state/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('4. Obtener municipios de estado inexistente. Expect 200 con array vacio', async() => {
    const response = await api
      .get('/api/municipalities/state/99999')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('5. Obtener municipio sin token. Expect 401', async() => {
      await api
        .get('/api/municipalities/1')
        .expect(401);
    });

    test('6. Obtener municipios por estado sin token. Expect 401', async() => {
      await api
        .get('/api/municipalities/state/1')
        .expect(401);
    });

    test('7. Obtener municipio con token invalido. Expect 401', async() => {
      await api
        .get('/api/municipalities/1')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });

    test('8. Obtener municipios por estado con token invalido. Expect 401', async() => {
      await api
        .get('/api/municipalities/state/1')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('9. Obtener municipio con ID no numerico. Expect 404', async() => {
      await api
        .get('/api/municipalities/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('10. Obtener municipios con estado ID no numerico. Expect 200 con array vacio', async() => {
      const response = await api
        .get('/api/municipalities/state/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('11. Obtener municipio con ID negativo. Expect 404', async() => {
      await api
        .get('/api/municipalities/-1')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('12. Verificar estructura completa de municipio', async() => {
      const response = await api
        .get('/api/municipalities/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('created_at');
      expect(response.body.data).toHaveProperty('updated_at');
    });

    test('13. Verificar que lista de municipios por estado es un array', async() => {
      const response = await api
        .get('/api/municipalities/state/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('14. Verificar estructura de municipio con estado', async() => {
      const response = await api
        .get('/api/municipalities/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('estado');
      expect(response.body.data.estado).toHaveProperty('id');
      expect(response.body.data.estado).toHaveProperty('name');
    });

    test('15. Verificar que municipios de un estado tienen relacion con estado', async() => {
      const response = await api
        .get('/api/municipalities/state/1')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('estado');
        expect(response.body.data[0].estado).toHaveProperty('id');
        expect(response.body.data[0].estado).toHaveProperty('name');
      }
    });
  });
});
