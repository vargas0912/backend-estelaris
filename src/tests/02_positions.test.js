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

// Usar el superadmin creado en 01_auth.test.js
const positionsTestUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Positions
 *
 * 1. Login para obtener token (usando superadmin existente)
 * 2. Obtener lista de puestos
 * 3. Crear puesto con datos validos
 * 4. Crear puesto con datos vacios (error)
 * 5. Crear puesto con datos invalidos (error)
 * 6. Obtener puesto por id
 * 7. Obtener puesto inexistente (error)
 * 8. Actualizar puesto
 * 9. Eliminar puesto
 * 10. Verificar que el puesto eliminado no existe
 */

describe('[POSITIONS] Test api positions //api/positions/', () => {
  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(positionsTestUser)
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
