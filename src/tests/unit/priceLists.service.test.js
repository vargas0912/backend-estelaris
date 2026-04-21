const { priceLists } = require('../../models/index');
const {
  getAllPriceLists,
  getPriceList,
  addNewPriceList,
  updatePriceList,
  deletePriceList
} = require('../../services/priceLists');

// Mock del modelo
jest.mock('../../models/index', () => ({
  priceLists: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('PriceLists Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPriceLists', () => {
    test('debe retornar lista de listas de precios', async() => {
      const mockPriceLists = [
        { id: 1, name: 'Público', discount_percent: 0, priority: 1 },
        { id: 2, name: 'Mayoreo', discount_percent: 10, priority: 2 }
      ];

      priceLists.findAndCountAll.mockResolvedValue({ count: 2, rows: mockPriceLists });

      const result = await getAllPriceLists();

      expect(priceLists.findAndCountAll).toHaveBeenCalledTimes(1);
      expect(result.priceLists).toEqual(mockPriceLists);
      expect(result.priceLists).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    test('debe retornar array vacío si no hay listas', async() => {
      priceLists.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const result = await getAllPriceLists();

      expect(result.priceLists).toEqual([]);
      expect(result.priceLists).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    test('debe ordenar por prioridad descendente', async() => {
      priceLists.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await getAllPriceLists();

      expect(priceLists.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['priority', 'DESC'], ['name', 'ASC']]
        })
      );
    });
  });

  describe('getPriceList', () => {
    test('debe retornar una lista de precios por id', async() => {
      const mockPriceList = { id: 1, name: 'Público', discount_percent: 0 };

      priceLists.findOne.mockResolvedValue(mockPriceList);

      const result = await getPriceList(1);

      expect(priceLists.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPriceList);
    });

    test('debe retornar null si la lista no existe', async() => {
      priceLists.findOne.mockResolvedValue(null);

      const result = await getPriceList(999);

      expect(result).toBeNull();
    });
  });

  describe('addNewPriceList', () => {
    test('debe crear una nueva lista de precios', async() => {
      const newPriceList = { name: 'VIP', discount_percent: 15 };
      const createdPriceList = { id: 1, ...newPriceList };

      priceLists.create.mockResolvedValue(createdPriceList);

      const result = await addNewPriceList(newPriceList);

      expect(priceLists.create).toHaveBeenCalledTimes(1);
      expect(priceLists.create).toHaveBeenCalledWith(newPriceList);
      expect(result).toEqual(createdPriceList);
    });

    test('debe crear lista con campos mínimos', async() => {
      const minimalPriceList = { name: 'Básica' };
      const createdPriceList = { id: 1, ...minimalPriceList, discount_percent: 0 };

      priceLists.create.mockResolvedValue(createdPriceList);

      const result = await addNewPriceList(minimalPriceList);

      expect(result.name).toBe('Básica');
    });
  });

  describe('updatePriceList', () => {
    test('debe actualizar una lista existente', async() => {
      const mockPriceList = {
        id: 1,
        name: 'Público',
        discount_percent: 0,
        is_active: true,
        priority: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Público General',
          discount_percent: 5
        })
      };

      priceLists.findByPk.mockResolvedValue(mockPriceList);

      await updatePriceList(1, {
        name: 'Público General',
        discount_percent: 5
      });

      expect(priceLists.findByPk).toHaveBeenCalledWith(1);
      expect(mockPriceList.save).toHaveBeenCalled();
      expect(mockPriceList.name).toBe('Público General');
    });

    test('debe retornar NOT_FOUND si la lista no existe', async() => {
      priceLists.findByPk.mockResolvedValue(null);

      const result = await updatePriceList(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe actualizar is_active a false', async() => {
      const mockPriceList = {
        id: 1,
        name: 'Público',
        is_active: true,
        save: jest.fn().mockResolvedValue({})
      };

      priceLists.findByPk.mockResolvedValue(mockPriceList);

      await updatePriceList(1, { is_active: false });

      expect(mockPriceList.is_active).toBe(false);
    });
  });

  describe('deletePriceList', () => {
    test('debe eliminar una lista de precios', async() => {
      priceLists.destroy.mockResolvedValue(1);

      const result = await deletePriceList(1);

      expect(priceLists.destroy).toHaveBeenCalledTimes(1);
      expect(priceLists.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si la lista no existe', async() => {
      priceLists.destroy.mockResolvedValue(0);

      const result = await deletePriceList(999);

      expect(result).toBe(0);
    });
  });

  describe('Manejo de errores', () => {
    test('getAllPriceLists debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      priceLists.findAndCountAll.mockRejectedValue(dbError);

      await expect(getAllPriceLists()).rejects.toThrow('Database connection failed');
    });

    test('addNewPriceList debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      priceLists.create.mockRejectedValue(dbError);

      await expect(addNewPriceList({ name: 'Test' })).rejects.toThrow('Insert failed');
    });

    test('updatePriceList debe propagar error de BD', async() => {
      const dbError = new Error('Save failed');
      const mockPriceList = {
        id: 1,
        name: 'Público',
        save: jest.fn().mockRejectedValue(dbError)
      };

      priceLists.findByPk.mockResolvedValue(mockPriceList);

      await expect(updatePriceList(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deletePriceList debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      priceLists.destroy.mockRejectedValue(dbError);

      await expect(deletePriceList(1)).rejects.toThrow('Delete failed');
    });
  });
});
