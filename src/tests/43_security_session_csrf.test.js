const request = require('supertest');
const server = require('../../app');

const SUPERADMIN = { email: 'superadmin@estelaris.com', password: 'Admin123' };
const ENV_KEYS = ['AUTH_ALLOW_BEARER', 'CSRF_MODE', 'COOKIE_SAMESITE', 'COOKIE_SECURE', 'COOKIE_DOMAIN'];
const originalEnv = {};

const getCookie = (res, name) => (res.headers['set-cookie'] || []).find((c) => c.startsWith(`${name}=`));
const cookieValue = (cookie) => decodeURIComponent(cookie.split(';')[0].split('=').slice(1).join('='));

// Simula el navegador del front V2: cookies sí, Bearer no.
const browserLogin = async() => {
  const agent = request.agent(server.app);
  const csrfRes = await agent.get('/api/auth/csrf').expect(204);
  const csrf = cookieValue(getCookie(csrfRes, 'XSRF-TOKEN'));
  const loginRes = await agent.post('/api/auth/login').set('X-XSRF-TOKEN', csrf).send(SUPERADMIN).expect(200);
  return { agent, loginRes, csrf: cookieValue(getCookie(loginRes, 'XSRF-TOKEN')) };
};

describe('[SECURITY] Sesión solo con cookie y CSRF de doble cookie', () => {
  beforeAll(async() => {
    ENV_KEYS.forEach((key) => { originalEnv[key] = process.env[key]; });
    // Funciona aislado (bootstrap) y en la suite completa (ya existe → se ignora)
    await request(server.app)
      .post('/api/auth/registerSuperUser')
      .send({ name: 'Super Admin', role: 'superadmin', ...SUPERADMIN });
  });

  beforeEach(() => {
    // Modo de producción V2. supertest corre en http, así que la cookie no lleva Secure.
    process.env.AUTH_ALLOW_BEARER = 'false';
    process.env.CSRF_MODE = 'enforce';
    process.env.COOKIE_SAMESITE = 'lax';
    process.env.COOKIE_SECURE = 'false';
    delete process.env.COOKIE_DOMAIN;
  });

  afterAll(() => {
    ENV_KEYS.forEach((key) => {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    });
  });

  describe('GET /api/auth/csrf', () => {
    test('1. Entrega una cookie XSRF-TOKEN legible (sin HttpOnly)', async() => {
      const res = await request(server.app).get('/api/auth/csrf').expect(204);
      const cookie = getCookie(res, 'XSRF-TOKEN');
      expect(cookie).toBeDefined();
      expect(cookieValue(cookie)).toMatch(/^[a-f0-9]{64}$/);
      expect(cookie).not.toMatch(/HttpOnly/i);
      expect(cookie).toMatch(/SameSite=Lax/i);
      expect(cookie).toMatch(/Path=\//);
    });
  });

  describe('Login', () => {
    test('2. Sin token CSRF responde 403 CSRF_TOKEN_INVALID', async() => {
      const res = await request(server.app).post('/api/auth/login').send(SUPERADMIN).expect(403);
      expect(res.body.error).toBe('CSRF_TOKEN_INVALID');
    });

    test('3. Con header que no coincide con la cookie responde 403', async() => {
      const agent = request.agent(server.app);
      await agent.get('/api/auth/csrf').expect(204);
      const res = await agent.post('/api/auth/login').set('X-XSRF-TOKEN', 'otro-valor').send(SUPERADMIN).expect(403);
      expect(res.body.error).toBe('CSRF_TOKEN_INVALID');
    });

    test('4. Con CSRF válido inicia sesión, pone la cookie HttpOnly y NO devuelve el token', async() => {
      const { loginRes } = await browserLogin();
      const session = getCookie(loginRes, 'token');
      expect(session).toMatch(/HttpOnly/i);
      expect(session).toMatch(/SameSite=Lax/i);
      expect(session).toMatch(/Max-Age=7200/);
      expect(loginRes.body.sesion.token).toBeUndefined();
      expect(loginRes.body.sesion.expires_at).toBeDefined();
      expect(loginRes.body.sesion.user.password).toBeUndefined();
    });

    test('5. Rota el token CSRF al iniciar sesión', async() => {
      const agent = request.agent(server.app);
      const first = cookieValue(getCookie(await agent.get('/api/auth/csrf'), 'XSRF-TOKEN'));
      const loginRes = await agent.post('/api/auth/login').set('X-XSRF-TOKEN', first).send(SUPERADMIN).expect(200);
      const rotated = cookieValue(getCookie(loginRes, 'XSRF-TOKEN'));
      expect(rotated).toBeDefined();
      expect(rotated).not.toBe(first);
    });
  });

  describe('Peticiones autenticadas con cookie', () => {
    test('6. GET con la cookie funciona sin token CSRF', async() => {
      const { agent } = await browserLogin();
      await agent.get('/api/branches').expect(200);
    });

    test('7. POST sin header CSRF responde 403 aunque la sesión sea válida', async() => {
      const { agent } = await browserLogin();
      const res = await agent.post('/api/auth/refresh').expect(403);
      expect(res.body.error).toBe('CSRF_TOKEN_INVALID');
    });

    test('8. POST con header CSRF renueva la sesión sin devolver el token', async() => {
      const { agent, csrf } = await browserLogin();
      const res = await agent.post('/api/auth/refresh').set('X-XSRF-TOKEN', csrf).expect(200);
      expect(res.body.token).toBeUndefined();
      expect(res.body.expires_at).toBeDefined();
      expect(getCookie(res, 'token')).toMatch(/HttpOnly/i);
    });

    test('9. Logout borra la cookie de sesión y la de CSRF', async() => {
      const { agent, csrf } = await browserLogin();
      const res = await agent.post('/api/auth/logout').set('X-XSRF-TOKEN', csrf).expect(200);
      expect(getCookie(res, 'token')).toMatch(/Expires=Thu, 01 Jan 1970/);
      expect(getCookie(res, 'XSRF-TOKEN')).toMatch(/Expires=Thu, 01 Jan 1970/);
    });
  });

  describe('Authorization: Bearer', () => {
    test('10. Con AUTH_ALLOW_BEARER=false se ignora el header Bearer', async() => {
      process.env.AUTH_ALLOW_BEARER = 'true';
      process.env.CSRF_MODE = 'off';
      const { body } = await request(server.app).post('/api/auth/login').send(SUPERADMIN).expect(200);
      expect(body.sesion.token).toBeDefined();

      process.env.AUTH_ALLOW_BEARER = 'false';
      await request(server.app).get('/api/branches').auth(body.sesion.token, { type: 'bearer' }).expect(401);
    });

    test('11. Con AUTH_ALLOW_BEARER=true el Bearer funciona y no exige CSRF (tests, Swagger, scripts)', async() => {
      process.env.AUTH_ALLOW_BEARER = 'true';
      process.env.CSRF_MODE = 'off';
      const { body } = await request(server.app).post('/api/auth/login').send(SUPERADMIN).expect(200);

      process.env.CSRF_MODE = 'enforce';
      const res = await request(server.app).post('/api/auth/refresh').auth(body.sesion.token, { type: 'bearer' }).expect(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('Modos de CSRF', () => {
    test('12. CSRF_MODE=report deja pasar la petición (solo registra)', async() => {
      process.env.CSRF_MODE = 'report';
      await request(server.app).post('/api/auth/login').send(SUPERADMIN).expect(200);
    });

    test('13. SameSite=None siempre lleva Secure', async() => {
      process.env.COOKIE_SAMESITE = 'none';
      process.env.COOKIE_SECURE = 'false';
      const res = await request(server.app).get('/api/auth/csrf').expect(204);
      expect(getCookie(res, 'XSRF-TOKEN')).toMatch(/Secure/);
      expect(getCookie(res, 'XSRF-TOKEN')).toMatch(/SameSite=None/i);
    });

    test('14. COOKIE_DOMAIN se aplica a las cookies', async() => {
      process.env.COOKIE_DOMAIN = 'mega-estelaris.cloud';
      const res = await request(server.app).get('/api/auth/csrf').expect(204);
      expect(getCookie(res, 'XSRF-TOKEN')).toMatch(/Domain=mega-estelaris\.cloud/i);
    });
  });
});
