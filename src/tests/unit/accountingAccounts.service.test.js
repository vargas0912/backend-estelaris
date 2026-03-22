'use strict';

const { accountingAccounts } = require('../../models/index');
const {
  getAllAccounts,
  getAccountsTree,
  getAccount,
  addAccount,
  updateAccount,
  deleteAccount
} = require('../../services/accountingAccounts');

jest.mock('../../models/index', () => ({
  accountingAccounts: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  }
}));

describe('AccountingAccounts Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getAllAccounts ──────────────────────────────────────────────────────────

  describe('getAllAccounts', () => {
    test('debe retornar lista de cuentas', async () => {
      const mockAccounts = [
        { id: 1, code: '100', name: 'Activo', type: 'activo', level: 1, parent_id: null },
        { id: 2, code: '110', name: 'Activo Circulante', type: 'activo', level: 2, parent_id: 1 }
      ];
      accountingAccounts.findAll.mockResolvedValue(mockAccounts);

      const result = await getAllAccounts();

      expect(accountingAccounts.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAccounts);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay cuentas', async () => {
      accountingAccounts.findAll.mockResolvedValue([]);

      const result = await getAllAccounts();

      expect(result).toEqual([]);
    });

    test('debe incluir cuenta padre en la consulta', async () => {
      accountingAccounts.findAll.mockResolvedValue([]);

      await getAllAccounts();

      expect(accountingAccounts.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ as: 'parent' })
          ])
        })
      );
    });

    test('debe ordenar por code ASC', async () => {
      accountingAccounts.findAll.mockResolvedValue([]);

      await getAllAccounts();

      expect(accountingAccounts.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['code', 'ASC']]
        })
      );
    });
  });

  // ─── getAccountsTree ────────────────────────────────────────────────────────

  describe('getAccountsTree', () => {
    test('debe construir árbol anidado correctamente', async () => {
      const mockAccounts = [
        { id: 1, code: '100', name: 'Activo', level: 1, parent_id: null, active: true, toJSON: () => ({ id: 1, code: '100', name: 'Activo', level: 1, parent_id: null }) },
        { id: 2, code: '110', name: 'Activo Circulante', level: 2, parent_id: 1, active: true, toJSON: () => ({ id: 2, code: '110', name: 'Activo Circulante', level: 2, parent_id: 1 }) },
        { id: 3, code: '111', name: 'Caja', level: 3, parent_id: 2, active: true, toJSON: () => ({ id: 3, code: '111', name: 'Caja', level: 3, parent_id: 2 }) }
      ];
      accountingAccounts.findAll.mockResolvedValue(mockAccounts);

      const result = await getAccountsTree();

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('100');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].code).toBe('110');
      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0].code).toBe('111');
    });

    test('debe retornar array vacío si no hay cuentas activas', async () => {
      accountingAccounts.findAll.mockResolvedValue([]);

      const result = await getAccountsTree();

      expect(result).toEqual([]);
    });

    test('debe filtrar solo cuentas activas', async () => {
      accountingAccounts.findAll.mockResolvedValue([]);

      await getAccountsTree();

      expect(accountingAccounts.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true }
        })
      );
    });

    test('nodos raíz son los que tienen parent_id null', async () => {
      const mockAccounts = [
        { id: 1, parent_id: null, toJSON: () => ({ id: 1, parent_id: null }) },
        { id: 2, parent_id: null, toJSON: () => ({ id: 2, parent_id: null }) },
        { id: 3, parent_id: 1, toJSON: () => ({ id: 3, parent_id: 1 }) }
      ];
      accountingAccounts.findAll.mockResolvedValue(mockAccounts);

      const result = await getAccountsTree();

      expect(result).toHaveLength(2);
    });
  });

  // ─── getAccount ─────────────────────────────────────────────────────────────

  describe('getAccount', () => {
    test('debe retornar una cuenta por id', async () => {
      const mockAccount = { id: 1, code: '111', name: 'Caja', type: 'activo' };
      accountingAccounts.findOne.mockResolvedValue(mockAccount);

      const result = await getAccount(1);

      expect(accountingAccounts.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAccount);
    });

    test('debe retornar null si la cuenta no existe', async () => {
      accountingAccounts.findOne.mockResolvedValue(null);

      const result = await getAccount(999);

      expect(result).toBeNull();
    });
  });

  // ─── addAccount ─────────────────────────────────────────────────────────────

  describe('addAccount', () => {
    test('debe crear una cuenta válida sin parent', async () => {
      const body = { code: 'TEST-001', name: 'Cuenta Test', type: 'activo', nature: 'deudora', level: 1 };
      const created = { id: 50, ...body };

      accountingAccounts.findOne.mockResolvedValue(null); // no duplicado
      accountingAccounts.create.mockResolvedValue(created);

      const result = await addAccount(body);

      expect(accountingAccounts.create).toHaveBeenCalledWith(body);
      expect(result).toEqual(created);
    });

    test('debe lanzar error 422 si el código ya existe', async () => {
      accountingAccounts.findOne.mockResolvedValue({ id: 1, code: 'TEST-001' });

      await expect(addAccount({ code: 'TEST-001', name: 'Dup', type: 'activo', nature: 'deudora', level: 1 }))
        .rejects.toMatchObject({ message: 'CODE_DUPLICATE', status: 422 });
    });

    test('debe lanzar error 404 si parent_id no existe', async () => {
      accountingAccounts.findOne.mockResolvedValue(null); // código no duplicado
      accountingAccounts.findByPk.mockResolvedValue(null); // padre no encontrado

      await expect(addAccount({ code: 'TEST-002', name: 'Huérfana', type: 'activo', nature: 'deudora', level: 2, parent_id: 999 }))
        .rejects.toMatchObject({ message: 'PARENT_NOT_FOUND', status: 404 });
    });

    test('debe lanzar error 422 si level no coincide con parent.level + 1', async () => {
      accountingAccounts.findOne.mockResolvedValue(null);
      accountingAccounts.findByPk.mockResolvedValue({ id: 1, level: 1 }); // padre nivel 1

      await expect(addAccount({ code: 'TEST-003', name: 'Nivel malo', type: 'activo', nature: 'deudora', level: 3, parent_id: 1 }))
        .rejects.toMatchObject({ message: 'PARENT_LEVEL_MISMATCH', status: 422 });
    });

    test('debe crear subcuenta con parent válido y level correcto', async () => {
      const body = { code: 'TEST-004', name: 'Sub', type: 'activo', nature: 'deudora', level: 2, parent_id: 1 };
      const created = { id: 51, ...body };

      accountingAccounts.findOne.mockResolvedValue(null);
      accountingAccounts.findByPk.mockResolvedValue({ id: 1, level: 1 });
      accountingAccounts.create.mockResolvedValue(created);

      const result = await addAccount(body);

      expect(result.parent_id).toBe(1);
      expect(result.level).toBe(2);
    });
  });

  // ─── updateAccount ──────────────────────────────────────────────────────────

  describe('updateAccount', () => {
    test('debe actualizar una cuenta existente', async () => {
      const mockAccount = {
        id: 1,
        code: 'TEST-001',
        name: 'Original',
        type: 'activo',
        nature: 'deudora',
        level: 1,
        parent_id: null,
        allows_movements: false,
        active: true,
        save: jest.fn().mockResolvedValue({ id: 1, name: 'Modificada' })
      };

      accountingAccounts.findByPk.mockResolvedValue(mockAccount);
      accountingAccounts.findOne.mockResolvedValue(null); // código no duplicado

      await updateAccount(1, { name: 'Modificada' });

      expect(mockAccount.name).toBe('Modificada');
      expect(mockAccount.save).toHaveBeenCalled();
    });

    test('debe retornar null si la cuenta no existe', async () => {
      accountingAccounts.findByPk.mockResolvedValue(null);

      const result = await updateAccount(999, { name: 'Test' });

      expect(result).toBeNull();
    });

    test('debe lanzar 422 si el nuevo código ya está en uso', async () => {
      const mockAccount = { id: 1, code: 'TEST-001', save: jest.fn() };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);
      accountingAccounts.findOne.mockResolvedValue({ id: 2, code: 'TEST-TAKEN' }); // duplicado

      await expect(updateAccount(1, { code: 'TEST-TAKEN' }))
        .rejects.toMatchObject({ message: 'CODE_DUPLICATE', status: 422 });
    });

    test('no debe verificar duplicado si el código no cambia', async () => {
      const mockAccount = {
        id: 1,
        code: 'TEST-001',
        name: 'Original',
        type: 'activo',
        nature: 'deudora',
        level: 1,
        parent_id: null,
        allows_movements: false,
        active: true,
        save: jest.fn().mockResolvedValue({})
      };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);

      await updateAccount(1, { name: 'Nuevo Nombre' });

      expect(accountingAccounts.findOne).not.toHaveBeenCalled();
    });

    test('debe actualizar active a false', async () => {
      const mockAccount = {
        id: 1,
        code: 'T',
        name: 'T',
        type: 'activo',
        nature: 'deudora',
        level: 1,
        parent_id: null,
        allows_movements: false,
        active: true,
        save: jest.fn().mockResolvedValue({})
      };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);

      await updateAccount(1, { active: false });

      expect(mockAccount.active).toBe(false);
    });
  });

  // ─── deleteAccount ──────────────────────────────────────────────────────────

  describe('deleteAccount', () => {
    test('debe desactivar una cuenta no-system sin hijos', async () => {
      const mockAccount = {
        id: 50,
        is_system: false,
        update: jest.fn().mockResolvedValue({ id: 50, active: false })
      };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);
      accountingAccounts.count.mockResolvedValue(0);

      const result = await deleteAccount(50);

      expect(mockAccount.update).toHaveBeenCalledWith({ active: false });
      expect(result).toEqual({ id: 50, active: false });
    });

    test('debe retornar null si la cuenta no existe', async () => {
      accountingAccounts.findByPk.mockResolvedValue(null);

      const result = await deleteAccount(999);

      expect(result).toBeNull();
    });

    test('debe lanzar 422 si la cuenta es de sistema', async () => {
      accountingAccounts.findByPk.mockResolvedValue({ id: 1, is_system: true });

      await expect(deleteAccount(1))
        .rejects.toMatchObject({ message: 'SYSTEM_ACCOUNT_CANNOT_BE_DELETED', status: 422 });
    });

    test('debe lanzar 422 si la cuenta tiene cuentas hijas', async () => {
      accountingAccounts.findByPk.mockResolvedValue({ id: 1, is_system: false });
      accountingAccounts.count.mockResolvedValue(2);

      await expect(deleteAccount(1))
        .rejects.toMatchObject({ message: 'ACCOUNT_HAS_CHILDREN', status: 422 });
    });

    test('debe verificar solo hijos activos con el parent_id correcto', async () => {
      const mockAccount = { id: 5, is_system: false, update: jest.fn().mockResolvedValue({}) };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);
      accountingAccounts.count.mockResolvedValue(0);

      await deleteAccount(5);

      expect(accountingAccounts.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { parent_id: 5, active: true } })
      );
    });
  });

  // ─── Manejo de errores ───────────────────────────────────────────────────────

  describe('Manejo de errores', () => {
    test('getAllAccounts debe propagar error de BD', async () => {
      accountingAccounts.findAll.mockRejectedValue(new Error('DB error'));

      await expect(getAllAccounts()).rejects.toThrow('DB error');
    });

    test('addAccount debe propagar error de BD al crear', async () => {
      accountingAccounts.findOne.mockResolvedValue(null);
      accountingAccounts.create.mockRejectedValue(new Error('Insert failed'));

      await expect(addAccount({ code: 'X', name: 'X', type: 'activo', nature: 'deudora', level: 1 }))
        .rejects.toThrow('Insert failed');
    });

    test('updateAccount debe propagar error de save', async () => {
      const mockAccount = {
        id: 1,
        code: 'T',
        name: 'T',
        type: 'activo',
        nature: 'deudora',
        level: 1,
        parent_id: null,
        allows_movements: false,
        active: true,
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };
      accountingAccounts.findByPk.mockResolvedValue(mockAccount);

      await expect(updateAccount(1, { name: 'X' })).rejects.toThrow('Save failed');
    });
  });
});
