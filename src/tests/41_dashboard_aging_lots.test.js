const request = require('supertest');
const server = require('../../app');

let Token = '';
const api = request(server.app);

const dashboardTestUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

describe('[DASHBOARD - AGING LOTS] Test api //api/dashboard/aging-lots', () => {
  beforeAll(async () => {
    let response = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(dashboardTestUser);

    if (response.status !== 200) {
      response = await api
        .post('/api/auth/registerSuperUser')
        .send({
          name: 'Super admin',
          email: 'superadmin@estelaris.com',
          role: 'superadmin',
          password: 'Admin123'
        });
    }

    const loginResponse = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(dashboardTestUser);

    Token = loginResponse.body.sesion.token;
  });

  test('1. Requiere autenticacion. Expect 401', async() => {
    await api.get('/api/dashboard/aging-lots').expect(401);
  });

  test('2. Retorna rangos por defecto y detalle. Expect 200', async() => {
    const response = await api
      .get('/api/dashboard/aging-lots')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const { agingLots } = response.body;
    expect(agingLots.buckets.map(b => b.label)).toEqual(['0-30', '31-60', '61-90', '91+']);
    expect(Array.isArray(agingLots.lots)).toBe(true);
    agingLots.buckets.forEach((b) => {
      expect(b).toHaveProperty('lots');
      expect(b).toHaveProperty('quantity');
      expect(b).toHaveProperty('stock_value');
    });
  });

  test('3. Acepta rangos personalizados, min_days, limit y branch_id. Expect 200', async() => {
    const response = await api
      .get('/api/dashboard/aging-lots?buckets=15,45&min_days=0&limit=5&branch_id=1')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const { agingLots } = response.body;
    expect(agingLots.buckets.map(b => b.label)).toEqual(['0-15', '16-45', '46+']);
    expect(agingLots.lots.length).toBeLessThanOrEqual(5);
  });

  test('4. Cada lote del detalle expone las metricas esperadas', async() => {
    const response = await api
      .get('/api/dashboard/aging-lots?min_days=0')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    response.body.agingLots.lots.forEach((lot) => {
      [
        'branch_id', 'branch_name', 'product_id', 'product_name', 'purch_id', 'bar_code',
        'quantity', 'received_date', 'days_in_stock', 'unit_cost', 'stock_value',
        'units_sold', 'sell_through_pct', 'last_sale_date', 'days_since_last_sale'
      ].forEach(prop => expect(lot).toHaveProperty(prop));
    });
  });

  test.each([
    'buckets=90,60',
    'buckets=30,30',
    'buckets=0,30',
    'buckets=a,b',
    'buckets=1,2,3,4,5,6,7',
    'min_days=-1',
    'limit=0',
    'limit=201',
    'branch_id=0'
  ])('5. Parametro invalido (%s). Expect 400', async(qs) => {
    await api
      .get(`/api/dashboard/aging-lots?${qs}`)
      .auth(Token, { type: 'bearer' })
      .expect(400);
  });
});
