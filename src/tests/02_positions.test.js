const request = require('supertest');
const server = require('../../app');

const {
  positionCreate,
  positionCreateEmpty,
  positionCreateInvalid,
  positionUpdate
} = require('./helper/helperData');

let Token = '';
let createdPositionId = null;

const api = request(server.app);

// Usuario de prueba para positions
const positionsTestUser = {
  name: 'Positions Test User',
  email: 'positions_test@test.com',
  role: 'superadmin',
  password: 'Test1234'
};

/**
 * Script de tests para Positions
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de puestos
 * 4. Crear puesto con datos validos
 * 5. Crear puesto con datos vacios (error)
 * 6. Crear puesto con datos invalidos (error)
 * 7. Obtener puesto por id
 * 8. Obtener puesto inexistente (error)
 * 9. Actualizar puesto
 * 10. Eliminar puesto
 * 11. Verificar que el puesto eliminado no existe
 */

describe('[POSITIONS] Test api positions //api/positions/', () => {
  test('Registrar usuario de prueba. 200', async() => {
    const response = await api
      .post('/api/auth/registerSuperUser')
      .send(positionsTestUser);

    // Si ya existe (400) o se crea (200), ambos son válidos
    expect([200, 400]).toContain(response.status);
  });

  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send({ email: positionsTestUser.email, password: positionsTestUser.password })
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de puestos. Expect 200', async() => {
    const response = await api
      .get('/api/positions')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('positions');
    expect(Array.isArray(response.body.positions)).toBe(true);
  });

  test('2. Crear puesto con datos validos. Expect 200', async() => {
    const response = await api
      .post('/api/positions')
      .auth(Token, { type: 'bearer' })
      .send(positionCreate)
      .expect(200);

    expect(response.body).toHaveProperty('position');
    expect(response.body.position).toHaveProperty('id');
    expect(response.body.position.name).toBe(positionCreate.name);

    createdPositionId = response.body.position.id;
  });

  test('3. Crear puesto con nombre vacio. Expect 400', async() => {
    await api
      .post('/api/positions')
      .auth(Token, { type: 'bearer' })
      .send(positionCreateEmpty)
      .expect(400);
  });

  test('4. Crear puesto sin datos. Expect 400', async() => {
    await api
      .post('/api/positions')
      .auth(Token, { type: 'bearer' })
      .send(positionCreateInvalid)
      .expect(400);
  });

  test('5. Obtener puesto por id. Expect 200', async() => {
    const response = await api
      .get(`/api/positions/${createdPositionId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('position');
    expect(response.body.position.id).toBe(createdPositionId);
  });

  test('6. Obtener puesto inexistente. Expect 404', async() => {
    await api
      .get('/api/positions/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar puesto. Expect 200', async() => {
    const response = await api
      .put(`/api/positions/${createdPositionId}`)
      .auth(Token, { type: 'bearer' })
      .send(positionUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('position');
    expect(response.body.position.name).toBe(positionUpdate.name);
  });

  test('8. Eliminar puesto. Expect 200', async() => {
    const response = await api
      .delete(`/api/positions/${createdPositionId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el puesto eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/positions/${createdPositionId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });
});
