const { userprivileges, privileges } = require('../../models/index');
const {
  getOneUserPrivilege,
  getAllUserPrivileges,
  addNewUserPrivilege,
  deleteUserPrivilege
} = require('../../services/user-privileges');

// Mock del modelo userprivileges y privileges
jest.mock('../../models/index', () => ({
  userprivileges: {
    findAll: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  privileges: {}
}));

describe('User Privileges Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Tests para getAllUserPrivileges
  // ============================================
  describe('getAllUserPrivileges', () => {
    test('debe retornar todos los privilegios de un usuario con relaciones', async() => {
      const mockUserPrivileges = [
        {
          id: 1,
          user_id: 1,
          privilege_id: 1,
          privileges: {
            name: 'Ver usuarios',
            codename: 'view_users'
          }
        },
        {
          id: 2,
          user_id: 1,
          privilege_id: 2,
          privileges: {
            name: 'Editar usuarios',
            codename: 'edit_users'
          }
        }
      ];

      userprivileges.findAll.mockResolvedValue(mockUserPrivileges);

      const result = await getAllUserPrivileges(1);

      expect(userprivileges.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'user_id', 'privilege_id'],
        where: {
          user_id: 1
        },
        include: [
          {
            model: privileges,
            as: 'privileges',
            attributes: ['name', 'codename']
          }
        ]
      });
      expect(userprivileges.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserPrivileges);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacio si el usuario no tiene privilegios', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      const result = await getAllUserPrivileges(999);

      expect(userprivileges.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'user_id', 'privilege_id'],
        where: {
          user_id: 999
        },
        include: [
          {
            model: privileges,
            as: 'privileges',
            attributes: ['name', 'codename']
          }
        ]
      });
      expect(result).toEqual([]);
    });

    test('debe llamar findAll con el userId correcto', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges(42);

      expect(userprivileges.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id: 42
          }
        })
      );
    });

    test('debe incluir los atributos correctos en la consulta', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges(1);

      expect(userprivileges.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: ['id', 'user_id', 'privilege_id']
        })
      );
    });

    test('debe incluir la relacion con privileges correctamente', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges(1);

      expect(userprivileges.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: privileges,
              as: 'privileges',
              attributes: ['name', 'codename']
            }
          ]
        })
      );
    });

    test('debe retornar un solo privilegio si el usuario solo tiene uno', async() => {
      const mockSinglePrivilege = [
        {
          id: 1,
          user_id: 5,
          privilege_id: 3,
          privileges: {
            name: 'Ver reportes',
            codename: 'view_reports'
          }
        }
      ];

      userprivileges.findAll.mockResolvedValue(mockSinglePrivilege);

      const result = await getAllUserPrivileges(5);

      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(5);
      expect(result[0].privileges.codename).toBe('view_reports');
    });
  });

  // ============================================
  // Tests para getOneUserPrivilege
  // ============================================
  describe('getOneUserPrivilege', () => {
    test('debe retornar true si el usuario tiene el privilegio', async() => {
      userprivileges.count.mockResolvedValue(1);

      const result = await getOneUserPrivilege(1, 'view_users');

      expect(userprivileges.count).toHaveBeenCalledWith({
        where: {
          userId: 1
        },
        include: [
          {
            model: privileges,
            where: {
              codeName: 'view_users'
            }
          }
        ]
      });
      expect(userprivileges.count).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    test('debe retornar false si el usuario no tiene el privilegio', async() => {
      userprivileges.count.mockResolvedValue(0);

      const result = await getOneUserPrivilege(1, 'delete_users');

      expect(userprivileges.count).toHaveBeenCalledWith({
        where: {
          userId: 1
        },
        include: [
          {
            model: privileges,
            where: {
              codeName: 'delete_users'
            }
          }
        ]
      });
      expect(result).toBe(false);
    });

    test('debe llamar count con el userId correcto', async() => {
      userprivileges.count.mockResolvedValue(0);

      await getOneUserPrivilege(99, 'view_users');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 99
          }
        })
      );
    });

    test('debe llamar count con el codeName correcto', async() => {
      userprivileges.count.mockResolvedValue(0);

      await getOneUserPrivilege(1, 'edit_branches');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: privileges,
              where: {
                codeName: 'edit_branches'
              }
            }
          ]
        })
      );
    });

    test('debe retornar true si count retorna valor mayor a 0', async() => {
      userprivileges.count.mockResolvedValue(5);

      const result = await getOneUserPrivilege(1, 'view_users');

      expect(result).toBe(true);
    });

    test('debe retornar false si count retorna exactamente 0', async() => {
      userprivileges.count.mockResolvedValue(0);

      const result = await getOneUserPrivilege(1, 'view_users');

      expect(result).toBe(false);
    });

    test('debe incluir la relacion con privileges en el count', async() => {
      userprivileges.count.mockResolvedValue(1);

      await getOneUserPrivilege(1, 'admin_panel');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: privileges,
              where: expect.any(Object)
            }
          ]
        })
      );
    });
  });

  // ============================================
  // Tests para addNewUserPrivilege
  // ============================================
  describe('addNewUserPrivilege', () => {
    test('debe crear un nuevo privilegio de usuario', async() => {
      const newUserPrivilege = {
        user_id: 1,
        privilege_id: 2,
        active: 1
      };

      const createdUserPrivilege = {
        id: 1,
        ...newUserPrivilege
      };

      userprivileges.create.mockResolvedValue(createdUserPrivilege);

      const result = await addNewUserPrivilege(newUserPrivilege);

      expect(userprivileges.create).toHaveBeenCalledWith(newUserPrivilege);
      expect(userprivileges.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdUserPrivilege);
      expect(result.id).toBe(1);
    });

    test('debe crear privilegio con todos los campos del body', async() => {
      const privilegeData = {
        user_id: 5,
        privilege_id: 10,
        active: 1
      };

      userprivileges.create.mockResolvedValue({ id: 3, ...privilegeData });

      const result = await addNewUserPrivilege(privilegeData);

      expect(result.user_id).toBe(5);
      expect(result.privilege_id).toBe(10);
      expect(result.active).toBe(1);
    });

    test('debe pasar el body completo a create', async() => {
      const fullData = {
        user_id: 1,
        privilege_id: 2,
        active: 1,
        extraField: 'extra'
      };

      userprivileges.create.mockResolvedValue({ id: 1, ...fullData });

      await addNewUserPrivilege(fullData);

      expect(userprivileges.create).toHaveBeenCalledWith(fullData);
    });

    test('debe crear privilegio con datos minimos', async() => {
      const minimalData = {
        user_id: 1,
        privilege_id: 1
      };

      userprivileges.create.mockResolvedValue({ id: 1, ...minimalData });

      const result = await addNewUserPrivilege(minimalData);

      expect(result.id).toBe(1);
      expect(result.user_id).toBe(1);
      expect(result.privilege_id).toBe(1);
    });

    test('debe retornar el privilegio creado con id asignado', async() => {
      const newPrivilege = {
        user_id: 10,
        privilege_id: 20
      };

      const createdPrivilege = {
        id: 999,
        ...newPrivilege,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      userprivileges.create.mockResolvedValue(createdPrivilege);

      const result = await addNewUserPrivilege(newPrivilege);

      expect(result).toHaveProperty('id', 999);
      expect(result).toHaveProperty('user_id', 10);
      expect(result).toHaveProperty('privilege_id', 20);
    });
  });

  // ============================================
  // Tests para deleteUserPrivilege
  // ============================================
  describe('deleteUserPrivilege', () => {
    test('debe eliminar un privilegio de usuario existente', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      const result = await deleteUserPrivilege(1, 2);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 1,
          privilegeId: 2
        }
      });
      expect(userprivileges.destroy).toHaveBeenCalledTimes(1);
      expect(result).toBe(1);
    });

    test('debe retornar NOT_FOUND si el privilegio de usuario no existe', async() => {
      userprivileges.destroy.mockResolvedValue(0);

      const result = await deleteUserPrivilege(999, 888);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 999,
          privilegeId: 888
        }
      });
      expect(result).toEqual({
        data: {
          msg: 'NOT_FOUND'
        }
      });
    });

    test('debe eliminar con userId correcto', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      await deleteUserPrivilege(42, 1);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 42,
          privilegeId: 1
        }
      });
    });

    test('debe eliminar con privilegeId correcto', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      await deleteUserPrivilege(1, 99);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 1,
          privilegeId: 99
        }
      });
    });

    test('debe retornar numero de filas eliminadas cuando es exitoso', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      const result = await deleteUserPrivilege(1, 2);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });

    test('debe retornar objeto con NOT_FOUND cuando destroy retorna 0', async() => {
      userprivileges.destroy.mockResolvedValue(0);

      const result = await deleteUserPrivilege(1, 2);

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('msg', 'NOT_FOUND');
    });

    test('debe manejar userId tipo string', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      await deleteUserPrivilege('5', 10);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: '5',
          privilegeId: 10
        }
      });
    });

    test('debe manejar privilegeId tipo string', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      await deleteUserPrivilege(5, '10');

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 5,
          privilegeId: '10'
        }
      });
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getAllUserPrivileges debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      userprivileges.findAll.mockRejectedValue(dbError);

      await expect(getAllUserPrivileges(1)).rejects.toThrow('Database connection failed');
    });

    test('getOneUserPrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Database count failed');
      userprivileges.count.mockRejectedValue(dbError);

      await expect(getOneUserPrivilege(1, 'view_users')).rejects.toThrow('Database count failed');
    });

    test('addNewUserPrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      userprivileges.create.mockRejectedValue(dbError);

      await expect(addNewUserPrivilege({ user_id: 1, privilege_id: 1 })).rejects.toThrow('Insert failed');
    });

    test('deleteUserPrivilege debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      userprivileges.destroy.mockRejectedValue(dbError);

      await expect(deleteUserPrivilege(1, 1)).rejects.toThrow('Delete failed');
    });

    test('addNewUserPrivilege debe propagar error de validacion', async() => {
      const validationError = new Error('Validation error: user_id cannot be null');
      userprivileges.create.mockRejectedValue(validationError);

      await expect(addNewUserPrivilege({
        privilege_id: 1
      })).rejects.toThrow('Validation error: user_id cannot be null');
    });

    test('addNewUserPrivilege debe propagar error de clave duplicada', async() => {
      const duplicateError = new Error('Duplicate entry for user_id and privilege_id');
      userprivileges.create.mockRejectedValue(duplicateError);

      await expect(addNewUserPrivilege({
        user_id: 1,
        privilege_id: 1
      })).rejects.toThrow('Duplicate entry for user_id and privilege_id');
    });

    test('getAllUserPrivileges debe propagar error de include', async() => {
      const includeError = new Error('Association privileges not found');
      userprivileges.findAll.mockRejectedValue(includeError);

      await expect(getAllUserPrivileges(1)).rejects.toThrow('Association privileges not found');
    });

    test('getOneUserPrivilege debe propagar error de include', async() => {
      const includeError = new Error('Association privileges not found');
      userprivileges.count.mockRejectedValue(includeError);

      await expect(getOneUserPrivilege(1, 'view_users')).rejects.toThrow('Association privileges not found');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getAllUserPrivileges con muchos privilegios', async() => {
      const manyPrivileges = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        user_id: 1,
        privilege_id: i + 1,
        privileges: {
          name: `Privilegio ${i + 1}`,
          codename: `privilege_${i + 1}`
        }
      }));

      userprivileges.findAll.mockResolvedValue(manyPrivileges);

      const result = await getAllUserPrivileges(1);

      expect(result).toHaveLength(100);
      expect(result[0].privileges.name).toBe('Privilegio 1');
      expect(result[99].privileges.name).toBe('Privilegio 100');
    });

    test('getAllUserPrivileges con userId tipo string numerico', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges('1');

      expect(userprivileges.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id: '1'
          }
        })
      );
    });

    test('getOneUserPrivilege con codeName vacio', async() => {
      userprivileges.count.mockResolvedValue(0);

      const result = await getOneUserPrivilege(1, '');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: privileges,
              where: {
                codeName: ''
              }
            }
          ]
        })
      );
      expect(result).toBe(false);
    });

    test('getOneUserPrivilege con codeName especial', async() => {
      userprivileges.count.mockResolvedValue(1);

      await getOneUserPrivilege(1, 'special-privilege_123');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: privileges,
              where: {
                codeName: 'special-privilege_123'
              }
            }
          ]
        })
      );
    });

    test('addNewUserPrivilege con campos extra', async() => {
      const extraData = {
        user_id: 1,
        privilege_id: 1,
        active: 1,
        customField: 'custom',
        anotherField: 123
      };

      userprivileges.create.mockResolvedValue({ id: 1, ...extraData });

      await addNewUserPrivilege(extraData);

      expect(userprivileges.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customField: 'custom',
          anotherField: 123
        })
      );
    });

    test('deleteUserPrivilege con id negativo', async() => {
      userprivileges.destroy.mockResolvedValue(0);

      const result = await deleteUserPrivilege(-1, -2);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: -1,
          privilegeId: -2
        }
      });
      expect(result).toEqual({
        data: {
          msg: 'NOT_FOUND'
        }
      });
    });

    test('deleteUserPrivilege con id 0', async() => {
      userprivileges.destroy.mockResolvedValue(0);

      await deleteUserPrivilege(0, 0);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 0,
          privilegeId: 0
        }
      });
    });

    test('getAllUserPrivileges debe retornar estructura correcta con relaciones anidadas', async() => {
      const mockPrivileges = [
        {
          id: 1,
          user_id: 1,
          privilege_id: 1,
          privileges: {
            name: 'Admin Panel',
            codename: 'admin_panel'
          }
        }
      ];

      userprivileges.findAll.mockResolvedValue(mockPrivileges);

      const result = await getAllUserPrivileges(1);

      expect(result[0]).toHaveProperty('privileges');
      expect(result[0].privileges).toHaveProperty('name');
      expect(result[0].privileges).toHaveProperty('codename');
    });

    test('getOneUserPrivilege debe manejar count mayor a 1', async() => {
      // En caso de que haya duplicados (aunque no deberia)
      userprivileges.count.mockResolvedValue(3);

      const result = await getOneUserPrivilege(1, 'view_users');

      expect(result).toBe(true);
    });

    test('addNewUserPrivilege con active como 0', async() => {
      const inactivePrivilege = {
        user_id: 1,
        privilege_id: 1,
        active: 0
      };

      userprivileges.create.mockResolvedValue({ id: 1, ...inactivePrivilege });

      const result = await addNewUserPrivilege(inactivePrivilege);

      expect(result.active).toBe(0);
    });

    test('getAllUserPrivileges sin privilegios debe retornar array vacio no null', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      const result = await getAllUserPrivileges(1);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });

  // ============================================
  // Tests de validacion de parametros
  // ============================================
  describe('Validacion de parametros', () => {
    test('getAllUserPrivileges debe aceptar userId numerico', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges(123);

      expect(userprivileges.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id: 123
          }
        })
      );
    });

    test('getOneUserPrivilege debe aceptar userId y codeName como parametros', async() => {
      userprivileges.count.mockResolvedValue(1);

      await getOneUserPrivilege(99, 'test_privilege');

      expect(userprivileges.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 99
          },
          include: [
            {
              model: privileges,
              where: {
                codeName: 'test_privilege'
              }
            }
          ]
        })
      );
    });

    test('addNewUserPrivilege debe aceptar objeto como body', async() => {
      const body = {
        user_id: 1,
        privilege_id: 2,
        active: 1
      };

      userprivileges.create.mockResolvedValue({ id: 1, ...body });

      await addNewUserPrivilege(body);

      expect(userprivileges.create).toHaveBeenCalledWith(body);
      expect(typeof body).toBe('object');
    });

    test('deleteUserPrivilege debe aceptar userId y privilegeId como parametros', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      await deleteUserPrivilege(10, 20);

      expect(userprivileges.destroy).toHaveBeenCalledWith({
        where: {
          userId: 10,
          privilegeId: 20
        }
      });
    });

    test('getAllUserPrivileges debe pasar todos los atributos requeridos', async() => {
      userprivileges.findAll.mockResolvedValue([]);

      await getAllUserPrivileges(1);

      const callArgs = userprivileges.findAll.mock.calls[0][0];
      expect(callArgs).toHaveProperty('attributes');
      expect(callArgs).toHaveProperty('where');
      expect(callArgs).toHaveProperty('include');
      expect(callArgs.attributes).toEqual(['id', 'user_id', 'privilege_id']);
    });

    test('getOneUserPrivilege debe construir query correctamente', async() => {
      userprivileges.count.mockResolvedValue(0);

      await getOneUserPrivilege(5, 'admin');

      const callArgs = userprivileges.count.mock.calls[0][0];
      expect(callArgs).toHaveProperty('where');
      expect(callArgs).toHaveProperty('include');
      expect(callArgs.where).toHaveProperty('userId', 5);
      expect(callArgs.include[0]).toHaveProperty('model', privileges);
      expect(callArgs.include[0].where).toHaveProperty('codeName', 'admin');
    });
  });

  // ============================================
  // Tests de integracion entre funciones
  // ============================================
  describe('Integracion entre funciones', () => {
    test('despues de addNewUserPrivilege, getAllUserPrivileges deberia incluir el nuevo privilegio', async() => {
      const newPrivilege = {
        user_id: 1,
        privilege_id: 3
      };

      const createdPrivilege = {
        id: 1,
        ...newPrivilege
      };

      userprivileges.create.mockResolvedValue(createdPrivilege);

      await addNewUserPrivilege(newPrivilege);

      const mockAllPrivileges = [
        {
          id: 1,
          user_id: 1,
          privilege_id: 3,
          privileges: {
            name: 'New Privilege',
            codename: 'new_privilege'
          }
        }
      ];

      userprivileges.findAll.mockResolvedValue(mockAllPrivileges);

      const allPrivileges = await getAllUserPrivileges(1);

      expect(allPrivileges).toHaveLength(1);
      expect(allPrivileges[0].privilege_id).toBe(3);
    });

    test('despues de deleteUserPrivilege exitoso, getOneUserPrivilege deberia retornar false', async() => {
      userprivileges.destroy.mockResolvedValue(1);

      const deleteResult = await deleteUserPrivilege(1, 2);

      expect(deleteResult).toBe(1);

      userprivileges.count.mockResolvedValue(0);

      const checkResult = await getOneUserPrivilege(1, 'deleted_privilege');

      expect(checkResult).toBe(false);
    });

    test('si deleteUserPrivilege falla, el privilegio deberia seguir existiendo en getOneUserPrivilege', async() => {
      userprivileges.destroy.mockResolvedValue(0);

      const deleteResult = await deleteUserPrivilege(1, 2);

      expect(deleteResult).toEqual({
        data: {
          msg: 'NOT_FOUND'
        }
      });

      userprivileges.count.mockResolvedValue(1);

      const checkResult = await getOneUserPrivilege(1, 'existing_privilege');

      expect(checkResult).toBe(true);
    });
  });
});
