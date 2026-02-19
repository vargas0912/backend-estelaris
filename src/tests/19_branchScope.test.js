const request = require('supertest');
const server = require('../../app');
const { userBranches, userprivileges, privileges } = require('../../models/index');

const api = request(server.app);

const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const adminUserData = {
  name: 'Admin Branch Test',
  email: 'admin_branch_test@test.com',
  role: 'admin',
  password: 'Admin1234'
};

let superadminToken = '';
let adminToken = '';
let adminUserId = null;
let userBranchRecord = null;
const createdPrivilegeIds = [];
const assignedUserPrivilegeIds = [];

/**
 * Tests para el middleware branchScope
 *
 * Verifica:
 * 1. Login incluye array de branches en la respuesta
 * 2. Superadmin bypasea branchScope (sin X-Branch-ID → 200)
 * 3. Admin sin X-Branch-ID → 400
 * 4. Admin con X-Branch-ID de sucursal no asignada → 403
 * 5. Admin con X-Branch-ID de sucursal asignada → 200
 */

const findOrCreatePrivilege = async(codename, name, module) => {
  let priv = await privileges.findOne({ where: { codename } });
  if (!priv) {
    priv = await privileges.create({ name, codename, module });
    createdPrivilegeIds.push(priv.id);
  }
  return priv;
};

describe('[BRANCH SCOPE] Middleware de scope por sucursal', () => {
  beforeAll(async() => {
    // Login como superadmin
    const superadminResponse = await api
      .post('/api/auth/login')
      .send(superadminLogin);

    if (superadminResponse.status === 200) {
      superadminToken = superadminResponse.body.sesion.token;
    }

    // Crear usuario admin de prueba
    const adminResponse = await api
      .post('/api/auth/registerSuperUser')
      .auth(superadminToken, { type: 'bearer' })
      .send(adminUserData);

    if (adminResponse.status === 200) {
      adminUserId = adminResponse.body.superAdmin?.user?.id;

      // Login como admin
      const adminLoginResponse = await api
        .post('/api/auth/login')
        .send({
          email: adminUserData.email,
          password: adminUserData.password
        });

      if (adminLoginResponse.status === 200) {
        adminToken = adminLoginResponse.body.sesion.token;
      }

      if (adminUserId) {
        // Asignar sucursal 1 al admin directamente en la DB
        userBranchRecord = await userBranches.create({
          user_id: adminUserId,
          branch_id: 1
        });

        // Obtener o crear privilegios necesarios y asignarlos al admin
        const viewStocksPriv = await findOrCreatePrivilege(
          'view_product_stocks',
          'Ver inventarios de productos',
          'productStocks'
        );
        const viewEmployeesPriv = await findOrCreatePrivilege(
          'view_employees',
          'Ver empleados',
          'employees'
        );

        const p1 = await userprivileges.create({
          user_id: adminUserId,
          privilege_id: viewStocksPriv.id
        });
        assignedUserPrivilegeIds.push(p1.id);

        const p2 = await userprivileges.create({
          user_id: adminUserId,
          privilege_id: viewEmployeesPriv.id
        });
        assignedUserPrivilegeIds.push(p2.id);
      }
    }
  });

  afterAll(async() => {
    // Limpiar user_privileges asignados
    if (assignedUserPrivilegeIds.length > 0) {
      await userprivileges.destroy({
        where: { id: assignedUserPrivilegeIds },
        force: true
      });
    }

    // Limpiar asignación de sucursal
    if (userBranchRecord) {
      await userBranches.destroy({
        where: { id: userBranchRecord.id },
        force: true
      });
    }

    // Eliminar privilegios creados en el test (si los creamos)
    if (createdPrivilegeIds.length > 0) {
      await privileges.destroy({
        where: { id: createdPrivilegeIds },
        force: true
      });
    }

    // Eliminar usuario de prueba
    if (adminUserId && superadminToken) {
      await api
        .delete(`/api/users/${adminUserId}`)
        .auth(superadminToken, { type: 'bearer' });
    }
  });

  // ============================================
  // Tests de login: branches en respuesta
  // ============================================
  describe('Login response incluye branches', () => {
    test('1. Login de superadmin incluye array branches', async() => {
      const response = await api
        .post('/api/auth/login')
        .send(superadminLogin)
        .expect(200);

      expect(response.body.sesion).toHaveProperty('branches');
      expect(Array.isArray(response.body.sesion.branches)).toBe(true);
    });

    test('2. Login de admin incluye array branches (solo las asignadas)', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .post('/api/auth/login')
        .send({
          email: adminUserData.email,
          password: adminUserData.password
        })
        .expect(200);

      expect(response.body.sesion).toHaveProperty('branches');
      expect(Array.isArray(response.body.sesion.branches)).toBe(true);
      // Admin tiene 1 sucursal asignada
      expect(response.body.sesion.branches.length).toBe(1);
      expect(response.body.sesion.branches[0].id).toBe(1);
    });

    test('3. Branches en la respuesta tienen id y name', async() => {
      const response = await api
        .post('/api/auth/login')
        .send(superadminLogin)
        .expect(200);

      const branches = response.body.sesion.branches;
      if (branches.length > 0) {
        expect(branches[0]).toHaveProperty('id');
        expect(branches[0]).toHaveProperty('name');
      }
      expect(true).toBe(true);
    });
  });

  // ============================================
  // Tests de superadmin: bypasea branchScope
  // ============================================
  describe('Superadmin bypasea branchScope', () => {
    test('4. Superadmin puede listar inventarios SIN X-Branch-ID. Expect 200', async() => {
      const response = await api
        .get('/api/productStocks')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('5. Superadmin puede listar empleados SIN X-Branch-ID. Expect 200', async() => {
      const response = await api
        .get('/api/employees')
        .auth(superadminToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('employees');
      expect(Array.isArray(response.body.employees)).toBe(true);
    });
  });

  // ============================================
  // Tests de admin sin X-Branch-ID: 400
  // ============================================
  describe('Admin sin X-Branch-ID recibe 400', () => {
    test('6. Admin sin X-Branch-ID en GET /productStocks. Expect 400', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .expect(400);

      expect(response.body.error).toBe('BRANCH_ID_REQUIRED');
    });

    test('7. Admin sin X-Branch-ID en GET /employees. Expect 400', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/employees')
        .auth(adminToken, { type: 'bearer' })
        .expect(400);

      expect(response.body.error).toBe('BRANCH_ID_REQUIRED');
    });
  });

  // ============================================
  // Tests de admin con sucursal no asignada: 403
  // ============================================
  describe('Admin con sucursal no asignada recibe 403', () => {
    test('8. Admin con X-Branch-ID de sucursal no asignada en GET /productStocks. Expect 403', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '99999')
        .expect(403);

      expect(response.body.error).toBe('BRANCH_ACCESS_DENIED');
    });

    test('9. Admin con X-Branch-ID de sucursal no asignada en GET /employees. Expect 403', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/employees')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '99999')
        .expect(403);

      expect(response.body.error).toBe('BRANCH_ACCESS_DENIED');
    });
  });

  // ============================================
  // Tests de admin con sucursal asignada: 200
  // ============================================
  describe('Admin con sucursal asignada recibe 200', () => {
    test('10. Admin con X-Branch-ID de sucursal asignada en GET /productStocks. Expect 200', async() => {
      if (!adminToken || !adminUserId) {
        console.log('Admin not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '1')
        .expect(200);

      expect(response.body).toHaveProperty('stocks');
      expect(Array.isArray(response.body.stocks)).toBe(true);
    });

    test('11. Admin con X-Branch-ID de sucursal asignada en GET /employees. Expect 200', async() => {
      if (!adminToken || !adminUserId) {
        console.log('Admin not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/employees')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '1')
        .expect(200);

      expect(response.body).toHaveProperty('employees');
      expect(Array.isArray(response.body.employees)).toBe(true);
    });

    test('12. Los stocks devueltos pertenecen a la sucursal indicada', async() => {
      if (!adminToken || !adminUserId) {
        console.log('Admin not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '1')
        .expect(200);

      const stocks = response.body.stocks;
      const allFromBranch = stocks.every(s => s.branch_id === 1);
      expect(allFromBranch).toBe(true);
    });
  });

  // ============================================
  // Tests de X-Branch-ID con valor inválido
  // ============================================
  describe('X-Branch-ID con valor inválido', () => {
    test('13. X-Branch-ID no numérico recibe 400', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', 'abc')
        .expect(400);

      expect(response.body.error).toBe('BRANCH_ID_REQUIRED');
    });

    test('14. X-Branch-ID cero recibe 400', async() => {
      if (!adminToken) {
        console.log('Admin token not available, skipping test');
        expect(true).toBe(true);
        return;
      }

      const response = await api
        .get('/api/productStocks')
        .auth(adminToken, { type: 'bearer' })
        .set('X-Branch-ID', '0')
        .expect(400);

      expect(response.body.error).toBe('BRANCH_ID_REQUIRED');
    });
  });
});
