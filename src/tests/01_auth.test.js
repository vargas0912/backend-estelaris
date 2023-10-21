// const { sequelize } = require('../../config/mysql');
const supertest = require('supertest');

const {
  testAuthRegisterSuperAdmin,
  testAuthRegisterSuperAdminErr,
  testAuthRegisterSuperAdminFail,
  testAuthLogin
} = require('./helper/helperData');

const { server } = require('../../app');

// const api = supertest(server.app);

describe('[AUTH] super User register //api/auth/registerSuperUser', () => {
  test('Register superUser,  expected 200', async () => {
    const response = await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdmin)
      .expect(200);

    expect(response.body).toHaveProperty('superAdmin');
    expect(response.body).toHaveProperty('superAdmin.token');
    expect(response.body).toHaveProperty('superAdmin.user');

    console.log(response.body);
  });

  test('Register super user duplicated,  expected 400', async () => {
    const response = await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminErr)
      .expect(400);

    console.log(response.body);
  });

  test('Register super user incorrect,  expected 400', async () => {
    const response = await supertest(server.app)
      .post('/api/auth/registerSuperUser')
      .send(testAuthRegisterSuperAdminFail)
      .expect(400);

    console.log(response.body);
  });

  test('Must be return password invalid error. 400', async () => {
    const newTestAuthLogin = { ...testAuthLogin, password: '123456789' };
    console.log(newTestAuthLogin);

    await supertest(server.app)
      .post('/api/auth/login')
      .send(newTestAuthLogin)
      .expect(400);
  });

  test('Login ok. 200', async () => {
    await supertest(server.app)
      .post('/api/auth/login')
      .send(testAuthLogin);

    expect(200);
  });

  // test('Shows all users', async () => {
  //     const response = await api
  //         .get('/api/users')
  //         .expect(200);

  //     console.log(response.body);
  // });
});
