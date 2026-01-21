const { branches } = require('../../models/index');
const {
  getAllBranches,
  getBranch,
  addNewBranch,
  updateBranch,
  deleteBranch
} = require('../../services/branches');

// Mock del modelo branches y municipalities
jest.mock('../../models/index', () => ({
  branches: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  municipalities: {}
}));

describe('Branches Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBranches', () => {
    test('debe retornar lista de sucursales', async() => {
      const mockBranches = [
        { id: 1, name: 'Sucursal Centro', address: 'Av. Principal 100', phone: '5551001000' },
        { id: 2, name: 'Sucursal Norte', address: 'Blvd. Norte 200', phone: '5552002000' }
      ];

      branches.findAll.mockResolvedValue(mockBranches);

      const result = await getAllBranches();

      expect(branches.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBranches);
    });

    test('debe retornar array vacio si no hay sucursales', async() => {
      branches.findAll.mockResolvedValue([]);

      const result = await getAllBranches();

      expect(result).toEqual([]);
    });
  });

  describe('getBranch', () => {
    test('debe retornar una sucursal por id', async() => {
      const mockBranch = { id: 1, name: 'Sucursal Centro', address: 'Av. Principal 100', phone: '5551001000' };

      branches.findOne.mockResolvedValue(mockBranch);

      const result = await getBranch(1);

      expect(branches.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBranch);
    });

    test('debe retornar null si la sucursal no existe', async() => {
      branches.findOne.mockResolvedValue(null);

      const result = await getBranch(999);

      expect(result).toBeNull();
    });
  });

  describe('addNewBranch', () => {
    test('debe crear una nueva sucursal', async() => {
      const newBranch = { name: 'Nueva Sucursal', address: 'Calle Nueva 123', phone: '5554004000', municipality_id: 1 };
      const createdBranch = { id: 1, ...newBranch };

      branches.create.mockResolvedValue(createdBranch);

      const result = await addNewBranch(newBranch);

      expect(branches.create).toHaveBeenCalledTimes(1);
      expect(branches.create).toHaveBeenCalledWith(newBranch);
      expect(result).toEqual(createdBranch);
    });
  });

  describe('updateBranch', () => {
    test('debe actualizar una sucursal existente', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Centro',
        address: 'Av. Principal 100',
        phone: '5551001000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Sucursal Modificada',
          address: 'Calle Nueva 456',
          phone: '5559999999'
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      const result = await updateBranch(1, {
        name: 'Sucursal Modificada',
        address: 'Calle Nueva 456',
        phone: '5559999999'
      });

      expect(branches.findByPk).toHaveBeenCalledWith(1);
      expect(mockBranch.save).toHaveBeenCalled();
      expect(result.name).toBe('Sucursal Modificada');
    });

    test('debe retornar NOT_FOUND si la sucursal no existe', async() => {
      branches.findByPk.mockResolvedValue(null);

      const result = await updateBranch(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Sucursal Original',
          address: 'Direccion Original',
          phone: '5550000000'
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, {});

      expect(mockBranch.name).toBe('Sucursal Original');
      expect(mockBranch.address).toBe('Direccion Original');
    });
  });

  describe('deleteBranch', () => {
    test('debe eliminar una sucursal', async() => {
      branches.destroy.mockResolvedValue(1);

      const result = await deleteBranch(1);

      expect(branches.destroy).toHaveBeenCalledTimes(1);
      expect(branches.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si la sucursal no existe', async() => {
      branches.destroy.mockResolvedValue(0);

      const result = await deleteBranch(999);

      expect(result).toBe(0);
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getAllBranches debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      branches.findAll.mockRejectedValue(dbError);

      await expect(getAllBranches()).rejects.toThrow('Database connection failed');
    });

    test('getBranch debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      branches.findOne.mockRejectedValue(dbError);

      await expect(getBranch(1)).rejects.toThrow('Database query failed');
    });

    test('addNewBranch debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      branches.create.mockRejectedValue(dbError);

      await expect(addNewBranch({ name: 'Test' })).rejects.toThrow('Insert failed');
    });

    test('updateBranch debe propagar error de BD en findByPk', async() => {
      const dbError = new Error('FindByPk failed');
      branches.findByPk.mockRejectedValue(dbError);

      await expect(updateBranch(1, { name: 'Test' })).rejects.toThrow('FindByPk failed');
    });

    test('updateBranch debe propagar error de BD en save', async() => {
      const dbError = new Error('Save failed');
      const mockBranch = {
        id: 1,
        name: 'Sucursal',
        address: 'Direccion',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockRejectedValue(dbError)
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await expect(updateBranch(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deleteBranch debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      branches.destroy.mockRejectedValue(dbError);

      await expect(deleteBranch(1)).rejects.toThrow('Delete failed');
    });
  });

  // ============================================
  // Tests de validación de parámetros
  // ============================================
  describe('Validacion de parametros', () => {
    test('getBranch debe llamar findOne con el id correcto', async() => {
      branches.findOne.mockResolvedValue(null);

      await getBranch(42);

      expect(branches.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 }
        })
      );
    });

    test('deleteBranch debe llamar destroy con el id correcto', async() => {
      branches.destroy.mockResolvedValue(1);

      await deleteBranch(123);

      expect(branches.destroy).toHaveBeenCalledWith({ where: { id: 123 } });
    });

    test('addNewBranch debe pasar el body completo a create', async() => {
      const fullBranchData = {
        name: 'Sucursal Completa',
        address: 'Calle Completa 100',
        phone: '5551234567',
        municipality_id: 5,
        opening_date: '2024-01-15'
      };

      branches.create.mockResolvedValue({ id: 1, ...fullBranchData });

      await addNewBranch(fullBranchData);

      expect(branches.create).toHaveBeenCalledWith(fullBranchData);
    });
  });

  // ============================================
  // Tests de actualizaciones parciales
  // ============================================
  describe('Actualizaciones parciales', () => {
    test('updateBranch debe actualizar solo el nombre', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nuevo Nombre',
          address: 'Direccion Original',
          phone: '5550000000'
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, { name: 'Nuevo Nombre' });

      expect(mockBranch.name).toBe('Nuevo Nombre');
      expect(mockBranch.address).toBe('Direccion Original');
      expect(mockBranch.phone).toBe('5550000000');
    });

    test('updateBranch debe actualizar solo la direccion', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Sucursal Original',
          address: 'Nueva Direccion',
          phone: '5550000000'
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, { address: 'Nueva Direccion' });

      expect(mockBranch.name).toBe('Sucursal Original');
      expect(mockBranch.address).toBe('Nueva Direccion');
    });

    test('updateBranch debe actualizar solo el telefono', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Sucursal Original',
          address: 'Direccion Original',
          phone: '5559999999'
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, { phone: '5559999999' });

      expect(mockBranch.phone).toBe('5559999999');
    });

    test('updateBranch debe actualizar el municipio', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Sucursal Original',
          address: 'Direccion Original',
          phone: '5550000000',
          municipality: 5
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, { municipality: 5 });

      expect(mockBranch.municipality).toBe(5);
    });

    test('updateBranch debe actualizar todos los campos', async() => {
      const mockBranch = {
        id: 1,
        name: 'Sucursal Original',
        address: 'Direccion Original',
        phone: '5550000000',
        municipality: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nombre Nuevo',
          address: 'Direccion Nueva',
          phone: '5559999999',
          municipality: 10
        })
      };

      branches.findByPk.mockResolvedValue(mockBranch);

      await updateBranch(1, {
        name: 'Nombre Nuevo',
        address: 'Direccion Nueva',
        phone: '5559999999',
        municipality: 10
      });

      expect(mockBranch.name).toBe('Nombre Nuevo');
      expect(mockBranch.address).toBe('Direccion Nueva');
      expect(mockBranch.phone).toBe('5559999999');
      expect(mockBranch.municipality).toBe(10);
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getAllBranches con muchas sucursales', async() => {
      const manyBranches = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Sucursal ${i + 1}`,
        address: `Direccion ${i + 1}`,
        phone: `555000${String(i).padStart(4, '0')}`
      }));

      branches.findAll.mockResolvedValue(manyBranches);

      const result = await getAllBranches();

      expect(result).toHaveLength(100);
      expect(result[0].name).toBe('Sucursal 1');
      expect(result[99].name).toBe('Sucursal 100');
    });

    test('addNewBranch con datos minimos', async() => {
      const minimalData = { name: 'Min' };
      branches.create.mockResolvedValue({ id: 1, ...minimalData });

      const result = await addNewBranch(minimalData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Min');
    });

    test('getBranch con id tipo string numerico', async() => {
      const mockBranch = { id: 1, name: 'Sucursal' };
      branches.findOne.mockResolvedValue(mockBranch);

      // El servicio recibe el id como viene del controller
      await getBranch('1');

      expect(branches.findOne).toHaveBeenCalled();
    });

    test('deleteBranch debe retornar numero de filas eliminadas', async() => {
      branches.destroy.mockResolvedValue(1);

      const result = await deleteBranch(1);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });
  });
});
