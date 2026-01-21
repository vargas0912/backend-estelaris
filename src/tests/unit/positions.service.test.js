const { positions } = require('../../models/index');
const {
  getAllPositions,
  getPosition,
  addNewPosition,
  updatePosition,
  deletePosition
} = require('../../services/positions');

// Mock del modelo positions
jest.mock('../../models/index', () => ({
  positions: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('Positions Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPositions', () => {
    test('debe retornar lista de puestos', async() => {
      const mockPositions = [
        { id: 1, name: 'Vendedor', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Programador', created_at: new Date(), updated_at: new Date() }
      ];

      positions.findAll.mockResolvedValue(mockPositions);

      const result = await getAllPositions();

      expect(positions.findAll).toHaveBeenCalledTimes(1);
      expect(positions.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at']
      });
      expect(result).toEqual(mockPositions);
    });

    test('debe retornar array vacio si no hay puestos', async() => {
      positions.findAll.mockResolvedValue([]);

      const result = await getAllPositions();

      expect(result).toEqual([]);
    });
  });

  describe('getPosition', () => {
    test('debe retornar un puesto por id', async() => {
      const mockPosition = { id: 1, name: 'Vendedor', created_at: new Date(), updated_at: new Date() };

      positions.findOne.mockResolvedValue(mockPosition);

      const result = await getPosition(1);

      expect(positions.findOne).toHaveBeenCalledTimes(1);
      expect(positions.findOne).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        where: { id: 1 }
      });
      expect(result).toEqual(mockPosition);
    });

    test('debe retornar null si el puesto no existe', async() => {
      positions.findOne.mockResolvedValue(null);

      const result = await getPosition(999);

      expect(result).toBeNull();
    });
  });

  describe('addNewPosition', () => {
    test('debe crear un nuevo puesto', async() => {
      const newPosition = { name: 'Nuevo Puesto' };
      const createdPosition = { id: 1, ...newPosition, created_at: new Date(), updated_at: new Date() };

      positions.create.mockResolvedValue(createdPosition);

      const result = await addNewPosition(newPosition);

      expect(positions.create).toHaveBeenCalledTimes(1);
      expect(positions.create).toHaveBeenCalledWith(newPosition);
      expect(result).toEqual(createdPosition);
    });
  });

  describe('updatePosition', () => {
    test('debe actualizar un puesto existente', async() => {
      const mockPosition = {
        id: 1,
        name: 'Vendedor',
        save: jest.fn().mockResolvedValue({ id: 1, name: 'Vendedor Modificado' })
      };

      positions.findByPk.mockResolvedValue(mockPosition);

      const result = await updatePosition(1, { name: 'Vendedor Modificado' });

      expect(positions.findByPk).toHaveBeenCalledWith(1);
      expect(mockPosition.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Vendedor Modificado' });
    });

    test('debe retornar NOT_FOUND si el puesto no existe', async() => {
      positions.findByPk.mockResolvedValue(null);

      const result = await updatePosition(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener el nombre si no se proporciona uno nuevo', async() => {
      const mockPosition = {
        id: 1,
        name: 'Vendedor Original',
        save: jest.fn().mockResolvedValue({ id: 1, name: 'Vendedor Original' })
      };

      positions.findByPk.mockResolvedValue(mockPosition);

      await updatePosition(1, {});

      expect(mockPosition.name).toBe('Vendedor Original');
    });
  });

  describe('deletePosition', () => {
    test('debe eliminar un puesto', async() => {
      positions.destroy.mockResolvedValue(1);

      const result = await deletePosition(1);

      expect(positions.destroy).toHaveBeenCalledTimes(1);
      expect(positions.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el puesto no existe', async() => {
      positions.destroy.mockResolvedValue(0);

      const result = await deletePosition(999);

      expect(result).toBe(0);
    });
  });
});
