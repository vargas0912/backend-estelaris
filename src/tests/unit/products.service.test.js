const { products, productCategories } = require('../../models/index');
const {
  getAllProducts,
  getProduct,
  addNewProduct,
  updateProduct,
  deleteProduct
} = require('../../services/products');

// Mock del modelo
jest.mock('../../models/index', () => ({
  products: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  productCategories: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('Products Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    test('debe retornar lista de productos', async() => {
      const mockProducts = [
        {
          id: 1,
          sku: 'SKU001',
          name: 'Producto 1',
          base_price: 100.00,
          category: { id: 1, name: 'Electrónica' }
        },
        {
          id: 2,
          sku: 'SKU002',
          name: 'Producto 2',
          base_price: 200.00,
          category: { id: 2, name: 'Muebles' }
        }
      ];

      products.findAll.mockResolvedValue(mockProducts);

      const result = await getAllProducts();

      expect(products.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay productos', async() => {
      products.findAll.mockResolvedValue([]);

      const result = await getAllProducts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('debe incluir la categoría en la consulta', async() => {
      products.findAll.mockResolvedValue([]);

      await getAllProducts();

      expect(products.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: productCategories,
              as: 'category'
            })
          ])
        })
      );
    });
  });

  describe('getProduct', () => {
    test('debe retornar un producto por id', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto Test',
        base_price: 150.00,
        category: { id: 1, name: 'Electrónica' }
      };

      products.findOne.mockResolvedValue(mockProduct);

      const result = await getProduct(1);

      expect(products.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    test('debe retornar null si el producto no existe', async() => {
      products.findOne.mockResolvedValue(null);

      const result = await getProduct(999);

      expect(result).toBeNull();
    });

    test('debe buscar con el id correcto', async() => {
      products.findOne.mockResolvedValue(null);

      await getProduct(42);

      expect(products.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 }
        })
      );
    });
  });

  describe('addNewProduct', () => {
    test('debe crear un nuevo producto', async() => {
      const newProduct = {
        sku: 'SKU-NEW',
        name: 'Nuevo Producto',
        base_price: 99.99
      };
      const createdProduct = { id: 1, ...newProduct };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(newProduct);

      expect(products.create).toHaveBeenCalledTimes(1);
      expect(products.create).toHaveBeenCalledWith(newProduct);
      expect(result).toEqual(createdProduct);
    });

    test('debe crear producto con todos los campos', async() => {
      const fullProduct = {
        sku: 'SKU-FULL',
        barcode: '1234567890',
        name: 'Producto Completo',
        description: 'Descripción completa',
        short_description: 'Desc corta',
        category_id: 1,
        unit_of_measure: 'piece',
        cost_price: 50.00,
        base_price: 100.00,
        weight: 1.5,
        dimensions: { length: 10, width: 5, height: 3 },
        images: ['img1.jpg', 'img2.jpg'],
        is_active: true,
        is_featured: true,
        seo_title: 'Título SEO',
        seo_description: 'Descripción SEO',
        seo_keywords: 'producto, test'
      };
      const createdProduct = { id: 1, ...fullProduct };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(fullProduct);

      expect(products.create).toHaveBeenCalledWith(fullProduct);
      expect(result.sku).toBe('SKU-FULL');
      expect(result.dimensions).toEqual({ length: 10, width: 5, height: 3 });
    });

    test('debe crear producto con campos mínimos', async() => {
      const minimalProduct = {
        sku: 'SKU-MIN',
        name: 'Mínimo',
        base_price: 10.00
      };
      const createdProduct = { id: 1, ...minimalProduct };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(minimalProduct);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Mínimo');
    });
  });

  describe('updateProduct', () => {
    test('debe actualizar un producto existente', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto Original',
        base_price: 100.00,
        save: jest.fn().mockResolvedValue({
          id: 1,
          sku: 'SKU001-UPD',
          name: 'Producto Actualizado',
          base_price: 150.00
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, {
        sku: 'SKU001-UPD',
        name: 'Producto Actualizado',
        base_price: 150.00
      });

      expect(products.findByPk).toHaveBeenCalledWith(1);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockProduct.name).toBe('Producto Actualizado');
    });

    test('debe retornar NOT_FOUND si el producto no existe', async() => {
      products.findByPk.mockResolvedValue(null);

      const result = await updateProduct(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          sku: 'SKU001',
          name: 'Producto',
          base_price: 100.00,
          description: 'Descripción original'
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, {});

      expect(mockProduct.sku).toBe('SKU001');
      expect(mockProduct.name).toBe('Producto');
    });

    test('debe actualizar solo el nombre', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Nombre Original',
        base_price: 100.00,
        save: jest.fn().mockResolvedValue({
          id: 1,
          sku: 'SKU001',
          name: 'Nuevo Nombre',
          base_price: 100.00
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, { name: 'Nuevo Nombre' });

      expect(mockProduct.name).toBe('Nuevo Nombre');
      expect(mockProduct.sku).toBe('SKU001');
    });

    test('debe actualizar campos booleanos a false', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        is_active: true,
        is_featured: true,
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, { is_active: false, is_featured: false });

      expect(mockProduct.is_active).toBe(false);
      expect(mockProduct.is_featured).toBe(false);
    });

    test('debe permitir establecer barcode como null', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        barcode: '1234567890',
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, { barcode: null });

      expect(mockProduct.barcode).toBeNull();
    });

    test('debe actualizar dimensiones JSON', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        dimensions: { length: 10, width: 5 },
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      const newDimensions = { length: 20, width: 10, height: 5 };
      await updateProduct(1, { dimensions: newDimensions });

      expect(mockProduct.dimensions).toEqual(newDimensions);
    });
  });

  describe('deleteProduct', () => {
    test('debe eliminar un producto', async() => {
      products.destroy.mockResolvedValue(1);

      const result = await deleteProduct(1);

      expect(products.destroy).toHaveBeenCalledTimes(1);
      expect(products.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el producto no existe', async() => {
      products.destroy.mockResolvedValue(0);

      const result = await deleteProduct(999);

      expect(result).toBe(0);
    });

    test('debe llamar destroy con el id correcto', async() => {
      products.destroy.mockResolvedValue(1);

      await deleteProduct(123);

      expect(products.destroy).toHaveBeenCalledWith({ where: { id: 123 } });
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getAllProducts debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      products.findAll.mockRejectedValue(dbError);

      await expect(getAllProducts()).rejects.toThrow('Database connection failed');
    });

    test('getProduct debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      products.findOne.mockRejectedValue(dbError);

      await expect(getProduct(1)).rejects.toThrow('Database query failed');
    });

    test('addNewProduct debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      products.create.mockRejectedValue(dbError);

      await expect(addNewProduct({ sku: 'TEST', name: 'Test', base_price: 10 })).rejects.toThrow('Insert failed');
    });

    test('addNewProduct debe propagar error de SKU duplicado', async() => {
      const dbError = new Error('Duplicate entry for key sku');
      products.create.mockRejectedValue(dbError);

      await expect(addNewProduct({ sku: 'DUPLICATE', name: 'Test', base_price: 10 })).rejects.toThrow('Duplicate entry');
    });

    test('updateProduct debe propagar error de BD en findByPk', async() => {
      const dbError = new Error('FindByPk failed');
      products.findByPk.mockRejectedValue(dbError);

      await expect(updateProduct(1, { name: 'Test' })).rejects.toThrow('FindByPk failed');
    });

    test('updateProduct debe propagar error de BD en save', async() => {
      const dbError = new Error('Save failed');
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        save: jest.fn().mockRejectedValue(dbError)
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await expect(updateProduct(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deleteProduct debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      products.destroy.mockRejectedValue(dbError);

      await expect(deleteProduct(1)).rejects.toThrow('Delete failed');
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getAllProducts con muchos productos', async() => {
      const manyProducts = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        sku: `SKU${String(i + 1).padStart(3, '0')}`,
        name: `Producto ${i + 1}`,
        base_price: (i + 1) * 10
      }));

      products.findAll.mockResolvedValue(manyProducts);

      const result = await getAllProducts();

      expect(result).toHaveLength(100);
      expect(result[0].sku).toBe('SKU001');
      expect(result[99].sku).toBe('SKU100');
    });

    test('getProduct con id tipo string numérico', async() => {
      const mockProduct = { id: 1, sku: 'SKU001', name: 'Producto' };
      products.findOne.mockResolvedValue(mockProduct);

      await getProduct('1');

      expect(products.findOne).toHaveBeenCalled();
    });

    test('deleteProduct debe retornar número de filas eliminadas', async() => {
      products.destroy.mockResolvedValue(1);

      const result = await deleteProduct(1);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });

    test('addNewProduct con precios decimales', async() => {
      const productWithDecimals = {
        sku: 'SKU-DEC',
        name: 'Producto Decimal',
        cost_price: 99.99,
        base_price: 149.99
      };
      const createdProduct = { id: 1, ...productWithDecimals };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(productWithDecimals);

      expect(result.cost_price).toBe(99.99);
      expect(result.base_price).toBe(149.99);
    });

    test('updateProduct con precio cero', async() => {
      const mockProduct = {
        id: 1,
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        cost_price: 50.00,
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct(1, { cost_price: 0 });

      expect(mockProduct.cost_price).toBe(0);
    });
  });
});
