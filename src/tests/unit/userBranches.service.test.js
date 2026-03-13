const { userBranches } = require('../../models/index');
const {
  getBranchesByUser,
  getUsersByBranch,
  getUserBranch,
  assignBranch,
  removeBranch
} = require('../../services/userBranches');

jest.mock('../../models/index', () => ({
  userBranches: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  branches: {
    findAll: jest.fn()
  },
  users: {
    findAll: jest.fn()
  }
}));

describe('UserBranches Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBranchesByUser', () => {
    test('debe retornar sucursales de un usuario', async() => {
      const mockUserBranches = [
        { user_id: 1, branch: { id: 1, name: 'Sucursal Centro' } },
        { user_id: 1, branch: { id: 2, name: 'Sucursal Norte' } }
      ];
      userBranches.findAll.mockResolvedValue(mockUserBranches);

      const result = await getBranchesByUser(1);

      expect(result).toEqual(mockUserBranches);
      expect(userBranches.findAll).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: expect.arrayContaining([
          expect.objectContaining({ model: expect.any(Object), as: 'branch' })
        ])
      });
    });

    test('debe retornar array vacío sin sucursales', async() => {
      userBranches.findAll.mockResolvedValue([]);

      const result = await getBranchesByUser(999);

      expect(result).toEqual([]);
    });
  });

  describe('getUsersByBranch', () => {
    test('debe retornar usuarios de una sucursal', async() => {
      const mockBranchUsers = [
        { branch_id: 1, user: { id: 1, name: 'Usuario 1' } }
      ];
      userBranches.findAll.mockResolvedValue(mockBranchUsers);

      const result = await getUsersByBranch(1);

      expect(result).toEqual(mockBranchUsers);
    });

    test('debe retornar array vacío sin usuarios', async() => {
      userBranches.findAll.mockResolvedValue([]);

      const result = await getUsersByBranch(999);

      expect(result).toEqual([]);
    });
  });

  describe('getUserBranch', () => {
    test('debe retornar relación usuario-sucursal por id', async() => {
      const mockUserBranch = {
        id: 1,
        user_id: 1,
        branch_id: 1,
        branch: { id: 1, name: 'Centro' },
        user: { id: 1, name: 'Usuario 1' }
      };
      userBranches.findOne.mockResolvedValue(mockUserBranch);

      const result = await getUserBranch(1);

      expect(result).toEqual(mockUserBranch);
    });

    test('debe retornar null si no existe', async() => {
      userBranches.findOne.mockResolvedValue(null);

      const result = await getUserBranch(999);

      expect(result).toBeNull();
    });
  });

  describe('assignBranch', () => {
    test('debe asignar sucursal exitosamente', async() => {
      userBranches.findOne.mockResolvedValue(null);
      const newAssignment = { user_id: 1, branch_id: 1 };
      userBranches.create.mockResolvedValue(newAssignment);

      const result = await assignBranch(newAssignment);

      expect(userBranches.create).toHaveBeenCalledWith(newAssignment);
      expect(result).toEqual(newAssignment);
    });

    test('debe retornar error si ya existe asignación', async() => {
      const existingAssignment = { user_id: 1, branch_id: 1 };
      userBranches.findOne.mockResolvedValue(existingAssignment);

      const result = await assignBranch(existingAssignment);

      expect(result).toEqual({ error: 'ASSIGNMENT_ALREADY_EXISTS' });
      expect(userBranches.create).not.toHaveBeenCalled();
    });
  });

  describe('removeBranch', () => {
    test('debe eliminar asignación exitosamente', async() => {
      userBranches.destroy.mockResolvedValue(1);

      const result = await removeBranch(1);

      expect(userBranches.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si no existe', async() => {
      userBranches.destroy.mockResolvedValue(0);

      const result = await removeBranch(999);

      expect(result).toBe(0);
    });
  });

  describe('Manejo de errores', () => {
    test('getBranchesByUser debe propagar error de BD', async() => {
      userBranches.findAll.mockRejectedValue(new Error('Database error'));

      await expect(getBranchesByUser(1)).rejects.toThrow('Database error');
    });

    test('getUsersByBranch debe propagar error de BD', async() => {
      userBranches.findAll.mockRejectedValue(new Error('Database error'));

      await expect(getUsersByBranch(1)).rejects.toThrow('Database error');
    });

    test('getUserBranch debe propagar error de BD', async() => {
      userBranches.findOne.mockRejectedValue(new Error('Database error'));

      await expect(getUserBranch(1)).rejects.toThrow('Database error');
    });

    test('assignBranch debe propagar error de BD', async() => {
      userBranches.findOne.mockRejectedValue(new Error('Database error'));

      await expect(assignBranch({ user_id: 1, branch_id: 1 })).rejects.toThrow('Database error');
    });

    test('removeBranch debe propagar error de BD', async() => {
      userBranches.destroy.mockRejectedValue(new Error('Database error'));

      await expect(removeBranch(1)).rejects.toThrow('Database error');
    });
  });
});
