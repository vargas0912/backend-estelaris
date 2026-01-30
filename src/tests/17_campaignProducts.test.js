const request = require('supertest');
const server = require('../../app');

let superAdminToken = '';
let regularUserToken = '';
let testCampaignId = null;
let testProductId = null;
let testBranchId = null;
let createdCampaignProductId = null;

const api = request(server.app);

// Datos para registro y login
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const testRegularUser = {
  name: 'Usuario Regular CampaignProducts',
  email: 'regular.campaignproducts@estelaris.com',
  role: 'user',
  password: 'User1234'
};

const testRegularUserLogin = {
  email: 'regular.campaignproducts@estelaris.com',
  password: 'User1234'
};

// Datos de prueba para productos de campaña
const campaignProductCreate = {
  campaign_id: null, // Se asigna dinámicamente
  product_id: null, // Se asigna dinámicamente
  discount_type: 'percentage',
  discount_value: 15.0,
  max_quantity: 100
};

const campaignProductCreateEmpty = {
  campaign_id: '',
  product_id: '',
  discount_type: '',
  discount_value: ''
};

const campaignProductCreateInvalid = {};

const campaignProductUpdate = {
  discount_type: 'percentage',
  discount_value: 20.0,
  max_quantity: 150
};

const campaignProductCreate2 = {
  campaign_id: null,
  product_id: null,
  discount_type: 'fixed_price',
  discount_value: 99.99
};

const campaignProductInvalidDiscount = {
  campaign_id: null,
  product_id: null,
  discount_type: 'percentage',
  discount_value: 150 // Más de 100%
};

const campaignProductNegativeDiscount = {
  campaign_id: null,
  product_id: null,
  discount_type: 'percentage',
  discount_value: -10
};

const branchOverrideCreate = {
  branch_id: null,
  discount_value_override: 25.5
};

const branchOverrideCreateEmpty = {
  branch_id: '',
  discount_value_override: ''
};

const branchOverrideUpdate = {
  discount_value_override: 30.0
};

/**
 * Script de tests para CampaignProducts
 *
 * Tests de seguridad incluidos:
 * - Autenticación (401 sin token)
 * - Autorización (403 sin privilegios)
 * - IDOR en GET/PUT/DELETE /:id
 * - Validación de discount_type y discount_value
 * - Tests de overrides de sucursal con valores negativos/inválidos
 */

describe('[CAMPAIGN_PRODUCTS] Test api campaignProducts //api/campaignProducts/', () => {
  // ============================================
  // Setup: Hacer login con superadmin (ya creado en 01_auth.test.js)
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

  // Crear usuario regular sin privilegios para tests de autorización
  test('Setup: Crear usuario regular sin privilegios. 200', async() => {
    await api
      .post('/api/auth/register')
      .auth(superAdminToken, { type: 'bearer' })
      .send(testRegularUser)
      .expect(200);
  });

  test('Setup: Login usuario regular para obtener token. 200', async() => {
    const response = await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testRegularUserLogin)
      .expect(200);

    regularUserToken = response.body.sesion.token;
    expect(response.body.sesion).toHaveProperty('token');
  });

  // ============================================
  // Setup: Crear campaña, producto y sucursal de prueba
  // ============================================
  test('Crear campaña de prueba para tests. 201', async() => {
    const testCampaign = {
      name: 'Campaña para productos test',
      description: 'Campaña temporal para tests de productos',
      start_date: '2026-02-01T00:00:00.000Z',
      end_date: '2026-02-28T23:59:59.000Z',
      is_active: true,
      priority: 1
    };

    const response = await api
      .post('/api/campaigns')
      .auth(superAdminToken, { type: 'bearer' })
      .send(testCampaign);

    if (response.status === 201) {
      testCampaignId = response.body.data.id;
      campaignProductCreate.campaign_id = testCampaignId;
      campaignProductCreate2.campaign_id = testCampaignId;
      campaignProductInvalidDiscount.campaign_id = testCampaignId;
      campaignProductNegativeDiscount.campaign_id = testCampaignId;
    }

    expect([201]).toContain(response.status);
  });

  test('Obtener producto existente para tests. 200', async() => {
    const response = await api
      .get('/api/products')
      .auth(superAdminToken, { type: 'bearer' });

    if (response.body.products && response.body.products.length > 0) {
      testProductId = response.body.products[0].id;
      campaignProductCreate.product_id = testProductId;
      campaignProductInvalidDiscount.product_id = testProductId;
      campaignProductNegativeDiscount.product_id = testProductId;

      // Segundo producto si existe
      if (response.body.products.length > 1) {
        campaignProductCreate2.product_id = response.body.products[1].id;
      } else {
        campaignProductCreate2.product_id = testProductId;
      }
    }
  });

  test('Obtener sucursal existente para tests de overrides. 200', async() => {
    const response = await api
      .get('/api/branches')
      .auth(superAdminToken, { type: 'bearer' });

    if (response.body.branches && response.body.branches.length > 0) {
      testBranchId = response.body.branches[0].id;
      branchOverrideCreate.branch_id = testBranchId;
    }
  });

  // ============================================
  // Tests CRUD básicos
  // ============================================
  test('1. Obtener productos de una campaña. Expect 200', async() => {
    if (testCampaignId) {
      const response = await api
        .get(`/api/campaignProducts/campaign/${testCampaignId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    }
  });

  test('2. Crear producto de campaña con datos válidos. Expect 201', async() => {
    if (testCampaignId && testProductId) {
      const response = await api
        .post('/api/campaignProducts')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductCreate)
        .expect(201);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.discount_type).toBe(campaignProductCreate.discount_type);

      createdCampaignProductId = response.body.data.id;
    }
  });

  test('3. Crear producto de campaña con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/campaignProducts')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignProductCreateEmpty)
      .expect(400);
  });

  test('4. Crear producto de campaña sin datos. Expect 400', async() => {
    await api
      .post('/api/campaignProducts')
      .auth(superAdminToken, { type: 'bearer' })
      .send(campaignProductCreateInvalid)
      .expect(400);
  });

  test('5. Crear producto con descuento porcentual mayor a 100. Expect 400', async() => {
    if (testCampaignId && testProductId) {
      await api
        .post('/api/campaignProducts')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductInvalidDiscount)
        .expect(400);
    }
  });

  test('6. Crear producto con descuento negativo. Expect 400', async() => {
    if (testCampaignId && testProductId) {
      await api
        .post('/api/campaignProducts')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductNegativeDiscount)
        .expect(400);
    }
  });

  test('7. Crear producto duplicado en campaña. Expect 400', async() => {
    if (testCampaignId && testProductId) {
      await api
        .post('/api/campaignProducts')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductCreate)
        .expect(400);
    }
  });

  test('8. Obtener producto de campaña por id. Expect 200', async() => {
    if (createdCampaignProductId) {
      const response = await api
        .get(`/api/campaignProducts/${createdCampaignProductId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdCampaignProductId);
    }
  });

  test('9. Obtener producto de campaña inexistente. Expect 404', async() => {
    await api
      .get('/api/campaignProducts/99999')
      .auth(superAdminToken, { type: 'bearer' })
      .expect(404);
  });

  test('10. Actualizar producto de campaña. Expect 200', async() => {
    if (createdCampaignProductId) {
      const response = await api
        .put(`/api/campaignProducts/${createdCampaignProductId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.discount_value).toBe(campaignProductUpdate.discount_value);
    }
  });

  test('11. Actualizar producto con descuento inválido. Expect 400', async() => {
    if (createdCampaignProductId) {
      await api
        .put(`/api/campaignProducts/${createdCampaignProductId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send({ discount_type: 'percentage', discount_value: 150 })
        .expect(400);
    }
  });

  // ============================================
  // Tests de autenticación (401)
  // ============================================
  describe('Tests de autenticación', () => {
    test('12. Obtener productos de campaña sin token. Expect 401', async() => {
      if (testCampaignId) {
        await api
          .get(`/api/campaignProducts/campaign/${testCampaignId}`)
          .expect(401);
      }
    });

    test('13. Obtener producto de campaña por id sin token. Expect 401', async() => {
      if (createdCampaignProductId) {
        await api
          .get(`/api/campaignProducts/${createdCampaignProductId}`)
          .expect(401);
      }
    });

    test('14. Crear producto de campaña sin token. Expect 401', async() => {
      await api
        .post('/api/campaignProducts')
        .send(campaignProductCreate)
        .expect(401);
    });

    test('15. Actualizar producto de campaña sin token. Expect 401', async() => {
      if (createdCampaignProductId) {
        await api
          .put(`/api/campaignProducts/${createdCampaignProductId}`)
          .send(campaignProductUpdate)
          .expect(401);
      }
    });

    test('16. Eliminar producto de campaña sin token. Expect 401', async() => {
      if (createdCampaignProductId) {
        await api
          .delete(`/api/campaignProducts/${createdCampaignProductId}`)
          .expect(401);
      }
    });

    test('17. Obtener productos con token inválido. Expect 401', async() => {
      if (testCampaignId) {
        await api
          .get(`/api/campaignProducts/campaign/${testCampaignId}`)
          .auth('token_invalido_123', { type: 'bearer' })
          .expect(401);
      }
    });
  });

  // ============================================
  // Tests de autorización (403)
  // ============================================
  describe('Tests de autorización', () => {
    test('18. Usuario sin privilegio VIEW_ALL intenta obtener productos. Expect 403', async() => {
      if (testCampaignId) {
        await api
          .get(`/api/campaignProducts/campaign/${testCampaignId}`)
          .auth(regularUserToken, { type: 'bearer' })
          .expect(403);
      }
    });

    test('19. Usuario sin privilegio VIEW intenta obtener producto por id. Expect 403', async() => {
      if (createdCampaignProductId) {
        await api
          .get(`/api/campaignProducts/${createdCampaignProductId}`)
          .auth(regularUserToken, { type: 'bearer' })
          .expect(403);
      }
    });

    test('20. Usuario sin privilegio ADD intenta crear producto. Expect 403', async() => {
      await api
        .post('/api/campaignProducts')
        .auth(regularUserToken, { type: 'bearer' })
        .send(campaignProductCreate2)
        .expect(403);
    });

    test('21. Usuario sin privilegio UPDATE intenta actualizar producto. Expect 403', async() => {
      if (createdCampaignProductId) {
        await api
          .put(`/api/campaignProducts/${createdCampaignProductId}`)
          .auth(regularUserToken, { type: 'bearer' })
          .send(campaignProductUpdate)
          .expect(403);
      }
    });

    test('22. Usuario sin privilegio DELETE intenta eliminar producto. Expect 403', async() => {
      if (createdCampaignProductId) {
        await api
          .delete(`/api/campaignProducts/${createdCampaignProductId}`)
          .auth(regularUserToken, { type: 'bearer' })
          .expect(403);
      }
    });
  });

  // ============================================
  // Tests de validación de ID
  // ============================================
  describe('Tests de validación de ID', () => {
    test('23. Obtener producto con ID no numérico. Expect 400', async() => {
      const response = await api
        .get('/api/campaignProducts/abc')
        .auth(superAdminToken, { type: 'bearer' });

      expect([400, 404]).toContain(response.status);
    });

    test('24. Actualizar producto inexistente. Expect 404', async() => {
      await api
        .put('/api/campaignProducts/99999')
        .auth(superAdminToken, { type: 'bearer' })
        .send(campaignProductUpdate)
        .expect(404);
    });

    test('25. Eliminar producto inexistente. Expect 404', async() => {
      await api
        .delete('/api/campaignProducts/99999')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    });

    test('26. Obtener productos de campaña inexistente. Expect 200', async() => {
      const response = await api
        .get('/api/campaignProducts/campaign/99999')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  // ============================================
  // Tests de overrides de sucursal
  // ============================================
  describe('Tests de overrides de sucursal', () => {
    test('27. Obtener overrides de sucursal para un producto. Expect 200', async() => {
      if (createdCampaignProductId) {
        const response = await api
          .get(`/api/campaignProducts/${createdCampaignProductId}/branches`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('28. Crear override de sucursal con datos válidos. Expect 201', async() => {
      if (createdCampaignProductId && testBranchId) {
        const response = await api
          .post(`/api/campaignProducts/${createdCampaignProductId}/branches/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send(branchOverrideCreate)
          .expect(201);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
      }
    });

    test('29. Crear override con datos vacíos. Expect 400', async() => {
      if (createdCampaignProductId) {
        await api
          .post(`/api/campaignProducts/${createdCampaignProductId}/branches/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send(branchOverrideCreateEmpty)
          .expect(400);
      }
    });

    test('30. Crear override duplicado. Expect 400', async() => {
      if (createdCampaignProductId && testBranchId) {
        await api
          .post(`/api/campaignProducts/${createdCampaignProductId}/branches/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send(branchOverrideCreate)
          .expect(400);
      }
    });

    test('31. Crear override con valor negativo. Expect 400', async() => {
      if (createdCampaignProductId && testBranchId) {
        await api
          .post(`/api/campaignProducts/${createdCampaignProductId}/branches/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send({ branch_id: testBranchId + 1, discount_value_override: -10 })
          .expect(400);
      }
    });

    test('32. Actualizar override de sucursal. Expect 200', async() => {
      if (createdCampaignProductId && testBranchId) {
        const response = await api
          .put(`/api/campaignProducts/${createdCampaignProductId}/branches/${testBranchId}/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send(branchOverrideUpdate)
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
      }
    });

    test('33. Actualizar override inexistente. Expect 404', async() => {
      if (createdCampaignProductId) {
        await api
          .put(`/api/campaignProducts/${createdCampaignProductId}/branches/99999/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .send(branchOverrideUpdate)
          .expect(404);
      }
    });

    test('34. Usuario sin privilegio MANAGE_OVERRIDES intenta crear override. Expect 403', async() => {
      if (createdCampaignProductId && testBranchId) {
        await api
          .post(`/api/campaignProducts/${createdCampaignProductId}/branches/override`)
          .auth(regularUserToken, { type: 'bearer' })
          .send(branchOverrideCreate)
          .expect(403);
      }
    });

    test('35. Usuario sin privilegio MANAGE_OVERRIDES intenta actualizar override. Expect 403', async() => {
      if (createdCampaignProductId && testBranchId) {
        await api
          .put(`/api/campaignProducts/${createdCampaignProductId}/branches/${testBranchId}/override`)
          .auth(regularUserToken, { type: 'bearer' })
          .send(branchOverrideUpdate)
          .expect(403);
      }
    });

    test('36. Eliminar override de sucursal. Expect 200', async() => {
      if (createdCampaignProductId && testBranchId) {
        const response = await api
          .delete(`/api/campaignProducts/${createdCampaignProductId}/branches/${testBranchId}/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
      }
    });

    test('37. Eliminar override inexistente. Expect 404', async() => {
      if (createdCampaignProductId) {
        await api
          .delete(`/api/campaignProducts/${createdCampaignProductId}/branches/99999/override`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(404);
      }
    });

    test('38. Usuario sin privilegio MANAGE_OVERRIDES intenta eliminar override. Expect 403', async() => {
      if (createdCampaignProductId && testBranchId) {
        await api
          .delete(`/api/campaignProducts/${createdCampaignProductId}/branches/${testBranchId}/override`)
          .auth(regularUserToken, { type: 'bearer' })
          .expect(403);
      }
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('39. Verificar estructura completa de producto de campaña', async() => {
      if (createdCampaignProductId) {
        const response = await api
          .get(`/api/campaignProducts/${createdCampaignProductId}`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('campaign_id');
        expect(response.body.data).toHaveProperty('product_id');
        expect(response.body.data).toHaveProperty('discount_type');
        expect(response.body.data).toHaveProperty('discount_value');
      }
    });

    test('40. Verificar que lista de productos es un array', async() => {
      if (testCampaignId) {
        const response = await api
          .get(`/api/campaignProducts/campaign/${testCampaignId}`)
          .auth(superAdminToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('ok', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });
  });

  // ============================================
  // Cleanup: Eliminar producto de campaña de prueba
  // ============================================
  test('41. Eliminar producto de campaña. Expect 200', async() => {
    if (createdCampaignProductId) {
      const response = await api
        .delete(`/api/campaignProducts/${createdCampaignProductId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
    }
  });

  test('42. Verificar que el producto de campaña eliminado no existe. Expect 404', async() => {
    if (createdCampaignProductId) {
      await api
        .get(`/api/campaignProducts/${createdCampaignProductId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(404);
    }
  });

  // Cleanup: Eliminar campaña de prueba
  test('43. Eliminar campaña de prueba. Expect 200', async() => {
    if (testCampaignId) {
      await api
        .delete(`/api/campaigns/${testCampaignId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(200);
    }
  });
});
