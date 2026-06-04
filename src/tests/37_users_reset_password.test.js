const request = require('supertest');
const server = require('../../app');

const api = request(server.app);

let superadminToken = '';
let superadminId = '';
let regularUserId = '';
let adminToken = '';

describe('[USERS] Reset Password //api/users/:id/reset-password', () => {
  test('Setup: Login as superadmin', async() => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: 'superadmin@estelaris.com', password: 'Admin123' })
      .expect(200);

    superadminToken = res.body.sesion.token;
    superadminId = res.body.sesion.user.id;
  });

  test('Setup: Create regular user as reset target', async() => {
    const res = await api
      .post('/api/auth/registerSuperUser')
      .auth(superadminToken, { type: 'bearer' })
      .send({
        name: 'Reset Target User',
        email: 'reset.target@test.com',
        role: 'user',
        password: 'OrigPass1'
      })
      .expect(200);

    regularUserId = res.body.superAdmin.user.id;
  });

  test('Setup: Create admin user to test unauthorized caller', async() => {
    await api
      .post('/api/auth/registerSuperUser')
      .auth(superadminToken, { type: 'bearer' })
      .send({
        name: 'Reset Admin User',
        email: 'reset.admin@test.com',
        role: 'admin',
        password: 'AdminPass1'
      })
      .expect(200);

    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: 'reset.admin@test.com', password: 'AdminPass1' })
      .expect(200);

    adminToken = loginRes.body.sesion.token;
  });

  test('1. Unauthenticated request returns 401', async() => {
    await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .expect(401);
  });

  test('2. Admin caller (non-superadmin) returns 403', async() => {
    await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(adminToken, { type: 'bearer' })
      .expect(403);
  });

  test('3. Non-existent target user returns 404', async() => {
    await api
      .post('/api/users/999999/reset-password')
      .auth(superadminToken, { type: 'bearer' })
      .expect(404);
  });

  test('4. Target is superadmin returns 403 (no privilege escalation)', async() => {
    await api
      .post(`/api/users/${superadminId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(403);
  });

  test('5. Valid reset returns 200 with temporaryPassword', async() => {
    const res = await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);

    expect(res.body).toHaveProperty('temporaryPassword');
    expect(typeof res.body.temporaryPassword).toBe('string');
    expect(res.body.temporaryPassword.length).toBeGreaterThanOrEqual(12);
  });

  test('6. Response does not contain password hash or any extra key', async() => {
    const res = await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);

    expect(Object.keys(res.body)).toEqual(['temporaryPassword']);
  });

  test('7. Can login with the returned temporary password', async() => {
    const resetRes = await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);

    await api
      .post('/api/auth/login')
      .send({ email: 'reset.target@test.com', password: resetRes.body.temporaryPassword })
      .expect(200);
  });

  test('8. Cannot login with original password after reset', async() => {
    await api
      .post('/api/auth/login')
      .send({ email: 'reset.target@test.com', password: 'OrigPass1' })
      .expect(400);
  });

  test('9. Invalid non-numeric id returns 400', async() => {
    await api
      .post('/api/users/abc/reset-password')
      .auth(superadminToken, { type: 'bearer' })
      .expect(400);
  });

  test('10. Login after reset includes must_change_password: true', async() => {
    const resetRes = await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);

    const loginRes = await api
      .post('/api/auth/login')
      .send({ email: 'reset.target@test.com', password: resetRes.body.temporaryPassword })
      .expect(200);

    expect(loginRes.body.sesion.user.must_change_password).toBe(true);
  });

  test('11. After change-password, must_change_password resets to false', async() => {
    const resetRes = await api
      .post(`/api/users/${regularUserId}/reset-password`)
      .auth(superadminToken, { type: 'bearer' })
      .expect(200);

    const tempPassword = resetRes.body.temporaryPassword;
    const newPassword = 'Secure99!newpass';

    const changeRes = await api
      .put('/api/users/change-password')
      .auth(
        (await api.post('/api/auth/login')
          .send({ email: 'reset.target@test.com', password: tempPassword })
          .expect(200)).body.sesion.token,
        { type: 'bearer' }
      )
      .send({
        current_password: tempPassword,
        new_password: newPassword,
        confirm_password: newPassword
      })
      .expect(200);

    expect(changeRes.body.must_change_password).toBe(false);

    const loginAfter = await api
      .post('/api/auth/login')
      .send({ email: 'reset.target@test.com', password: newPassword })
      .expect(200);

    expect(loginAfter.body.sesion.user.must_change_password).toBe(false);
  });
});
