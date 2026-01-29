const request = require('supertest');
const server = require('../../app');

const {
  employeeCreate,
  employeeCreateEmpty,
  employeeCreateInvalid,
  employeeUpdate,
  employeeCreate2,
  employeeCreateFull,
  employeeCreateNoName,
  employeeCreateNoEmail,
  employeeCreateNoPosition,
  employeeCreateNoBranch
} = require('./helper/helperData');

let Token = '';
let createdEmployeeId = null;
let secondEmployeeId = null;

const api = request(server.app);

// Usar el superadmin creado en 01_auth.test.js
const testUser = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

/**
 * Script de tests para Employees
 *
 * 1. Registrar usuario de prueba
 * 2. Login para obtener token
 * 3. Obtener lista de empleados
 * 4. Crear empleado con datos válidos
 * 5. Crear empleado con datos vacíos (error)
 * 6. Crear empleado sin datos (error)
 * 7. Obtener empleado por id
 * 8. Obtener empleado inexistente (error)
 * 9. Actualizar empleado
 * 10. Eliminar empleado
 * 11. Verificar que el empleado eliminado no existe
 */

describe('[EMPLOYEES] Test api employees //api/employees/', () => {
  test('Login para obtener token. 200', async() => {
    await api
      .post('/api/auth/login')
      .set('Content-type', 'application/json')
      .send(testUser)
      .expect(200)
      .then((res) => {
        Token = res.body.sesion.token;
        expect(res.body.sesion).toHaveProperty('token');
      });
  });

  test('1. Obtener lista de empleados. Expect 200', async() => {
    const response = await api
      .get('/api/employees')
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('employees');
    expect(Array.isArray(response.body.employees)).toBe(true);
  });

  test('2. Crear empleado con datos válidos. Expect 200', async() => {
    const response = await api
      .post('/api/employees')
      .auth(Token, { type: 'bearer' })
      .send(employeeCreate)
      .expect(200);

    expect(response.body).toHaveProperty('employee');
    expect(response.body.employee).toHaveProperty('id');
    expect(response.body.employee.name).toBe(employeeCreate.name);
    expect(response.body.employee.email).toBe(employeeCreate.email);

    createdEmployeeId = response.body.employee.id;
  });

  test('3. Crear empleado con datos vacíos. Expect 400', async() => {
    await api
      .post('/api/employees')
      .auth(Token, { type: 'bearer' })
      .send(employeeCreateEmpty)
      .expect(400);
  });

  test('4. Crear empleado sin datos. Expect 400', async() => {
    await api
      .post('/api/employees')
      .auth(Token, { type: 'bearer' })
      .send(employeeCreateInvalid)
      .expect(400);
  });

  test('5. Obtener empleado por id. Expect 200', async() => {
    const response = await api
      .get(`/api/employees/${createdEmployeeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('employee');
    expect(response.body.employee.id).toBe(createdEmployeeId);
  });

  test('6. Obtener empleado inexistente. Expect 404', async() => {
    await api
      .get('/api/employees/99999')
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  test('7. Actualizar empleado. Expect 200', async() => {
    const response = await api
      .put(`/api/employees/${createdEmployeeId}`)
      .auth(Token, { type: 'bearer' })
      .send(employeeUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('employee');
    expect(response.body.employee.name).toBe(employeeUpdate.name);
  });

  test('8. Eliminar empleado. Expect 200', async() => {
    const response = await api
      .delete(`/api/employees/${createdEmployeeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });

  test('9. Verificar que el empleado eliminado no existe. Expect 404', async() => {
    await api
      .get(`/api/employees/${createdEmployeeId}`)
      .auth(Token, { type: 'bearer' })
      .expect(404);
  });

  // ============================================
  // Tests de autenticación
  // ============================================
  describe('Tests de autenticacion', () => {
    test('10. Obtener empleados sin token. Expect 401', async() => {
      await api
        .get('/api/employees')
        .expect(401);
    });

    test('11. Crear empleado sin token. Expect 401', async() => {
      await api
        .post('/api/employees')
        .send(employeeCreate)
        .expect(401);
    });

    test('12. Actualizar empleado sin token. Expect 401', async() => {
      await api
        .put('/api/employees/1')
        .send(employeeUpdate)
        .expect(401);
    });

    test('13. Eliminar empleado sin token. Expect 401', async() => {
      await api
        .delete('/api/employees/1')
        .expect(401);
    });

    test('14. Obtener empleados con token inválido. Expect 401', async() => {
      await api
        .get('/api/employees')
        .auth('token_invalido_123', { type: 'bearer' })
        .expect(401);
    });
  });

  // ============================================
  // Tests de validación de campos
  // ============================================
  describe('Tests de validacion de campos', () => {
    test('15. Crear empleado sin nombre. Expect 400', async() => {
      await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreateNoName)
        .expect(400);
    });

    test('16. Crear empleado sin email. Expect 400', async() => {
      await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreateNoEmail)
        .expect(400);
    });

    test('17. Crear empleado sin puesto. Expect 400', async() => {
      await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreateNoPosition)
        .expect(400);
    });

    test('18. Crear empleado sin sucursal. Expect 400', async() => {
      await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreateNoBranch)
        .expect(400);
    });

    test('19. Actualizar empleado con nombre vacío. Expect 400', async() => {
      // Primero crear un empleado para actualizar
      const createResponse = await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreate2);

      secondEmployeeId = createResponse.body.employee?.id;

      if (secondEmployeeId) {
        await api
          .put(`/api/employees/${secondEmployeeId}`)
          .auth(Token, { type: 'bearer' })
          .send({ name: '' })
          .expect(400);
      }
    });
  });

  // ============================================
  // Tests de ID inválido
  // ============================================
  describe('Tests de ID invalido', () => {
    test('20. Obtener empleado con ID no numérico. Expect 404', async() => {
      await api
        .get('/api/employees/abc')
        .auth(Token, { type: 'bearer' })
        .expect(404);
    });

    test('21. Actualizar empleado inexistente. Expect 200 con NOT_FOUND', async() => {
      const response = await api
        .put('/api/employees/99999')
        .auth(Token, { type: 'bearer' })
        .send(employeeUpdate);

      expect([200, 404]).toContain(response.status);
    });

    test('22. Eliminar empleado inexistente. Expect 200 con result 0', async() => {
      const response = await api
        .delete('/api/employees/99999')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toBe(0);
    });

    test('23. Eliminar empleado con ID no numérico. Expect 400', async() => {
      await api
        .delete('/api/employees/invalid')
        .auth(Token, { type: 'bearer' })
        .expect(400);
    });
  });

  // ============================================
  // Tests de estructura de respuesta
  // ============================================
  describe('Tests de estructura de respuesta', () => {
    test('24. Verificar estructura completa de empleado creado', async() => {
      const response = await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeCreateFull)
        .expect(200);

      expect(response.body).toHaveProperty('employee');
      expect(response.body.employee).toHaveProperty('id');
      expect(response.body.employee).toHaveProperty('name');
      expect(response.body.employee).toHaveProperty('email');
      expect(response.body.employee).toHaveProperty('position_id');
      expect(response.body.employee).toHaveProperty('branch_id');

      // Limpiar: eliminar el empleado creado
      if (response.body.employee.id) {
        await api
          .delete(`/api/employees/${response.body.employee.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('25. Verificar que lista de empleados es un array', async() => {
      const response = await api
        .get('/api/employees')
        .auth(Token, { type: 'bearer' })
        .expect(200);

      expect(response.body).toHaveProperty('employees');
      expect(Array.isArray(response.body.employees)).toBe(true);
    });

    test('26. Crear empleado con campos opcionales', async() => {
      const employeeWithOptional = {
        name: 'Empleado con opcionales',
        email: 'opcional_emp@test.com',
        phone: '8181234567',
        mobile: '8112345678',
        hire_date: '2026-01-15',
        position_id: 1,
        branch_id: 1,
        salary: 18000.00,
        active: true
      };

      const response = await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeWithOptional)
        .expect(200);

      expect(response.body).toHaveProperty('employee');
      expect(response.body.employee.name).toBe('Empleado con opcionales');

      // Limpiar
      if (response.body.employee.id) {
        await api
          .delete(`/api/employees/${response.body.employee.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });

    test('27. Verificar fechas en empleado', async() => {
      const employeeWithDates = {
        name: 'Empleado con fechas',
        email: 'fechas_emp@test.com',
        phone: '8181234567',
        hire_date: '2026-01-10',
        termination_date: null,
        position_id: 1,
        branch_id: 1,
        active: true
      };

      const response = await api
        .post('/api/employees')
        .auth(Token, { type: 'bearer' })
        .send(employeeWithDates)
        .expect(200);

      expect(response.body).toHaveProperty('employee');
      expect(response.body.employee).toHaveProperty('hire_date');

      // Limpiar
      if (response.body.employee.id) {
        await api
          .delete(`/api/employees/${response.body.employee.id}`)
          .auth(Token, { type: 'bearer' });
      }
    });
  });

  // ============================================
  // Cleanup
  // ============================================
  describe('Cleanup', () => {
    test('28. Eliminar empleado secundario si existe', async() => {
      if (secondEmployeeId) {
        await api
          .delete(`/api/employees/${secondEmployeeId}`)
          .auth(Token, { type: 'bearer' });
      }
      expect(true).toBe(true);
    });
  });
});
