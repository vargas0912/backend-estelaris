const { privileges } = require('../../models/index');
const {
  getOnePrivilege,
  getAllPrivileges,
  getPrivilegeByModule,
  updatePrivilege,
  addPrivilege,
  deletePrivilege
} = require('../../services/privileges');

// Mock del modelo privileges
jest.mock('../../models/index', () => ({
  privileges: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Privileges Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Tests para getOnePrivilege
  // ============================================
  describe('getOnePrivilege', () => {
    test('debe retornar un privilegio por id', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Ver usuarios',
        codename: 'view_users',
        module: 'users'
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      const result = await getOnePrivilege(1);

      expect(privileges.findByPk).toHaveBeenCalledWith(1);
      expect(privileges.findByPk).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrivilege);
    });

    test('debe retornar null si el privilegio no existe', async() => {
      privileges.findByPk.mockResolvedValue(null);

      const result = await getOnePrivilege(999);

      expect(privileges.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    test('debe llamar findByPk con el id correcto', async() => {
      privileges.findByPk.mockResolvedValue(null);

      await getOnePrivilege(42);

      expect(privileges.findByPk).toHaveBeenCalledWith(42);
    });

    test('debe manejar id tipo string', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Privilegio Test',
        codename: 'test_privilege',
        module: 'test'
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await getOnePrivilege('1');

      expect(privileges.findByPk).toHaveBeenCalledWith('1');
    });
  });

  // ============================================
  // Tests para getPrivilegeByModule
  // ============================================
  describe('getPrivilegeByModule', () => {
    test('debe retornar privilegios por modulo', async() => {
      const mockPrivileges = [
        {
          id: 1,
          name: 'Ver usuarios',
          codename: 'view_users',
          module: 'users'
        },
        {
          id: 2,
          name: 'Crear usuarios',
          codename: 'create_users',
          module: 'users'
        }
      ];

      privileges.findAll.mockResolvedValue(mockPrivileges);

      const result = await getPrivilegeByModule('users');

      expect(privileges.findAll).toHaveBeenCalledWith({
        where: {
          module: 'users'
        }
      });
      expect(privileges.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrivileges);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacio si no hay privilegios para el modulo', async() => {
      privileges.findAll.mockResolvedValue([]);

      const result = await getPrivilegeByModule('nonexistent');

      expect(privileges.findAll).toHaveBeenCalledWith({
        where: {
          module: 'nonexistent'
        }
      });
      expect(result).toEqual([]);
    });

    test('debe buscar con el modulo correcto', async() => {
      privileges.findAll.mockResolvedValue([]);

      await getPrivilegeByModule('branches');

      expect(privileges.findAll).toHaveBeenCalledWith({
        where: {
          module: 'branches'
        }
      });
    });

    test('debe retornar un solo privilegio si el modulo solo tiene uno', async() => {
      const mockPrivilege = [
        {
          id: 5,
          name: 'Admin Panel',
          codename: 'admin_panel',
          module: 'admin'
        }
      ];

      privileges.findAll.mockResolvedValue(mockPrivilege);

      const result = await getPrivilegeByModule('admin');

      expect(result).toHaveLength(1);
      expect(result[0].module).toBe('admin');
    });
  });

  // ============================================
  // Tests para getAllPrivileges
  // ============================================
  describe('getAllPrivileges', () => {
    test('debe retornar todos los privilegios', async() => {
      const mockPrivileges = [
        {
          id: 1,
          name: 'Ver usuarios',
          codename: 'view_users',
          module: 'users'
        },
        {
          id: 2,
          name: 'Ver sucursales',
          codename: 'view_branches',
          module: 'branches'
        }
      ];

      privileges.findAll.mockResolvedValue(mockPrivileges);

      const result = await getAllPrivileges();

      expect(privileges.findAll).toHaveBeenCalledTimes(1);
      expect(privileges.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockPrivileges);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacio si no hay privilegios', async() => {
      privileges.findAll.mockResolvedValue([]);

      const result = await getAllPrivileges();

      expect(result).toEqual([]);
    });

    test('debe manejar caso cuando findAll retorna null', async() => {
      privileges.findAll.mockResolvedValue(null);

      const result = await getAllPrivileges();

      expect(result).toEqual({
        result: {
          msg: 'NOT_FOUND'
        }
      });
    });

    test('debe manejar gran cantidad de privilegios', async() => {
      const manyPrivileges = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Privilegio ${i + 1}`,
        codename: `privilege_${i + 1}`,
        module: `module_${i % 10}`
      }));

      privileges.findAll.mockResolvedValue(manyPrivileges);

      const result = await getAllPrivileges();

      expect(result).toHaveLength(100);
      expect(result[0].name).toBe('Privilegio 1');
      expect(result[99].name).toBe('Privilegio 100');
    });
  });

  // ============================================
  // Tests para addPrivilege
  // ============================================
  describe('addPrivilege', () => {
    test('debe crear un nuevo privilegio', async() => {
      const newPrivilege = {
        name: 'Nuevo Privilegio',
        codename: 'new_privilege',
        module: 'test'
      };

      const createdPrivilege = {
        id: 1,
        ...newPrivilege
      };

      privileges.create.mockResolvedValue(createdPrivilege);

      const result = await addPrivilege(newPrivilege);

      expect(privileges.create).toHaveBeenCalledWith(newPrivilege);
      expect(privileges.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdPrivilege);
      expect(result.id).toBe(1);
    });

    test('debe crear privilegio con todos los campos', async() => {
      const privilegeData = {
        name: 'Eliminar usuarios',
        codename: 'delete_users',
        module: 'users'
      };

      privileges.create.mockResolvedValue({ id: 5, ...privilegeData });

      const result = await addPrivilege(privilegeData);

      expect(result.name).toBe('Eliminar usuarios');
      expect(result.codename).toBe('delete_users');
      expect(result.module).toBe('users');
    });

    test('debe pasar el body completo a create', async() => {
      const fullData = {
        name: 'Privilegio Completo',
        codename: 'full_privilege',
        module: 'admin',
        extraField: 'extra'
      };

      privileges.create.mockResolvedValue({ id: 1, ...fullData });

      await addPrivilege(fullData);

      expect(privileges.create).toHaveBeenCalledWith(fullData);
    });

    test('debe crear privilegio con datos minimos', async() => {
      const minimalData = { name: 'Min' };
      privileges.create.mockResolvedValue({ id: 1, ...minimalData });

      const result = await addPrivilege(minimalData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Min');
    });
  });

  // ============================================
  // Tests para updatePrivilege
  // ============================================
  describe('updatePrivilege', () => {
    test('debe actualizar un privilegio existente', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Privilegio Original',
        codename: 'original_privilege',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Privilegio Actualizado',
          codename: 'updated_privilege',
          module: 'admin'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, {
        name: 'Privilegio Actualizado',
        codename: 'updated_privilege',
        module: 'admin'
      });

      expect(privileges.findByPk).toHaveBeenCalledWith(1);
      expect(mockPrivilege.save).toHaveBeenCalled();
      expect(mockPrivilege.name).toBe('Privilegio Actualizado');
      expect(mockPrivilege.codename).toBe('updated_privilege');
      expect(mockPrivilege.module).toBe('admin');
    });

    test('debe retornar NOT_FOUND si el privilegio no existe', async() => {
      privileges.findByPk.mockResolvedValue(null);

      const result = await updatePrivilege(999, { name: 'Test' });

      expect(privileges.findByPk).toHaveBeenCalledWith(999);
      expect(result).toEqual({
        result: {
          msg: 'NOT_FOUND'
        }
      });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Original',
          codename: 'original',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, {});

      expect(mockPrivilege.name).toBe('Original');
      expect(mockPrivilege.codename).toBe('original');
      expect(mockPrivilege.module).toBe('users');
    });

    test('debe actualizar solo el nombre', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Nombre Original',
        codename: 'original_code',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nombre Nuevo',
          codename: 'original_code',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, { name: 'Nombre Nuevo' });

      expect(mockPrivilege.name).toBe('Nombre Nuevo');
      expect(mockPrivilege.codename).toBe('original_code');
      expect(mockPrivilege.module).toBe('users');
    });

    test('debe actualizar solo el codename', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Nombre Original',
        codename: 'original_code',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nombre Original',
          codename: 'new_code',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, { codename: 'new_code' });

      expect(mockPrivilege.name).toBe('Nombre Original');
      expect(mockPrivilege.codename).toBe('new_code');
      expect(mockPrivilege.module).toBe('users');
    });

    test('debe actualizar solo el modulo', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Nombre Original',
        codename: 'original_code',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nombre Original',
          codename: 'original_code',
          module: 'admin'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, { module: 'admin' });

      expect(mockPrivilege.name).toBe('Nombre Original');
      expect(mockPrivilege.codename).toBe('original_code');
      expect(mockPrivilege.module).toBe('admin');
    });

    test('debe actualizar todos los campos', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Completamente Nuevo',
          codename: 'completely_new',
          module: 'admin'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, {
        name: 'Completamente Nuevo',
        codename: 'completely_new',
        module: 'admin'
      });

      expect(mockPrivilege.name).toBe('Completamente Nuevo');
      expect(mockPrivilege.codename).toBe('completely_new');
      expect(mockPrivilege.module).toBe('admin');
    });

    test('debe manejar valores null sin cambiar el campo', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Original',
          codename: 'original',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, {
        name: null,
        codename: null,
        module: null
      });

      expect(mockPrivilege.name).toBe('Original');
      expect(mockPrivilege.codename).toBe('original');
      expect(mockPrivilege.module).toBe('users');
    });

    test('debe manejar valores undefined sin cambiar el campo', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Original',
          codename: 'original',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, {
        name: undefined,
        codename: undefined,
        module: undefined
      });

      expect(mockPrivilege.name).toBe('Original');
      expect(mockPrivilege.codename).toBe('original');
      expect(mockPrivilege.module).toBe('users');
    });
  });

  // ============================================
  // Tests para deletePrivilege
  // ============================================
  describe('deletePrivilege', () => {
    test('debe eliminar un privilegio existente', async() => {
      privileges.destroy.mockResolvedValue(1);

      const result = await deletePrivilege(1);

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: {
          id: 1
        }
      });
      expect(privileges.destroy).toHaveBeenCalledTimes(1);
      expect(result).toBe(1);
    });

    test('debe retornar NOT_FOUND si el privilegio no existe', async() => {
      privileges.destroy.mockResolvedValue(0);

      const result = await deletePrivilege(999);

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: {
          id: 999
        }
      });
      expect(result).toEqual({
        result: {
          msg: 'NOT_FOUND'
        }
      });
    });

    test('debe eliminar con el id correcto', async() => {
      privileges.destroy.mockResolvedValue(1);

      await deletePrivilege(42);

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: {
          id: 42
        }
      });
    });

    test('debe retornar numero de filas eliminadas', async() => {
      privileges.destroy.mockResolvedValue(1);

      const result = await deletePrivilege(1);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });

    test('debe manejar id tipo string', async() => {
      privileges.destroy.mockResolvedValue(1);

      await deletePrivilege('5');

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: {
          id: '5'
        }
      });
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getOnePrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      privileges.findByPk.mockRejectedValue(dbError);

      await expect(getOnePrivilege(1)).rejects.toThrow('Database connection failed');
    });

    test('getPrivilegeByModule debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      privileges.findAll.mockRejectedValue(dbError);

      await expect(getPrivilegeByModule('users')).rejects.toThrow('Database query failed');
    });

    test('getAllPrivileges debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      privileges.findAll.mockRejectedValue(dbError);

      await expect(getAllPrivileges()).rejects.toThrow('Database query failed');
    });

    test('addPrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      privileges.create.mockRejectedValue(dbError);

      await expect(addPrivilege({ name: 'Test' })).rejects.toThrow('Insert failed');
    });

    test('updatePrivilege debe propagar error de BD en findByPk', async() => {
      const dbError = new Error('FindByPk failed');
      privileges.findByPk.mockRejectedValue(dbError);

      await expect(updatePrivilege(1, { name: 'Test' })).rejects.toThrow('FindByPk failed');
    });

    test('updatePrivilege debe propagar error de BD en save', async() => {
      const dbError = new Error('Save failed');
      const mockPrivilege = {
        id: 1,
        name: 'Privilegio',
        codename: 'privilege',
        module: 'users',
        save: jest.fn().mockRejectedValue(dbError)
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await expect(updatePrivilege(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deletePrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      privileges.destroy.mockRejectedValue(dbError);

      await expect(deletePrivilege(1)).rejects.toThrow('Delete failed');
    });

    test('addPrivilege debe propagar error de validacion', async() => {
      const validationError = new Error('Validation error: codename must be unique');
      privileges.create.mockRejectedValue(validationError);

      await expect(addPrivilege({
        name: 'Duplicate',
        codename: 'existing_code',
        module: 'users'
      })).rejects.toThrow('Validation error: codename must be unique');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getPrivilegeByModule con modulo vacio', async() => {
      privileges.findAll.mockResolvedValue([]);

      const result = await getPrivilegeByModule('');

      expect(privileges.findAll).toHaveBeenCalledWith({
        where: {
          module: ''
        }
      });
      expect(result).toEqual([]);
    });

    test('getPrivilegeByModule con modulo especial', async() => {
      const mockPrivileges = [
        {
          id: 1,
          name: 'Privilegio Especial',
          codename: 'special_privilege',
          module: 'special-module_123'
        }
      ];

      privileges.findAll.mockResolvedValue(mockPrivileges);

      const result = await getPrivilegeByModule('special-module_123');

      expect(result).toHaveLength(1);
      expect(result[0].module).toBe('special-module_123');
    });

    test('addPrivilege con nombre largo', async() => {
      const longName = 'A'.repeat(255);
      const privilegeData = {
        name: longName,
        codename: 'long_name',
        module: 'test'
      };

      privileges.create.mockResolvedValue({ id: 1, ...privilegeData });

      const result = await addPrivilege(privilegeData);

      expect(result.name).toHaveLength(255);
    });

    test('updatePrivilege con cambio de string vacio', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: '',
          codename: 'original',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, { name: '' });

      // String vacio es falsy, debe mantener el original
      expect(mockPrivilege.name).toBe('Original');
    });

    test('getOnePrivilege con id negativo', async() => {
      privileges.findByPk.mockResolvedValue(null);

      const result = await getOnePrivilege(-1);

      expect(privileges.findByPk).toHaveBeenCalledWith(-1);
      expect(result).toBeNull();
    });

    test('deletePrivilege con id 0', async() => {
      privileges.destroy.mockResolvedValue(0);

      await deletePrivilege(0);

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: {
          id: 0
        }
      });
    });

    test('getAllPrivileges debe retornar estructura correcta en NOT_FOUND', async() => {
      privileges.findAll.mockResolvedValue(null);

      const result = await getAllPrivileges();

      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('msg', 'NOT_FOUND');
    });

    test('updatePrivilege debe aplicar cambios antes de save', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn(function() {
          // Verificar que los cambios se aplicaron antes de save
          expect(this.name).toBe('Nuevo');
          return Promise.resolve(this);
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      await updatePrivilege(1, { name: 'Nuevo' });

      expect(mockPrivilege.save).toHaveBeenCalled();
    });

    test('updatePrivilege debe manejar llamada sin segundo parametro', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Original',
          codename: 'original',
          module: 'users'
        })
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      // Llamar sin segundo parametro para probar el default value
      await updatePrivilege(1);

      expect(mockPrivilege.save).toHaveBeenCalled();
      expect(mockPrivilege.name).toBe('Original');
    });
  });

  // ============================================
  // Tests de validacion de parametros
  // ============================================
  describe('Validacion de parametros', () => {
    test('getOnePrivilege debe aceptar id numerico', async() => {
      privileges.findByPk.mockResolvedValue(null);

      await getOnePrivilege(123);

      expect(privileges.findByPk).toHaveBeenCalledWith(123);
    });

    test('getPrivilegeByModule debe aceptar string como modulo', async() => {
      privileges.findAll.mockResolvedValue([]);

      await getPrivilegeByModule('test_module');

      expect(privileges.findAll).toHaveBeenCalledWith({
        where: {
          module: 'test_module'
        }
      });
    });

    test('addPrivilege debe aceptar objeto como body', async() => {
      const body = {
        name: 'Test',
        codename: 'test',
        module: 'module'
      };

      privileges.create.mockResolvedValue({ id: 1, ...body });

      await addPrivilege(body);

      expect(privileges.create).toHaveBeenCalledWith(body);
      expect(typeof body).toBe('object');
    });

    test('updatePrivilege debe aceptar objeto como req', async() => {
      const mockPrivilege = {
        id: 1,
        name: 'Original',
        codename: 'original',
        module: 'users',
        save: jest.fn().mockResolvedValue({})
      };

      privileges.findByPk.mockResolvedValue(mockPrivilege);

      const req = {
        name: 'Updated',
        codename: 'updated',
        module: 'admin'
      };

      await updatePrivilege(1, req);

      expect(typeof req).toBe('object');
      expect(privileges.findByPk).toHaveBeenCalledWith(1);
    });

    test('deletePrivilege debe aceptar id como parametro', async() => {
      privileges.destroy.mockResolvedValue(1);

      await deletePrivilege(99);

      expect(privileges.destroy).toHaveBeenCalledWith({
        where: { id: 99 }
      });
    });
  });
});
