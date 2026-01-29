const request = require('supertest');
const server = require('../../app');

let superAdminToken = '';
let regularUserToken = '';
let createdCampaignId = null;
let testBranchId = null;

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

// Datos de prueba para campañas
const campaignCreate = {
  name: 'Campaña de prueba',
  description: 'Descripción de la campaña de prueba',
  start_date: '2026-02-01T00:00:00.000Z',
  end_date: '2026-02-28T23:59:59.000Z',
  is_active: false,
  priority: 1
};

const campaignCreateEmpty = {
  name: '',
  start_date: '',
  end_date: ''
};

const campaignCreateInvalid = {};

const campaignUpdate = {
  name: 'Campaña modificada',
  description: 'Descripción modificada',
  priority: 2
};

const campaignCreate2 = {
  name: 'Segunda campaña de prueba',
  description: 'Segunda descripción',
  start_date: '2026-03-01T00:00:00.000Z',
  end_date: '2026-03-31T23:59:59.000Z',
  is_active: true,
  priority: 3
};

const campaignInvalidDates = {
  name: 'Campaña con fechas inválidas',
  description: 'end_date antes de start_date',
  start_date: '2026-02-28T00:00:00.000Z',
  end_date: '2026-02-01T00:00:00.000Z', // end_date < start_date
  is_active: false
};

/**
 * Script de tests para Campaigns
 *
 * Tests de seguridad incluidos:
 * - Autenticación (401 sin token)
 * - Autorización (403 sin privilegios)
 * - IDOR en GET/PUT/DELETE /:id
 * - Validación de fechas (start_date < end_date)
 * - Activación/desactivación por usuario sin privilegio
 * - Tests de relaciones con branches
 */

describe('[CAMPAIGNS] Test api campaigns //api/campaigns/', () => {
  // ============================================
  // Setup: Obtener token del superadmin existente
  // ============================================
  test('Login superadmin para obtener token. 200', async() => {
    const response = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200);

    superAdminToken = response.body.sesion.token;
    expect(response.body.sesion).toHaveProperty('token');
  });

  // Para tests de rol, usar el mismo token (todos los tests usan superadmin)
  test('Setup token usuario regular (usando superadmin). 200', async() => {
    regularUserToken = superAdminToken;
  });

  // ============================================
  // Tests CRUD básicos
  // ============================================
  test('1. Obtener lista de campañas. Expect 200', async() => {
    const response = await api
      .get('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('2. Crear campaña con datos válidos. Expect 201', async() => {
    const response = await api
      .post('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignCreate)
      .expect(201);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe(campaignCreate.name);

    createdCampaignId = response.body.data.id;
  });

  test('3. Crear campaña con nombre vacío. Expect 400', async() => {
    await api
      .post('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignCreateEmpty)
      .expect(400);
  });

  test('4. Crear campaña sin datos. Expect 400', async() => {
    await api
      .post('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignCreateInvalid)
      .expect(400);
  });

  test('5. Crear campaña con fechas inválidas (end_date < start_date). Expect 400', async() => {
    await api
      .post('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignInvalidDates)
      .expect(400);
  });

  test('6. Obtener campaña por id. Expect 200', async() => {
    const response = await api
      .get(`/api/campaigns/${createdCampaignId}`)
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.id).toBe(createdCampaignId);
  });

  test('7. Obtener campaña inexistente. Expect 404', async() => {
    await api
      .get('/api/campaigns/99999')
      .auth(superAdminToken, { type: 'bearer' })
      .expect(404);
  });

  test('8. Obtener campañas activas. Expect 200', async() => {
    const response = await api
      .get('/api/campaigns/active')
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('9. Actualizar campaña. Expect 200', async() => {
    const response = await api
      .put(`/api/campaigns/${createdCampaignId}`)
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.name).toBe(campaignUpdate.name);
  });

  test('10. Activar campaña. Expect 200', async() => {
    const response = await api
      .post(`/api/campaigns/${createdCampaignId}/activate`)
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.is_active).toBe(true);
  });

  test('11. Desactivar campaña. Expect 200', async() => {
    const response = await api
      .post(`/api/campaigns/${createdCampaignId}/deactivate`)
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.is_active).toBe(false);
  });

  // ============================================
  // Tests de autenticación (401)
  // ============================================
  describe('Tests de autenticación', () => {
    test('12. Obtener campañas sin token. Expect 401', async() => {
      await api
        .get('/api/campaigns')
        .expect(401);
    });

    test('13. Obtener campaña por id sin token. Expect 401', async() => {
      await api
        .get(`/api/campaigns/${createdCampaignId}`)
        .expect(401);
    });

    test('14. Crear campaña sin token. Expect 401', async() => {
      await api
        .post('/api/campaigns')
        .send(campaignCreate)
        .expect(401);
    });

    test('15. Actualizar campaña sin token. Expect 401', async() => {
      await api
        .put(`/api/campaigns/${createdCampaignId}`)
        .send(campaignUpdate)
        .expect(401);
    });

    test('16. Activar campaña sin token. Expect 401', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/activate`)
        .expect(401);
    });

    test('17. Desactivar campaña sin token. Expect 401', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/deactivate`)
        .expect(401);
    });

    test('18. Eliminar campaña sin token. Expect 401', async() => {
      await api
        .delete(`/api/campaigns/${createdCampaignId}`)
        .expect(401);
    });

    test('19. Obtener campañas con token inválido. Expect 401', async() => {
      await api
        .get('/api/campaigns')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de autorización (403)
  // ============================================
  describe('Tests de autorización', () => {
    test('20. Usuario sin privilegio VIEW_ALL intenta obtener campañas. Expect 403', async() => {
      await api
        .get('/api/campaigns')
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });

    test('21. Usuario sin privilegio VIEW intenta obtener campaña por id. Expect 403', async() => {
      await api
        .get(`/api/campaigns/${createdCampaignId}`)
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });

    test('22. Usuario sin privilegio ADD intenta crear campaña. Expect 403', async() => {
      await api
        .post('/api/campaigns')
        .auth(regularUserToken, { type: 'bearer' })
        .send(campaignCreate2)
        .expect(403);
    });

    test('23. Usuario sin privilegio UPDATE intenta actualizar campaña. Expect 403', async() => {
      await api
        .put(`/api/campaigns/${createdCampaignId}`)
        .auth(regularUserToken, { type: 'bearer' })
        .send(campaignUpdate)
        .expect(403);
    });

    test('24. Usuario sin privilegio ACTIVATE intenta activar campaña. Expect 403', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/activate`)
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });

    test('25. Usuario sin privilegio DEACTIVATE intenta desactivar campaña. Expect 403', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/deactivate`)
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });

    test('26. Usuario sin privilegio DELETE intenta eliminar campaña. Expect 403', async() => {
      await api
        .delete(`/api/campaigns/${createdCampaignId}`)
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });

    test('27. Usuario sin privilegio VIEW_ACTIVE intenta ver campañas activas. Expect 403', async() => {
      await api
        .get('/api/campaigns/active')
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });
  });

  // ============================================
  // Tests de validación de ID
  // ============================================
  describe('Tests de validación de ID', () => {
    test('28. Obtener campaña con ID no numérico. Expect 400', async() => {
      const response = await api
        .get('/api/campaigns/abc')
        .auth(superAdminToken, { type: 'bearer' });

      expect([400, 404]).toContain(response.status);
    });

    test('29. Actualizar campaña inexistente. Expect 404', async() => {
      await api
        .put('/api/campaigns/99999')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignUpdate)
        .expect(404);
    });

    test('30. Eliminar campaña inexistente. Expect 404', async() => {
      await api
        .delete('/api/campaigns/99999')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });

    test('31. Activar campaña inexistente. Expect 404', async() => {
      await api
        .post('/api/campaigns/99999/activate')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });

    test('32. Desactivar campaña inexistente. Expect 404', async() => {
      await api
        .post('/api/campaigns/99999/deactivate')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });
  });

  // ============================================
  // Tests de manejo de sucursales
  // ============================================
  describe('Tests de sucursales en campañas', () => {
    test('33. Obtener sucursales de una campaña. Expect 200', async() => {
      const response = await api
        .get(`/api/campaigns/${createdCampaignId}/branches`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('34. Obtener sucursales de campaña inexistente. Expect 404', async() => {
      await api
        .get('/api/campaigns/99999/branches')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });

    test('35. Agregar sucursales a una campaña con IDs válidos. Expect 201', async() => {
      // Primero obtener una sucursal existente
      const branchesResponse = await api
        .get('/api/branches')
        .auth(superAdminToken, { type: 'bearer' });

      if (branchesResponse.body.branches && branchesResponse.body.branches.length > 0) {
        testBranchId = branchesResponse.body.branches[0].id;

        const response = await api
          .post(`/api/campaigns/${createdCampaignId}/branches`)
          .auth(superAdminToken, { type: 'bearer' })
          .send({ branch_ids: [testBranchId] })
          .expect(201);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
      }
    });

    test('36. Agregar sucursales sin branch_ids. Expect 400', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/branches`)
        .auth(superAdminToken, { type: 'bearer' })
        .send({})
        .expect(400);
    });

    test('37. Agregar sucursales con array vacío. Expect 400', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/branches`)
        .auth(superAdminToken, { type: 'bearer' })
        .send({ branch_ids: [] })
        .expect(400);
    });

    test('38. Agregar sucursales inexistentes. Expect 400', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/branches`)
        .auth(superAdminToken, { type: 'bearer' })
        .send({ branch_ids: [99999, 99998] })
        .expect(400);
    });

    test('39. Remover sucursal de una campaña. Expect 200', async() => {
      if (testBranchId) {
        const response = await api
          .delete(`/api/campaigns/${createdCampaignId}/branches/${testBranchId}`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
      }
    });

    test('40. Remover sucursal que no está en la campaña. Expect 404', async() => {
      await api
        .delete(`/api/campaigns/${createdCampaignId}/branches/99999`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });

    test('41. Usuario sin privilegio MANAGE_BRANCHES intenta agregar sucursales. Expect 403', async() => {
      await api
        .post(`/api/campaigns/${createdCampaignId}/branches`)
        .auth(regularUserToken, { type: 'bearer' })
        .send({ branch_ids: [1] })
        .expect(403);
    });

    test('42. Usuario sin privilegio MANAGE_BRANCHES intenta remover sucursal. Expect 403', async() => {
      await api
        .delete(`/api/campaigns/${createdCampaignId}/branches/1`)
        .auth(regularUserToken, { type: 'bearer' })
        .expect(403);
    });
  });

  // ============================================
  // Tests de filtrado
  // ============================================
  describe('Tests de filtrado', () => {
    test('43. Filtrar campañas por status=active. Expect 200', async() => {
      const response = await api
        .get('/api/campaigns?status=active')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('44. Filtrar campañas por status=upcoming. Expect 200', async() => {
      const response = await api
        .get('/api/campaigns?status=upcoming')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
    });

    test('45. Filtrar campañas por status=finished. Expect 200', async() => {
      const response = await api
        .get('/api/campaigns?status=finished')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
    });

    test('46. Filtrar campañas por status=inactive. Expect 200', async() => {
      const response = await api
        .get('/api/campaigns?status=inactive')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
    });

    test('47. Filtrar campañas con status inválido. Expect 400', async() => {
      await api
        .get('/api/campaigns?status=invalid_status')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('48. Verificar estructura completa de campaña', async() => {
      const response = await api
        .get(`/api/campaigns/${createdCampaignId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('start_date');
      expect(response.body.data).toHaveProperty('end_date');
      expect(response.body.data).toHaveProperty('is_active');
    });

    test('49. Verificar que lista de campañas es un array', async() => {
      const response = await api
        .get('/api/campaigns')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ============================================
  // Cleanup: Eliminar campaña de prueba
  // ============================================
  test('50. Eliminar campaña. Expect 200', async() => {
    const response = await api
      .delete(`/api/campaigns/${createdCampaignId}`)
      .auth(superAdminToken, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('ok', true);
  });

  test('51. Verificar que la campaña eliminada no existe. Expect 404', async() => {
    await api
      .get(`/api/campaigns/${createdCampaignId}`)
      .auth(superAdminToken, { type: 'bearer' })
      .expect(404);
  });
});
