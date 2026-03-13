const { employees, users, privileges, userprivileges } = require('../../models/index');
const { sequelize } = require('../../models/index');
const {
  getAllEmployees,
  getEmployee,
  getEmployeesByBranch,
  addNewEmployee,
  updateEmployee,
  deleteEmployee,
  grantEmployeeAccess,
  revokeEmployeeAccess
} = require('../../services/employees');

jest.mock('../../models/index', () => ({
  employees: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  positions: {
    findAll: jest.fn()
  },
  branches: {
    findAll: jest.fn()
  },
  users: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  privileges: {
    findAll: jest.fn()
  },
  userprivileges: {
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('../../utils/handlePassword', () => ({
  encrypt: jest.fn().mockResolvedValue('hashed_password')
}));

describe('Employees Service - Unit Tests', () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('grantEmployeeAccess', () => {
    const mockEmployee = {
      id: 1,
      name: 'Juan Pérez',
      user_id: null
    };

    test('debe crear acceso exitosamente para empleado sin usuario', async() => {
      employees.findByPk.mockResolvedValue(mockEmployee);
      users.findOne.mockResolvedValue(null);
      privileges.findAll.mockResolvedValue([
        { id: 1, codename: 'view_products' },
        { id: 2, codename: 'create_sales' }
      ]);
      users.create.mockResolvedValue({
        id: 100,
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        role: 'user'
      });
      userprivileges.bulkCreate.mockResolvedValue([]);
      employees.findByPk.mockResolvedValueOnce({ ...mockEmployee, update: jest.fn().mockResolvedValue({}) });

      const result = await grantEmployeeAccess(1, 'juan@empresa.com', 'password123', ['view_products', 'create_sales']);

      expect(result.employee.user_id).toBe(100);
      expect(result.privileges).toEqual(['view_products', 'create_sales']);
    });

    test('debe retornar error si empleado no existe', async() => {
      employees.findByPk.mockResolvedValue(null);

      const result = await grantEmployeeAccess(999, 'juan@empresa.com', 'pass', []);

      expect(result).toEqual({ error: 'EMPLOYEE_NOT_FOUND' });
    });

    test('debe retornar error si empleado ya tiene acceso', async() => {
      const employeeWithUser = { ...mockEmployee, user_id: 50 };
      employees.findByPk.mockResolvedValue(employeeWithUser);

      const result = await grantEmployeeAccess(1, 'juan@empresa.com', 'pass', []);

      expect(result).toEqual({ error: 'EMPLOYEE_ALREADY_HAS_ACCESS' });
    });

    test('debe retornar error si el email ya está en uso', async() => {
      employees.findByPk.mockResolvedValue(mockEmployee);
      users.findOne.mockResolvedValue({ id: 99, email: 'otro@empresa.com' });

      const result = await grantEmployeeAccess(1, 'juan@empresa.com', 'pass', []);

      expect(result).toEqual({ error: 'EMAIL_ALREADY_IN_USE' });
    });

    test('debe retornar error si privilegios inválidos', async() => {
      employees.findByPk.mockResolvedValue(mockEmployee);
      users.findOne.mockResolvedValue(null);
      privileges.findAll.mockResolvedValue([
        { id: 1, codename: 'view_products' }
      ]);

      const result = await grantEmployeeAccess(1, 'juan@empresa.com', 'pass', ['view_products', 'invalid_privilege']);

      expect(result).toEqual({ error: 'INVALID_PRIVILEGES' });
    });

    test('debe hacer rollback en caso de error', async() => {
      employees.findByPk.mockResolvedValue(mockEmployee);
      users.findOne.mockResolvedValue(null);
      privileges.findAll.mockResolvedValue([
        { id: 1, codename: 'view_products' }
      ]);
      users.create.mockRejectedValue(new Error('DB Error'));

      await expect(grantEmployeeAccess(1, 'juan@empresa.com', 'pass', ['view_products'])).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('revokeEmployeeAccess', () => {
    test('debe revocar acceso exitosamente', async() => {
      const employeeWithUser = {
        id: 1,
        name: 'Juan Pérez',
        user_id: 100,
        update: jest.fn().mockResolvedValue({})
      };
      employees.findByPk.mockResolvedValue(employeeWithUser);

      const result = await revokeEmployeeAccess(1);

      expect(result).toEqual({ revoked: true });
      expect(userprivileges.destroy).toHaveBeenCalledWith({ where: { user_id: 100 }, transaction: mockTransaction });
      expect(users.destroy).toHaveBeenCalledWith({ where: { id: 100 }, transaction: mockTransaction });
    });

    test('debe retornar error si empleado no existe', async() => {
      employees.findByPk.mockResolvedValue(null);

      const result = await revokeEmployeeAccess(999);

      expect(result).toEqual({ error: 'EMPLOYEE_NOT_FOUND' });
    });

    test('debe retornar error si empleado no tiene acceso', async() => {
      const employeeWithoutUser = {
        id: 1,
        name: 'Juan Pérez',
        user_id: null
      };
      employees.findByPk.mockResolvedValue(employeeWithoutUser);

      const result = await revokeEmployeeAccess(1);

      expect(result).toEqual({ error: 'EMPLOYEE_HAS_NO_ACCESS' });
    });

    test('debe hacer rollback en caso de error', async() => {
      const employeeWithUser = {
        id: 1,
        name: 'Juan Pérez',
        user_id: 100,
        update: jest.fn().mockRejectedValue(new Error('DB Error'))
      };
      employees.findByPk.mockResolvedValue(employeeWithUser);

      await expect(revokeEmployeeAccess(1)).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getAllEmployees', () => {
    test('debe retornar todos los empleados', async() => {
      const mockEmployees = [
        { id: 1, name: 'Empleado 1' },
        { id: 2, name: 'Empleado 2' }
      ];
      employees.findAll.mockResolvedValue(mockEmployees);

      const result = await getAllEmployees();

      expect(result).toEqual(mockEmployees);
    });

    test('debe filtrar por sucursal', async() => {
      employees.findAll.mockResolvedValue([]);

      await getAllEmployees(1);

      expect(employees.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch_id: 1 }
        })
      );
    });
  });

  describe('getEmployee', () => {
    test('debe retornar empleado por id', async() => {
      const mockEmployee = { id: 1, name: 'Juan' };
      employees.findOne.mockResolvedValue(mockEmployee);

      const result = await getEmployee(1);

      expect(result).toEqual(mockEmployee);
    });

    test('debe retornar null si no existe', async() => {
      employees.findOne.mockResolvedValue(null);

      const result = await getEmployee(999);

      expect(result).toBeNull();
    });
  });

  describe('getEmployeesByBranch', () => {
    test('debe retornar empleados de una sucursal', async() => {
      const mockEmployees = [{ id: 1, name: 'Empleado 1' }];
      employees.findAll.mockResolvedValue(mockEmployees);

      const result = await getEmployeesByBranch(1);

      expect(result).toEqual(mockEmployees);
      expect(employees.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branch_id: 1 } })
      );
    });
  });

  describe('addNewEmployee', () => {
    test('debe crear empleado', async() => {
      const newEmployee = { name: 'Nuevo', email: 'nuevo@empresa.com' };
      const createdEmployee = { id: 1, ...newEmployee };
      employees.create.mockResolvedValue(createdEmployee);

      const result = await addNewEmployee(newEmployee);

      expect(employees.create).toHaveBeenCalledWith(newEmployee);
      expect(result).toEqual(createdEmployee);
    });
  });

  describe('updateEmployee', () => {
    test('debe actualizar empleado existente', async() => {
      const mockEmployee = {
        id: 1,
        name: 'Juan',
        email: 'juan@empresa.com',
        save: jest.fn().mockResolvedValue({})
      };
      employees.findByPk.mockResolvedValue(mockEmployee);

      await updateEmployee(1, { name: 'Juan Actualizado' });

      expect(mockEmployee.name).toBe('Juan Actualizado');
      expect(mockEmployee.save).toHaveBeenCalled();
    });

    test('debe retornar NOT_FOUND si no existe', async() => {
      employees.findByPk.mockResolvedValue(null);

      const result = await updateEmployee(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });
  });

  describe('deleteEmployee', () => {
    test('debe eliminar empleado', async() => {
      employees.destroy.mockResolvedValue(1);

      const result = await deleteEmployee(1);

      expect(employees.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si no existe', async() => {
      employees.destroy.mockResolvedValue(0);

      const result = await deleteEmployee(999);

      expect(result).toBe(0);
    });
  });
});
