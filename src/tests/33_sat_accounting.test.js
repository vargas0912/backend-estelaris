const request = require('supertest');
const server = require('../../app');

const api = request(server.app);

const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

let Token = '';
let openPeriodId = null;
let closedPeriodId = null;

/**
 * Tests para SAT Accounting — /api/accounting/sat
 *
 * 1.  Login
 * 2.  Setup: crear período SAT 2025-08 y cerrarlo (prerequisito para vouchers)
 * 3.  POST /catalog/:period_id — período inexistente → 404
 * 4.  POST /catalog/:period_id — sin token → 401
 * 5.  POST /catalog/:period_id — período abierto → 200 (catálogo no requiere período cerrado)
 * 6.  Verificar que el XML retornado tiene Content-Type application/xml
 * 7.  Verificar que el XML contiene el nodo raíz Catalogo con atributos SAT
 * 8.  Verificar que el XML contiene cuentas (Ctas) con NumCta, Desc, CodAgrup, Nivel, Natur
 * 9.  Verificar que el RFC en el XML coincide con el de company_info
 * 10. POST /catalog/:period_id — período cerrado → 200
 * 11. POST /vouchers/:period_id — período inexistente → 404
 * 12. POST /vouchers/:period_id — sin token → 401
 * 13. POST /vouchers/:period_id — período abierto → 409 (debe estar cerrado)
 * 14. POST /vouchers/:period_id — período cerrado → 200
 * 15. Verificar que el XML de pólizas tiene Content-Type application/xml
 * 16. Verificar que el XML contiene nodo raíz Polizas con atributos SAT
 * 17. Verificar que el período quedó en status='bloqueado' tras generar pólizas
 * 18. POST /vouchers/:period_id — período bloqueado → 200 (puede regenerarse)
 */

describe('[SAT ACCOUNTING] Test api /api/accounting/sat', () => {
  beforeAll(async () => {
    // Login
    const loginRes = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);
    Token = loginRes.body.sesion.token;

    // Crear período abierto para catálogo
    const openRes = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'Agosto 2025 SAT', year: 2025, month: 8 })
      .expect(200);
    openPeriodId = openRes.body.period.id;

    // Crear y cerrar período para vouchers
    const closedRes = await api
      .post('/api/accounting/periods')
      .auth(Token, { type: 'bearer' })
      .send({ name: 'Julio 2025 SAT', year: 2025, month: 7 });
    // Puede fallar si ya existe, tomamos el id que devuelva
    if (closedRes.status === 200) {
      closedPeriodId = closedRes.body.period.id;
    } else {
      // Buscar el período existente
      const listRes = await api
        .get('/api/accounting/periods')
        .auth(Token, { type: 'bearer' });
      const found = listRes.body.periods.find(p => p.year === 2025 && p.month === 7);
      closedPeriodId = found?.id;
    }

    // Cerrar el período (si no está ya cerrado)
    if (closedPeriodId) {
      await api
        .put(`/api/accounting/periods/${closedPeriodId}/close`)
        .auth(Token, { type: 'bearer' });
    }
  });

  test('1. POST /catalog/99999 — período inexistente. Expect 404', async () => {
    await api
      .post('/api/accounting/sat/catalog/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('2. POST /catalog/:id — sin token. Expect 401', async () => {
    await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .expect(401);
  });

  test('3. POST /catalog/:id — período abierto. Expect 200 XML', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/xml/);
    expect(response.text).toBeTruthy();
  });

  test('4. XML catálogo contiene nodo raíz Catalogo con atributos SAT', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const xml = response.text;
    expect(xml).toContain('catalogocuentas:Catalogo');
    expect(xml).toContain('Version="1.3"');
    expect(xml).toContain('TipoSolicitud="AF"');
    expect(xml).toContain('http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/CatalogoCuentas');
  });

  test('5. XML catálogo contiene cuentas con atributos SAT correctos', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const xml = response.text;
    expect(xml).toContain('catalogocuentas:Ctas');
    expect(xml).toContain('NumCta=');
    expect(xml).toContain('Desc=');
    expect(xml).toContain('CodAgrup=');
    expect(xml).toContain('Nivel=');
    expect(xml).toContain('Natur=');
  });

  test('6. XML catálogo contiene RFC de la empresa', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.text).toContain('RFC="EST000000AAA"');
  });

  test('7. XML catálogo contiene Mes y Anio del período', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.text).toContain('Mes="08"');
    expect(response.text).toContain('Anio="2025"');
  });

  test('8. XML catálogo mapea correctamente la naturaleza (Natur D/A)', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const xml = response.text;
    // Activo es deudora → D
    expect(xml).toMatch(/NumCta="100"[^>]*Natur="D"/);
    // Pasivo es acreedora → A
    expect(xml).toMatch(/NumCta="200"[^>]*Natur="A"/);
  });

  test('9. POST /catalog/:id — período cerrado. Expect 200 XML', async () => {
    const response = await api
      .post(`/api/accounting/sat/catalog/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/xml/);
  });

  test('10. POST /vouchers/99999 — período inexistente. Expect 404', async () => {
    await api
      .post('/api/accounting/sat/vouchers/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('11. POST /vouchers/:id — sin token. Expect 401', async () => {
    await api
      .post(`/api/accounting/sat/vouchers/${closedPeriodId}`)
      .expect(401);
  });

  test('12. POST /vouchers/:id — período abierto. Expect 409', async () => {
    await api
      .post(`/api/accounting/sat/vouchers/${openPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(409);
  });

  test('13. POST /vouchers/:id — período cerrado. Expect 200 XML', async () => {
    const response = await api
      .post(`/api/accounting/sat/vouchers/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/xml/);
    expect(response.text).toBeTruthy();
  });

  test('14. XML pólizas contiene nodo raíz Polizas con atributos SAT', async () => {
    const response = await api
      .post(`/api/accounting/sat/vouchers/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    const xml = response.text;
    expect(xml).toContain('PLZ:Polizas');
    expect(xml).toContain('Version="1.3"');
    expect(xml).toContain('TipoSolicitud="AF"');
    expect(xml).toContain('http://www.sat.gob.mx/esquemas/ContabilidadE/1_3/PolizasPeriodo');
    expect(xml).toContain('RFC="EST000000AAA"');
  });

  test('15. XML pólizas contiene Mes y Anio del período', async () => {
    const response = await api
      .post(`/api/accounting/sat/vouchers/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.text).toContain('Mes="07"');
    expect(response.text).toContain('Anio="2025"');
  });

  test('16. Período queda bloqueado tras generar XML de pólizas', async () => {
    // Buscar el período por id
    const response = await api
      .get(`/api/accounting/periods/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body.period.status).toBe('bloqueado');
  });

  test('17. POST /vouchers/:id — período ya bloqueado puede regenerarse. Expect 200', async () => {
    const response = await api
      .post(`/api/accounting/sat/vouchers/${closedPeriodId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.headers['content-type']).toMatch(/application\/xml/);
  });
});
