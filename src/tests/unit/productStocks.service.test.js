const { productStocks, products, branches } = require('../../models/index');
const {
  getAllProductStocks,
  getProductStock,
  getStocksByProduct,
  getStocksByBranch,
  addNewProductStock,
  updateProductStock,
  deleteProductStock
} = require('../../services/productStocks');

// Mock del modelo
jest.mock('../../models/index', () => ({
  productStocks: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  products: {
    findAll: jest.fn(),
    findOne: jest.fn()
  },
  branches: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('ProductStocks Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProductStocks', () => {
    test('debe retornar lista de inventarios', async() => {
      const mockStocks = [
        {
          id: 1,
          product_id: 1,
          branch_id: 1,
          quantity: 100,
          product: { id: 1, sku: 'SKU001', name: 'Producto 1' },
          branch: { id: 1, name: 'Sucursal 1' }
        },
        {
          id: 2,
          product_id: 2,
          branch_id: 1,
          quantity: 50,
          product: { id: 2, sku: 'SKU002', name: 'Producto 2' },
          branch: { id: 1, name: 'Sucursal 1' }
        }
      ];

      productStocks.findAll.mockResolvedValue(mockStocks);

      const result = await getAllProductStocks();

      expect(productStocks.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay inventarios', async() => {
      productStocks.findAll.mockResolvedValue([]);

      const result = await getAllProductStocks();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('debe incluir producto y sucursal en la consulta', async() => {
      productStocks.findAll.mockResolvedValue([]);

      await getAllProductStocks();

      expect(productStocks.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: products,
              as: 'product'
            }),
            expect.objectContaining({
              model: branches,
              as: 'branch'
            })
          ])
        })
      );
    });
  });

  describe('getProductStock', () => {
    test('debe retornar un inventario por id', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        product: { id: 1, sku: 'SKU001', name: 'Producto 1' },
        branch: { id: 1, name: 'Sucursal 1' }
      };

      productStocks.findOne.mockResolvedValue(mockStock);

      const result = await getProductStock(1);

      expect(productStocks.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStock);
    });

    test('debe retornar null si el inventario no existe', async() => {
      productStocks.findOne.mockResolvedValue(null);

      const result = await getProductStock(999);

      expect(result).toBeNull();
    });

    test('debe buscar con el id correcto', async() => {
      productStocks.findOne.mockResolvedValue(null);

      await getProductStock(42);

      expect(productStocks.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 }
        })
      );
    });
  });

  describe('getStocksByProduct', () => {
    test('debe retornar inventarios de un producto', async() => {
      const mockStocks = [
        { id: 1, product_id: 1, branch_id: 1, quantity: 100, branch: { id: 1, name: 'Sucursal 1' } },
        { id: 2, product_id: 1, branch_id: 2, quantity: 50, branch: { id: 2, name: 'Sucursal 2' } }
      ];

      productStocks.findAll.mockResolvedValue(mockStocks);

      const result = await getStocksByProduct(1);

      expect(productStocks.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product_id: 1 }
        })
      );
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si el producto no tiene inventario', async() => {
      productStocks.findAll.mockResolvedValue([]);

      const result = await getStocksByProduct(999);

      expect(result).toEqual([]);
    });
  });

  describe('getStocksByBranch', () => {
    test('debe retornar inventarios de una sucursal', async() => {
      const mockStocks = [
        { id: 1, product_id: 1, branch_id: 1, quantity: 100, product: { id: 1, sku: 'SKU001', name: 'Producto 1' } },
        { id: 2, product_id: 2, branch_id: 1, quantity: 75, product: { id: 2, sku: 'SKU002', name: 'Producto 2' } }
      ];

      productStocks.findAll.mockResolvedValue(mockStocks);

      const result = await getStocksByBranch(1);

      expect(productStocks.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { branch_id: 1 }
        })
      );
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si la sucursal no tiene inventario', async() => {
      productStocks.findAll.mockResolvedValue([]);

      const result = await getStocksByBranch(999);

      expect(result).toEqual([]);
    });
  });

  describe('addNewProductStock', () => {
    test('debe crear un nuevo inventario', async() => {
      const newStock = {
        product_id: 1,
        branch_id: 1,
        quantity: 100
      };
      const createdStock = { id: 1, ...newStock };

      productStocks.create.mockResolvedValue(createdStock);

      const result = await addNewProductStock(newStock);

      expect(productStocks.create).toHaveBeenCalledTimes(1);
      expect(productStocks.create).toHaveBeenCalledWith(newStock);
      expect(result).toEqual(createdStock);
    });

    test('debe crear inventario con todos los campos', async() => {
      const fullStock = {
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        min_stock: 10,
        max_stock: 200,
        location: 'A-01-03',
        last_count_date: '2026-01-23'
      };
      const createdStock = { id: 1, ...fullStock };

      productStocks.create.mockResolvedValue(createdStock);

      const result = await addNewProductStock(fullStock);

      expect(productStocks.create).toHaveBeenCalledWith(fullStock);
      expect(result.location).toBe('A-01-03');
    });

    test('debe crear inventario con campos mínimos', async() => {
      const minimalStock = {
        product_id: 1,
        branch_id: 1
      };
      const createdStock = { id: 1, ...minimalStock, quantity: 0 };

      productStocks.create.mockResolvedValue(createdStock);

      const result = await addNewProductStock(minimalStock);

      expect(result.id).toBe(1);
      expect(result.quantity).toBe(0);
    });
  });

  describe('updateProductStock', () => {
    test('debe actualizar un inventario existente', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        min_stock: 10,
        save: jest.fn().mockResolvedValue({
          id: 1,
          product_id: 1,
          branch_id: 1,
          quantity: 150,
          min_stock: 20
        })
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, {
        quantity: 150,
        min_stock: 20
      });

      expect(productStocks.findByPk).toHaveBeenCalledWith(1);
      expect(mockStock.save).toHaveBeenCalled();
      expect(mockStock.quantity).toBe(150);
      expect(mockStock.min_stock).toBe(20);
    });

    test('debe retornar NOT_FOUND si el inventario no existe', async() => {
      productStocks.findByPk.mockResolvedValue(null);

      const result = await updateProductStock(999, { quantity: 100 });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        location: 'A-01-03',
        save: jest.fn().mockResolvedValue({})
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, {});

      expect(mockStock.quantity).toBe(100);
      expect(mockStock.location).toBe('A-01-03');
    });

    test('debe actualizar solo la cantidad', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        location: 'A-01-03',
        save: jest.fn().mockResolvedValue({})
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, { quantity: 200 });

      expect(mockStock.quantity).toBe(200);
      expect(mockStock.location).toBe('A-01-03');
    });

    test('debe actualizar cantidad a cero', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        save: jest.fn().mockResolvedValue({})
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, { quantity: 0 });

      expect(mockStock.quantity).toBe(0);
    });

    test('debe permitir establecer location como null', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        location: 'A-01-03',
        save: jest.fn().mockResolvedValue({})
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, { location: null });

      expect(mockStock.location).toBeNull();
    });
  });

  describe('deleteProductStock', () => {
    test('debe eliminar un inventario', async() => {
      productStocks.destroy.mockResolvedValue(1);

      const result = await deleteProductStock(1);

      expect(productStocks.destroy).toHaveBeenCalledTimes(1);
      expect(productStocks.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el inventario no existe', async() => {
      productStocks.destroy.mockResolvedValue(0);

      const result = await deleteProductStock(999);

      expect(result).toBe(0);
    });

    test('debe llamar destroy con el id correcto', async() => {
      productStocks.destroy.mockResolvedValue(1);

      await deleteProductStock(123);

      expect(productStocks.destroy).toHaveBeenCalledWith({ where: { id: 123 } });
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getAllProductStocks debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      productStocks.findAll.mockRejectedValue(dbError);

      await expect(getAllProductStocks()).rejects.toThrow('Database connection failed');
    });

    test('getProductStock debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      productStocks.findOne.mockRejectedValue(dbError);

      await expect(getProductStock(1)).rejects.toThrow('Database query failed');
    });

    test('getStocksByProduct debe propagar error de BD', async() => {
      const dbError = new Error('Query failed');
      productStocks.findAll.mockRejectedValue(dbError);

      await expect(getStocksByProduct(1)).rejects.toThrow('Query failed');
    });

    test('getStocksByBranch debe propagar error de BD', async() => {
      const dbError = new Error('Query failed');
      productStocks.findAll.mockRejectedValue(dbError);

      await expect(getStocksByBranch(1)).rejects.toThrow('Query failed');
    });

    test('addNewProductStock debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      productStocks.create.mockRejectedValue(dbError);

      await expect(addNewProductStock({ product_id: 1, branch_id: 1 })).rejects.toThrow('Insert failed');
    });

    test('addNewProductStock debe propagar error de duplicado', async() => {
      const dbError = new Error('Duplicate entry for key product_branch');
      productStocks.create.mockRejectedValue(dbError);

      await expect(addNewProductStock({ product_id: 1, branch_id: 1 })).rejects.toThrow('Duplicate entry');
    });

    test('updateProductStock debe propagar error de BD en findByPk', async() => {
      const dbError = new Error('FindByPk failed');
      productStocks.findByPk.mockRejectedValue(dbError);

      await expect(updateProductStock(1, { quantity: 100 })).rejects.toThrow('FindByPk failed');
    });

    test('updateProductStock debe propagar error de BD en save', async() => {
      const dbError = new Error('Save failed');
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        save: jest.fn().mockRejectedValue(dbError)
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await expect(updateProductStock(1, { quantity: 200 })).rejects.toThrow('Save failed');
    });

    test('deleteProductStock debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      productStocks.destroy.mockRejectedValue(dbError);

      await expect(deleteProductStock(1)).rejects.toThrow('Delete failed');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getAllProductStocks con muchos inventarios', async() => {
      const manyStocks = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        product_id: (i % 10) + 1,
        branch_id: (i % 5) + 1,
        quantity: (i + 1) * 10
      }));

      productStocks.findAll.mockResolvedValue(manyStocks);

      const result = await getAllProductStocks();

      expect(result).toHaveLength(100);
    });

    test('getProductStock con id tipo string numérico', async() => {
      const mockStock = { id: 1, product_id: 1, branch_id: 1, quantity: 100 };
      productStocks.findOne.mockResolvedValue(mockStock);

      await getProductStock('1');

      expect(productStocks.findOne).toHaveBeenCalled();
    });

    test('deleteProductStock debe retornar número de filas eliminadas', async() => {
      productStocks.destroy.mockResolvedValue(1);

      const result = await deleteProductStock(1);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });

    test('addNewProductStock con cantidades decimales', async() => {
      const stockWithDecimals = {
        product_id: 1,
        branch_id: 1,
        quantity: 10.5,
        min_stock: 2.25,
        max_stock: 100.75
      };
      const createdStock = { id: 1, ...stockWithDecimals };

      productStocks.create.mockResolvedValue(createdStock);

      const result = await addNewProductStock(stockWithDecimals);

      expect(result.quantity).toBe(10.5);
      expect(result.min_stock).toBe(2.25);
    });

    test('updateProductStock con cantidad negativa (ajuste)', async() => {
      const mockStock = {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        save: jest.fn().mockResolvedValue({})
      };

      productStocks.findByPk.mockResolvedValue(mockStock);

      await updateProductStock(1, { quantity: -5 });

      expect(mockStock.quantity).toBe(-5);
    });
  });
});
