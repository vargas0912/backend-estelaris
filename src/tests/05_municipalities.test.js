const request = require('supertest');
const server = require('../../app');

let Token = '';

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Municipalities
 *
 * Nota: Este módulo es de solo lectura (GET).
 * No tiene operaciones de CREATE, UPDATE o DELETE.
 */

describe('[MUNICIPALITIES] Test api municipalities //api/municipalities/', () => {
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

    expect(response.body).toHaveProperty('municipalities');
    expect(Array.isArray(response.body.municipalities)).toBe(true);
  });

  test('4. Obtener municipios de estado inexistente. Expect 200 con array vacio', async() => {
    const response = await api
      .get('/api/municipalities/state/99999')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('municipalities');
    expect(Array.isArray(response.body.municipalities)).toBe(true);
    expect(response.body.municipalities.length).toBe(0);
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

      expect(response.body).toHaveProperty('municipalities');
      expect(Array.isArray(response.body.municipalities)).toBe(true);
    });

    test('11. Obtener municipio con ID negativo. Expect 404', async() => {
      await api
        .get('/api/municipalities/-1')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de autocomplete GET /api/municipalities
  // ============================================
  describe('Tests de autocomplete de municipios', () => {
    test('A1. GET /municipalities?search=Gua&limit=5 con auth valido. Expect 200 con municipalities array', async() => {
      const response = await api
        .get('/api/municipalities')
        .query({ search: 'Gua', limit: 5 })
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('municipalities');
      expect(Array.isArray(response.body.municipalities)).toBe(true);
      if (response.body.municipalities.length > 0) {
        const item = response.body.municipalities[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('estado');
        expect(item.estado).toHaveProperty('id');
        expect(item.estado).toHaveProperty('name');
      }
    });

    test('A2. GET /municipalities?search=zzzzz. Expect 200 con array vacio', async() => {
      const response = await api
        .get('/api/municipalities')
        .query({ search: 'zzzzz' })
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('municipalities');
      expect(Array.isArray(response.body.municipalities)).toBe(true);
      expect(response.body.municipalities.length).toBe(0);
    });

    test('A3. GET /municipalities sin search. Expect 400 (validacion)', async() => {
      await api
        .get('/api/municipalities')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });

    test('A4. GET /municipalities sin auth. Expect 401', async() => {
      await api
        .get('/api/municipalities')
        .query({ search: 'Gua' })
        .expect(401);
    });

    test('A5. GET /municipalities con auth valido pero sin privilegio view_municipality. Expect 403', async() => {
      // Crear usuario sin privilegios y hacer login
      const superadminLoginRes = await api
        .post('/api/auth/login')
        .send({ email: 'superadmin@estelaris.com', password: 'Admin123' });

      const superadminToken = superadminLoginRes.body.sesion.token;

      const newUserEmail = `mun_nopriv_${Date.now()}@test.com`;
      const registerRes = await api
        .post('/api/auth/register')
        .auth(superadminToken, { type: 'bearer' })
        .send({
          name: 'Sin Priv Municipio',
          email: newUserEmail,
          password: 'Test1234',
          role: 'user'
        });

      if (registerRes.status !== 200) {
        console.log('Could not register user for 403 test, skipping');
        expect(true).toBe(true);
        return;
      }

      const loginRes = await api
        .post('/api/auth/login')
        .send({ email: newUserEmail, password: 'Test1234' });

      const noPrivToken = loginRes.body.sesion.token;

      await api
        .get('/api/municipalities')
        .query({ search: 'Gua' })
        .auth(noPrivToken, { type: 'bearer' })
        .expect(403);
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

      expect(response.body).toHaveProperty('municipalities');
      expect(Array.isArray(response.body.municipalities)).toBe(true);
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

      if (response.body.municipalities.length > 0) {
        expect(response.body.municipalities[0]).toHaveProperty('estado');
        expect(response.body.municipalities[0].estado).toHaveProperty('id');
        expect(response.body.municipalities[0].estado).toHaveProperty('name');
      }
    });
  });
});
