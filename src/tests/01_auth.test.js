// const { sequelize } = require('../../config/mysql');
const supertest = require('supertest');

const {
  testAuthRegisterSuperAdmin,
  testAuthRegisterSuperAdminErr,
  testAuthRegisterSuperAdminFail,
  testAuthRegisterAdmin,
  testAuthLogin
} = require('./helper/helperData');

const server = require('../../app');

// const api = supertest(server.app);

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
 * 4. Asignar a user admin los privilegios
 * 5.
 */

describe('[AUTH] super User register //api/auth/registerSuperUser', () => {
  test('1. Register superUser,  expected 200', async () => {
    const response = await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin)
      .expect(200);

    expect(response.body).toHaveProperty('superAdmin');
    expect(response.body).toHaveProperty('superAdmin.token');
    expect(response.body).toHaveProperty('superAdmin.user');

    // console.log(response.body);
  });

  test('2. Register super user duplicated,  expected 400', async () => {
    await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminErr)
      .expect(400);

    // console.log(response.body);
  });

  test('3. Register super user incorrect,  expected 400', async () => {
    await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminFail)
      .expect(400);

    // console.log(response.body);
  });

  test('4. Register user admin,  expected 200', async () => {
    await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterAdmin)
      .expect(200);

    // console.log(response.body);
  });

  test('5. Must be return password invalid error. 400', async () => {
    const newTestAuthLogin = { ...testAuthLogin, password: '123456789' };
    // console.log(newTestAuthLogin);

    await supertest(server.app)
      .post('/api/auth/login')
      .send(newTestAuthLogin)
      .expect(400);
  });

  test('6. Login ok. 200', async () => {
    await supertest(server.app)
      .post('/api/auth/login')
      .send(testAuthLogin)
      .expect(200);

    // console.log(response.body.sesion.token);
  });
});

describe('[USERS] Test api users //api/users/', () => {
  let Token = '';

  test('7. Login for get data. 200', async () => {
    await supertest(server.app)
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testAuthLogin)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token; /* Saving the token in a variable named Token. */

        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('8. Shows all users', async () => {
    await supertest(server.app)
      .get('/api/users')
      .auth(Token, { type: 'bearer' })
      // .set('Authorization', 'bearer ' + Token)
      .expect(200);
  });

  test('9. Find wrong  user. Expect 404', async () => {
    await supertest(server.app)
      .get('/api/users/25')
      .auth(Token, { type: 'bearer' })
      .expect(404);

    // expect(response.body).toHaveProperty('user');
  });

  test('10. Shows only one user. Expec 200', async () => {
    await supertest(server.app)
      .get('/api/users/1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    // expect(response.body).toHaveProperty('user');
  });
});

describe('[Privileges] Test api privileges //api/privileges/', () => {
  test('1. Create test privilege. Expect 200', async () => {
    await supertest(server.app)
      .post('/api/privilege')
      .send(testAuthLogin)
      .expect(200);
  });
});
