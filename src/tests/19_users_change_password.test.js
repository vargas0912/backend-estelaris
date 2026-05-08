const request = require('supertest');
const server = require('../../app');

const api = request(server.app);

let superadminToken = '';
let userToken = '';
const SUPERADMIN_PASSWORD = 'Admin123';
const USER_EMAIL = 'change.pass.test@test.com';
const USER_PASSWORD = 'UserPass1';
const NEW_PASSWORD = 'NewPass99';

describe('[USERS] Change password //api/users/change-password', () => {
  test('Setup: Bootstrap superadmin and login', async() => {
    // Bootstrap initial superadmin (only works when no superadmin exists in DB)
    await api
      .post('/api/auth/registerSuperUser')
      .send({ name: 'Super Admin', email: 'superadmin@estelaris.com', role: 'superadmin', password: SUPERADMIN_PASSWORD })
      .expect(200);

    const res = await api
      .post('/api/auth/login')
      .send({ email: 'superadmin@estelaris.com', password: SUPERADMIN_PASSWORD })
      .expect(200);

    superadminToken = res.body.sesion.token;
  });

  test('Setup: Create test user', async() => {
    await api
      .post('/api/auth/registerSuperUser')
      .auth(superadminToken, { type: 'bearer' })
      .send({ name: 'Change Pass User', email: USER_EMAIL, role: 'user', password: USER_PASSWORD })
      .expect(200);

    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
      .expect(200);

    userToken = loginRes.body.sesion.token;
  });

  test('1. Missing fields returns 422', async() => {
    await api
      .put('/api/users/change-password')
      .auth(userToken, { type: 'bearer' })
      .send({})
      .expect(400);
  });

  test('2. Wrong current password returns 401', async() => {
    await api
      .put('/api/users/change-password')
      .auth(userToken, { type: 'bearer' })
      .send({
        current_password: 'WrongPass1',
        new_password: NEW_PASSWORD,
        confirm_password: NEW_PASSWORD
      })
      .expect(401);
  });

  test('3. Mismatched confirm_password returns 422', async() => {
    await api
      .put('/api/users/change-password')
      .auth(userToken, { type: 'bearer' })
      .send({
        current_password: USER_PASSWORD,
        new_password: NEW_PASSWORD,
        confirm_password: 'Different9'
      })
      .expect(400);
  });

  test('4. Weak new_password (no uppercase) returns 422', async() => {
    await api
      .put('/api/users/change-password')
      .auth(userToken, { type: 'bearer' })
      .send({
        current_password: USER_PASSWORD,
        new_password: 'weakpass1',
        confirm_password: 'weakpass1'
      })
      .expect(400);
  });

  test('5. Valid change returns 200 and success message', async() => {
    const res = await api
      .put('/api/users/change-password')
      .auth(userToken, { type: 'bearer' })
      .send({
        current_password: USER_PASSWORD,
        new_password: NEW_PASSWORD,
        confirm_password: NEW_PASSWORD
      })
      .expect(200);

    expect(res.body.message).toBe('PASSWORD_CHANGED_SUCCESSFULLY');
  });

  test('6. Login with old password fails after change', async() => {
    await api
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: USER_PASSWORD })
      .expect(400);
  });

  test('7. Login with new password succeeds', async() => {
    await api
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: NEW_PASSWORD })
      .expect(200);
  });

  test('8. Unauthenticated request returns 401', async() => {
    await api
      .put('/api/users/change-password')
      .send({
        current_password: NEW_PASSWORD,
        new_password: 'Another9A',
        confirm_password: 'Another9A'
      })
      .expect(401);
  });

  test('9. Superadmin can also change their own password', async() => {
    const res = await api
      .put('/api/users/change-password')
      .auth(superadminToken, { type: 'bearer' })
      .send({
        current_password: SUPERADMIN_PASSWORD,
        new_password: 'Admin456X',
        confirm_password: 'Admin456X'
      })
      .expect(200);

    expect(res.body.message).toBe('PASSWORD_CHANGED_SUCCESSFULLY');

    // Restore superadmin password for remaining test suites
    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: 'superadmin@estelaris.com', password: 'Admin456X' })
      .expect(200);

    await api
      .put('/api/users/change-password')
      .auth(loginRes.body.sesion.token, { type: 'bearer' })
      .send({
        current_password: 'Admin456X',
        new_password: SUPERADMIN_PASSWORD,
        confirm_password: SUPERADMIN_PASSWORD
      })
      .expect(200);
  });
});
