// const { sequelize } = require('../../config/mysql');
const request = require('supertest');
const server = require('../../app');

const {
  testAuthRegisterSuperAdmin,
  testAuthRegisterSuperAdminErr,
  testAuthRegisterSuperAdminFail,
  testAuthRegisterAdmin,
  testAuthLogin,
  privilege
} = require('./helper/helperData');

let Token = '';

const api = request(server.app);

/**
 * Script de tests para Auth
 *
 * 1. Insertar superusuario
 * 2. Registrar usuario duplicado
 * 3. Registrar usuario con errores
 * 4. Registrar admin
 * 5. Login con pasword incorrecto
 * 6. Login con datos validos
 * 7. Obtener lista de usuarios
 * 8. Obtener un solo usuario
 * 9. Actualizar la informacion de un usuario
 * 10. Eliminar un usuario
 */

/**
 * Script para privulegios y usuaros privilegios
 * 1. Cargar seed de privilegios basicos
 * 2. Crear privilegio de prueba
 * 3. Crear privilegio con errores
 * 4. Ver lista de privilegios
 * 5. Ver privilegio por id
 * 6. Ver privilegio por modulo
 * 7. Modificar privilegio
 * 8. Eliminar privilegio
 */

describe('[AUTH] super User register //api/auth/registerSuperUser', () => {
  test('1. Register first superUser (bootstrap), expected 200', async() => {
    // NO hay superadmin en el seeder, por lo que permite bootstrap inicial
    // Este es el único momento en que el endpoint es público
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin)
      .expect(200);
  });

  test('2. Register super user duplicated, expected 400', async() => {
    // Ahora ya existe un superadmin, por lo que requiere autenticación
    // Sin token, debe fallar con 401
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminErr)
      .expect(401);

    // console.log(response.body);
  });

  test('3. Register super user incorrect (without auth), expected 401', async() => {
    // Ya existe superadmin, requiere autenticación
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminFail)
      .expect(401);

    // console.log(response.body);
  });

  test('4. Register user without auth token, expected 401', async() => {
    // Ya existe superadmin, requiere autenticación
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterAdmin)
      .expect(401);

    // console.log(response.body);
  });

  test('5. Must be return password invalid error. 400', async() => {
    const newTestAuthLogin = { ...testAuthLogin, password: '123456789' };
    // console.log(newTestAuthLogin);

    await api
      .post('/api/auth/login')
      .send(newTestAuthLogin)
      .expect(400);
  });

  test('6. Login ok. 200', async() => {
    await api
      .post('/api/auth/login')
      .send(testAuthLogin)
      .expect(200);

    // console.log(response.body.sesion.token);
  });
});

describe('[USERS] Test api users //api/users/', () => {
  test('Login for get data. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testAuthLogin)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token; /* Saving the token in a variable named Token. */

        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('7. Shows all users', async() => {
    await api
      .get('/api/users')
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  test('8. Find wrong  user. Expect 404', async() => {
    await api
      .get('/api/users/25')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('9. Shows only one user. Expec 200', async() => {
    const response = await api
      .get('/api/users/1')
      .auth(Token, { type: 'bearer' });

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('user');
  });

  test('10. modify one user. Expect 200', async() => {
    await api
      .put('/api/users/1')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'User modified', role: 'superadmin' })
      .expect(200);
  });

  test('11. modify one user with role wrong. Expect 400', async() => {
    await api
      .put('/api/users/1')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'User modified', role: 'speradmin' })
      .expect(400);
  });

  test('12. delete user incorrect. Expect 404', async() => {
    await api
      .delete('/api/users/2323')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('11b. superadmin can create another user with auth. Expect 200', async() => {
    // CRIT-001: Verificar que superadmin autenticado SÍ puede crear usuarios
    await api
      .post('/api/auth/registerSuperUser')
      .auth(Token, { type: 'bearer' })
      .send({
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        password: 'Admin1234'
      })
      .expect(200);
  });

  test('12b. create user to delete. Expect 200', async() => {
    // Con autenticación del superadmin
    await api
      .post('/api/auth/registerSuperUser')
      .auth(Token, { type: 'bearer' })
      .send({
        name: 'User to delete',
        email: 'todelete@test.com',
        role: 'user',
        password: 'Test1234'
      })
      .expect(200);
  });

  test('13. delete user. Expect 200', async() => {
    await api
      .delete('/api/users/3')
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  test('14. try show deleted user. Expec 404', async() => {
    await api
      .get('/api/users/3')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });
});

describe('[Privileges] Test api privileges //api/privileges/', () => {
  test('1. show all privileges. Expect 200', async() => {
    await api
      .get('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  test('2. show only one privilege. Expect 200', async() => {
    await api
      .get('/api/privileges/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);
  });

  test('3. show only one privilege  y module. Expect 200', async() => {
    const response = await api
      .get('/api/privileges/module/users')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('privileges');
  });

  test('2. Create test privilege. Expect 200', async() => {
    await api
      .post('/api/privileges')
      .auth(Token, { type: 'bearer' })
      .send(privilege)
      .expect(200);
  });
});
