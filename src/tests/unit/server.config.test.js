const request = require('supertest');
const Server = require('../../server');

/**
 * Configuración del servidor para despliegue detrás de un proxy inverso:
 * - TRUST_PROXY: saltos de proxy de confianza (req.ip = IP real del cliente)
 * - RATE_LIMIT_GLOBAL_MAX: límite global de requests por IP cada 15 minutos
 */
describe('Configuración del servidor (proxy y rate limit)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('sin TRUST_PROXY no confía en X-Forwarded-For', () => {
    delete process.env.TRUST_PROXY;
    const server = new Server();
    expect(server.app.get('trust proxy')).toBeFalsy();
  });

  test('TRUST_PROXY numérico se aplica como número de saltos', () => {
    process.env.TRUST_PROXY = '1';
    const server = new Server();
    expect(server.app.get('trust proxy')).toBe(1);
  });

  test('TRUST_PROXY no numérico se pasa tal cual a Express', () => {
    process.env.TRUST_PROXY = 'loopback';
    const server = new Server();
    expect(server.app.get('trust proxy')).toBe('loopback');
  });

  test('RATE_LIMIT_GLOBAL_MAX define el límite global por IP', async() => {
    delete process.env.DISABLE_RATE_LIMIT;
    process.env.RATE_LIMIT_GLOBAL_MAX = '2';
    const api = request(new Server().app);

    await api.get('/health').expect(200);
    await api.get('/health').expect(200);
    const res = await api.get('/health');

    expect(res.status).toBe(429);
    expect(res.headers['ratelimit-limit']).toBe('2');
  });

  test('con TRUST_PROXY=1 el límite se cuenta por la IP real del cliente', async() => {
    delete process.env.DISABLE_RATE_LIMIT;
    process.env.TRUST_PROXY = '1';
    process.env.RATE_LIMIT_GLOBAL_MAX = '1';
    const api = request(new Server().app);

    // Dos clientes distintos detrás del mismo proxy no comparten el límite
    await api.get('/health').set('X-Forwarded-For', '203.0.113.10').expect(200);
    await api.get('/health').set('X-Forwarded-For', '203.0.113.20').expect(200);
    // El mismo cliente sí lo agota
    await api.get('/health').set('X-Forwarded-For', '203.0.113.10').expect(429);
  });
});
