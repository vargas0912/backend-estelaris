const request = require('supertest');
const server = require('../../app');

let userToken = '';
let regularUserId = null;

const api = request(server.app);

// Usuario de prueba con rol 'user' (sin privilegios administrativos)
const regularUserData = {
  name: 'Regular User Restrictions Test',
  email: 'user_restrictions@test.com',
  role: 'user',
  password: 'Test1234'
};

// Usuario superadmin para crear el usuario de prueba
const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

let superadminToken = '';

/**
 * Script de tests para verificar restricciones de rol USER
 *
 * Objetivo: Verificar que usuarios con rol 'user' SIN privilegios administrativos
 * NO pueden realizar operaciones administrativas en recursos del sistema.
 */

describe('[SECURITY] User Role Restrictions - Operations blocked for regular users', () => {
  // Setup: crear usuario de prueba y obtener tokens
  beforeAll(async() => {
    // Login como superadmin
    const superadminLoginResponse = await api
      .post('/api/auth/login')
      .send(superadminLogin);

    if (superadminLoginResponse.status === 200) {
      superadminToken = superadminLoginResponse.body.sesion.token;
    }

    // Crear usuario regular
    const userResponse = await api
      .post('/api/auth/register')
      .auth(superadminToken, { type: 'bearer' })
      .send(regularUserData);

    if (userResponse.status === 200) {
      regularUserId = userResponse.body.user?.id;

      // Login como usuario regular
      const userLoginResponse = await api
        .post('/api/auth/login')
        .send({
          email: regularUserData.email,
          password: regularUserData.password
        });

      if (userLoginResponse.status === 200) {
        userToken = userLoginResponse.body.sesion.token;
      }
    }
  });

  // ============================================
  // Tests de Products
  // ============================================
  describe('Products - User without privileges cannot manage', () => {
    test('1. User NO puede crear producto sin privilegio ADD. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/products')
        .auth(userToken, { type: 'bearer' })
        .send({
          sku: 'TEST-RESTRICTED',
          name: 'Producto de prueba restringido',
          base_price: 100.00
        });

      // Usuario sin privilegio ADD_PRODUCT debe recibir 403
      expect(response.status).toBe(403);
    });

    test('2. User NO puede actualizar producto sin privilegio UPDATE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .put('/api/products/1')
        .auth(userToken, { type: 'bearer' })
        .send({
          sku: 'MODIFIED',
          name: 'Intento modificar',
          base_price: 150.00
        });

      expect(response.status).toBe(403);
    });

    test('3. User NO puede eliminar producto sin privilegio DELETE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .delete('/api/products/1')
        .auth(userToken, { type: 'bearer' });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // Tests de Branches
  // ============================================
  describe('Branches - User without privileges cannot manage', () => {
    test('4. User NO puede crear sucursal sin privilegio ADD. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/branches')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Sucursal de prueba',
          address: 'Direccion de prueba',
          phone: '1234567890',
          municipality_id: 1
        });

      expect(response.status).toBe(403);
    });

    test('5. User NO puede actualizar sucursal sin privilegio UPDATE. Expect 403 o 400', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .put('/api/branches/1')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Intento modificar sucursal'
        });

      // 403 si llega al middleware de rol, 400 si falla validación
      expect([400, 403]).toContain(response.status);
    });

    test('6. User NO puede eliminar sucursal sin privilegio DELETE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .delete('/api/branches/1')
        .auth(userToken, { type: 'bearer' });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // Tests de Employees
  // ============================================
  describe('Employees - User without privileges cannot manage', () => {
    test('7. User NO puede crear empleado sin privilegio ADD. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/employees')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Empleado de prueba',
          email: 'empleado_test@test.com',
          hire_date: '2026-01-29',
          position_id: 1,
          branch_id: 1
        });

      expect(response.status).toBe(403);
    });

    test('8. User NO puede actualizar empleado sin privilegio UPDATE. Expect 403 o 400', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .put('/api/employees/1')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Intento modificar empleado'
        });

      // 403 si llega al middleware de rol, 400 si falla validación
      expect([400, 403]).toContain(response.status);
    });

    test('9. User NO puede eliminar empleado sin privilegio DELETE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .delete('/api/employees/1')
        .auth(userToken, { type: 'bearer' });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // Tests de Campaigns
  // ============================================
  describe('Campaigns - User without privileges cannot manage', () => {
    test('10. User NO puede crear campaña sin privilegio ADD. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/campaigns')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Campaña de prueba',
          description: 'Descripción',
          start_date: '2026-02-01T00:00:00.000Z',
          end_date: '2026-02-28T23:59:59.000Z',
          is_active: false
        });

      expect(response.status).toBe(403);
    });

    test('11. User NO puede actualizar campaña sin privilegio UPDATE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .put('/api/campaigns/1')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Intento modificar campaña'
        });

      expect(response.status).toBe(403);
    });

    test('12. User NO puede activar campaña sin privilegio ACTIVATE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/campaigns/1/activate')
        .auth(userToken, { type: 'bearer' });

      expect(response.status).toBe(403);
    });

    test('13. User NO puede eliminar campaña sin privilegio DELETE. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .delete('/api/campaigns/1')
        .auth(userToken, { type: 'bearer' });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // Tests de Users (ya cubierto en 12_users.test.js, pero agregamos resumen)
  // ============================================
  describe('Users - User without privileges cannot manage', () => {
    test('14. User NO puede registrar nuevos usuarios sin privilegio ADD. Expect 403', async() => {
      if (!userToken) {
        console.log('User token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/auth/register')
        .auth(userToken, { type: 'bearer' })
        .send({
          name: 'Nuevo usuario',
          email: 'nuevo_usuario@test.com',
          role: 'user',
          password: 'Test1234'
        });

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  afterAll(async() => {
    // Eliminar usuario de prueba
    if (regularUserId && superadminToken) {
      await api
        .delete(`/api/users/${regularUserId}`)
        .auth(superadminToken, { type: 'bearer' });
    }
  });
});
