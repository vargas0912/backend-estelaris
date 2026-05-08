const request = require('supertest');
const server = require('../../app');

const api = request(server.app);

let validToken = '';
let expiresAt = '';

describe('[AUTH] Token refresh //api/auth/refresh', () => {
  test('Setup: Ensure superadmin exists and login', async() => {
    // Works in isolation (bootstrap) and in full suite (superadmin already exists → 401, ignored)
    await api
      .post('/api/auth/registerSuperUser')
      .send({ name: 'Super Admin', email: 'superadmin@estelaris.com', role: 'superadmin', password: 'Admin123' });

    const res = await api
      .post('/api/auth/login')
      .send({ email: 'superadmin@estelaris.com', password: 'Admin123' })
      .expect(200);

    validToken = res.body.sesion.token;
    expiresAt = res.body.sesion.expires_at;
  });

  test('1. Login response includes expires_at as ISO date string', () => {
    expect(expiresAt).toBeDefined();
    expect(() => new Date(expiresAt)).not.toThrow();
    const expDate = new Date(expiresAt);
    expect(expDate.getTime()).toBeGreaterThan(Date.now());
  });

  test('2. Login expires_at is approximately 2 hours from now', () => {
    const expDate = new Date(expiresAt);
    const diffMs = expDate.getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(1.9);
    expect(diffHours).toBeLessThanOrEqual(2.1);
  });

  test('3. Unauthenticated refresh returns 401', async() => {
    await api
      .post('/api/auth/refresh')
      .expect(401);
  });

  test('4. Refresh with invalid token returns 401', async() => {
    await api
      .post('/api/auth/refresh')
      .auth('invalid.token.here', { type: 'bearer' })
      .expect(401);
  });

  test('5. Refresh with valid token returns 200 with new token and expires_at', async() => {
    const res = await api
      .post('/api/auth/refresh')
      .auth(validToken, { type: 'bearer' })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.expires_at).toBeDefined();
  });

  test('6. Refreshed token expires_at is ~2h from now', async() => {
    const res = await api
      .post('/api/auth/refresh')
      .auth(validToken, { type: 'bearer' })
      .expect(200);

    const expDate = new Date(res.body.expires_at);
    const diffHours = (expDate.getTime() - Date.now()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThan(1.9);
    expect(diffHours).toBeLessThanOrEqual(2.1);
  });

  test('7. Refreshed token is valid for authenticated endpoints', async() => {
    const refreshRes = await api
      .post('/api/auth/refresh')
      .auth(validToken, { type: 'bearer' })
      .expect(200);

    const newToken = refreshRes.body.token;

    await api
      .post('/api/auth/refresh')
      .auth(newToken, { type: 'bearer' })
      .expect(200);
  });
});
