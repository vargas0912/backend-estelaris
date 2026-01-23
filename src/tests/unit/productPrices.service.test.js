const { productPrices, products, priceLists } = require('../../models/index');
const {
  getAllProductPrices,
  getProductPrice,
  getPricesByProduct,
  getPricesByPriceList,
  addNewProductPrice,
  updateProductPrice,
  deleteProductPrice
} = require('../../services/productPrices');

// Mock del modelo
jest.mock('../../models/index', () => ({
  productPrices: {
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
  priceLists: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('ProductPrices Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProductPrices', () => {
    test('debe retornar lista de precios de productos', async() => {
      const mockPrices = [
        {
          id: 1,
          product_id: 1,
          price_list_id: 1,
          price: 100.00,
          product: { id: 1, sku: 'SKU001', name: 'Producto 1' },
          priceList: { id: 1, name: 'Público' }
        },
        {
          id: 2,
          product_id: 1,
          price_list_id: 2,
          price: 90.00,
          product: { id: 1, sku: 'SKU001', name: 'Producto 1' },
          priceList: { id: 2, name: 'Mayoreo' }
        }
      ];

      productPrices.findAll.mockResolvedValue(mockPrices);

      const result = await getAllProductPrices();

      expect(productPrices.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrices);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay precios', async() => {
      productPrices.findAll.mockResolvedValue([]);

      const result = await getAllProductPrices();

      expect(result).toEqual([]);
    });

    test('debe incluir producto y lista en la consulta', async() => {
      productPrices.findAll.mockResolvedValue([]);

      await getAllProductPrices();

      expect(productPrices.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: products,
              as: 'product'
            }),
            expect.objectContaining({
              model: priceLists,
              as: 'priceList'
            })
          ])
        })
      );
    });
  });

  describe('getProductPrice', () => {
    test('debe retornar un precio por id', async() => {
      const mockPrice = {
        id: 1,
        product_id: 1,
        price_list_id: 1,
        price: 100.00,
        product: { id: 1, sku: 'SKU001', name: 'Producto 1' },
        priceList: { id: 1, name: 'Público' }
      };

      productPrices.findOne.mockResolvedValue(mockPrice);

      const result = await getProductPrice(1);

      expect(productPrices.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPrice);
    });

    test('debe retornar null si el precio no existe', async() => {
      productPrices.findOne.mockResolvedValue(null);

      const result = await getProductPrice(999);

      expect(result).toBeNull();
    });
  });

  describe('getPricesByProduct', () => {
    test('debe retornar precios de un producto', async() => {
      const mockPrices = [
        { id: 1, product_id: 1, price_list_id: 1, price: 100.00, priceList: { id: 1, name: 'Público' } },
        { id: 2, product_id: 1, price_list_id: 2, price: 90.00, priceList: { id: 2, name: 'Mayoreo' } }
      ];

      productPrices.findAll.mockResolvedValue(mockPrices);

      const result = await getPricesByProduct(1);

      expect(productPrices.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product_id: 1 }
        })
      );
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si el producto no tiene precios', async() => {
      productPrices.findAll.mockResolvedValue([]);

      const result = await getPricesByProduct(999);

      expect(result).toEqual([]);
    });
  });

  describe('getPricesByPriceList', () => {
    test('debe retornar precios de una lista', async() => {
      const mockPrices = [
        { id: 1, product_id: 1, price_list_id: 1, price: 100.00, product: { id: 1, sku: 'SKU001' } },
        { id: 2, product_id: 2, price_list_id: 1, price: 200.00, product: { id: 2, sku: 'SKU002' } }
      ];

      productPrices.findAll.mockResolvedValue(mockPrices);

      const result = await getPricesByPriceList(1);

      expect(productPrices.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { price_list_id: 1 }
        })
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('addNewProductPrice', () => {
    test('debe crear un nuevo precio de producto', async() => {
      const newPrice = {
        product_id: 1,
        price_list_id: 1,
        price: 100.00
      };
      const createdPrice = { id: 1, ...newPrice };

      productPrices.create.mockResolvedValue(createdPrice);

      const result = await addNewProductPrice(newPrice);

      expect(productPrices.create).toHaveBeenCalledTimes(1);
      expect(productPrices.create).toHaveBeenCalledWith(newPrice);
      expect(result).toEqual(createdPrice);
    });

    test('debe crear precio con cantidad mínima (escalonado)', async() => {
      const priceWithMinQty = {
        product_id: 1,
        price_list_id: 2,
        price: 85.00,
        min_quantity: 10
      };
      const createdPrice = { id: 1, ...priceWithMinQty };

      productPrices.create.mockResolvedValue(createdPrice);

      const result = await addNewProductPrice(priceWithMinQty);

      expect(result.min_quantity).toBe(10);
    });
  });

  describe('updateProductPrice', () => {
    test('debe actualizar un precio existente', async() => {
      const mockPrice = {
        id: 1,
        product_id: 1,
        price_list_id: 1,
        price: 100.00,
        min_quantity: 1,
        save: jest.fn().mockResolvedValue({
          id: 1,
          price: 110.00
        })
      };

      productPrices.findByPk.mockResolvedValue(mockPrice);

      await updateProductPrice(1, { price: 110.00 });

      expect(productPrices.findByPk).toHaveBeenCalledWith(1);
      expect(mockPrice.save).toHaveBeenCalled();
      expect(mockPrice.price).toBe(110.00);
    });

    test('debe retornar NOT_FOUND si el precio no existe', async() => {
      productPrices.findByPk.mockResolvedValue(null);

      const result = await updateProductPrice(999, { price: 100 });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe actualizar precio a cero', async() => {
      const mockPrice = {
        id: 1,
        product_id: 1,
        price_list_id: 1,
        price: 100.00,
        save: jest.fn().mockResolvedValue({})
      };

      productPrices.findByPk.mockResolvedValue(mockPrice);

      await updateProductPrice(1, { price: 0 });

      expect(mockPrice.price).toBe(0);
    });
  });

  describe('deleteProductPrice', () => {
    test('debe eliminar un precio', async() => {
      productPrices.destroy.mockResolvedValue(1);

      const result = await deleteProductPrice(1);

      expect(productPrices.destroy).toHaveBeenCalledTimes(1);
      expect(productPrices.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el precio no existe', async() => {
      productPrices.destroy.mockResolvedValue(0);

      const result = await deleteProductPrice(999);

      expect(result).toBe(0);
    });
  });

  describe('Manejo de errores', () => {
    test('getAllProductPrices debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      productPrices.findAll.mockRejectedValue(dbError);

      await expect(getAllProductPrices()).rejects.toThrow('Database connection failed');
    });

    test('addNewProductPrice debe propagar error de duplicado', async() => {
      const dbError = new Error('Duplicate entry');
      productPrices.create.mockRejectedValue(dbError);

      await expect(addNewProductPrice({ product_id: 1, price_list_id: 1, price: 100 })).rejects.toThrow('Duplicate entry');
    });

    test('updateProductPrice debe propagar error de BD', async() => {
      const dbError = new Error('Save failed');
      const mockPrice = {
        id: 1,
        price: 100,
        save: jest.fn().mockRejectedValue(dbError)
      };

      productPrices.findByPk.mockResolvedValue(mockPrice);

      await expect(updateProductPrice(1, { price: 110 })).rejects.toThrow('Save failed');
    });

    test('deleteProductPrice debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      productPrices.destroy.mockRejectedValue(dbError);

      await expect(deleteProductPrice(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('Casos edge', () => {
    test('addNewProductPrice con precios decimales', async() => {
      const priceWithDecimals = {
        product_id: 1,
        price_list_id: 1,
        price: 99.99,
        min_quantity: 1.5
      };
      const createdPrice = { id: 1, ...priceWithDecimals };

      productPrices.create.mockResolvedValue(createdPrice);

      const result = await addNewProductPrice(priceWithDecimals);

      expect(result.price).toBe(99.99);
      expect(result.min_quantity).toBe(1.5);
    });
  });
});
