// const { sequelize } = require('../../config/mysql');
const supertest = require('supertest');

const { testAuthRegisterAdmin } = require('./helper/helperData');

const { server } = require('../../app');

const api = supertest(server.app);

describe('[AUTH] Prueba de /api/users', () => {
  test('Intenta agregar un nuevo usuario,  expected 200', async () => {
    await api
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterAdmin)
      .expect(200);
    //    .expect(response.body).toHaveProperty('superAdmin')
    //  .expect(response.body).toHaveProperty('superAdmin.token')
    // .expect(response.body).toHaveProperty('superAdmin.user');
  });

  // test('Shows all users', async () => {
  //     const response = await api
  //         .get('/api/users')
  //         .expect(200);

  //     console.log(response.body);
  // });

  // test('Esto deberia de retornar password no valido 401', async () => {
  //     const newTestAuthLogin = {...testAuthLogin, password:'12345678'};

  //     await api
  //         .post('/api/auth/login')
  //         .send(newTestAuthLogin);

  //     expect(401);
  // });
});
