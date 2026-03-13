const { products, productCategories, campaigns: Campaigns } = require('../../models/index');
const {
  getAllProducts,
  getProduct,
  addNewProduct,
  updateProduct,
  deleteProduct,
  getProductWithActiveOffer
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
  },
  campaigns: {
    findAll: jest.fn()
  },
  campaignProducts: {
    findAll: jest.fn()
  },
  campaignProductBranches: {
    findAll: jest.fn()
  },
  branches: {
    findAll: jest.fn()
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
          id: 'SKU001',
          name: 'Producto 1',
          base_price: 100.00,
          category: { id: 1, name: 'Electrónica' }
        },
        {
          id: 'SKU002',
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
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto Test',
        base_price: 150.00,
        category: { id: 1, name: 'Electrónica' }
      };

      products.findOne.mockResolvedValue(mockProduct);

      const result = await getProduct('SKU001');

      expect(products.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    test('debe retornar null si el producto no existe', async() => {
      products.findOne.mockResolvedValue(null);

      const result = await getProduct('INEXISTENTE');

      expect(result).toBeNull();
    });

    test('debe buscar con el id correcto', async() => {
      products.findOne.mockResolvedValue(null);

      await getProduct('SKU-TEST');

      expect(products.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'SKU-TEST' }
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
      const createdProduct = { id: 'SKU-NEW', ...newProduct };

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
      const createdProduct = { id: 'SKU-FULL', ...fullProduct };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(fullProduct);

      expect(products.create).toHaveBeenCalledWith(fullProduct);
      expect(result.id).toBe('SKU-FULL');
      expect(result.dimensions).toEqual({ length: 10, width: 5, height: 3 });
    });

    test('debe crear producto con campos mínimos', async() => {
      const minimalProduct = {
        sku: 'SKU-MIN',
        name: 'Mínimo',
        base_price: 10.00
      };
      const createdProduct = { id: 'SKU-MIN', ...minimalProduct };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(minimalProduct);

      expect(result.id).toBe('SKU-MIN');
      expect(result.name).toBe('Mínimo');
    });
  });

  describe('updateProduct', () => {
    test('debe actualizar un producto existente', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto Original',
        base_price: 100.00,
        save: jest.fn().mockResolvedValue({
          id: 'SKU001-UPD',
          sku: 'SKU001-UPD',
          name: 'Producto Actualizado',
          base_price: 150.00
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', {
        sku: 'SKU001-UPD',
        name: 'Producto Actualizado',
        base_price: 150.00
      });

      expect(products.findByPk).toHaveBeenCalledWith('SKU001');
      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockProduct.name).toBe('Producto Actualizado');
    });

    test('debe retornar NOT_FOUND si el producto no existe', async() => {
      products.findByPk.mockResolvedValue(null);

      const result = await updateProduct('INEXISTENTE', { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 'SKU001',
          sku: 'SKU001',
          name: 'Producto',
          base_price: 100.00,
          description: 'Descripción original'
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', {});

      expect(mockProduct.name).toBe('Producto');
    });

    test('debe actualizar solo el nombre', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Nombre Original',
        base_price: 100.00,
        save: jest.fn().mockResolvedValue({
          id: 'SKU001',
          sku: 'SKU001',
          name: 'Nuevo Nombre',
          base_price: 100.00
        })
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', { name: 'Nuevo Nombre' });

      expect(mockProduct.name).toBe('Nuevo Nombre');
      expect(mockProduct.id).toBe('SKU001');
    });

    test('debe actualizar campos booleanos a false', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        is_active: true,
        is_featured: true,
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', { is_active: false, is_featured: false });

      expect(mockProduct.is_active).toBe(false);
      expect(mockProduct.is_featured).toBe(false);
    });

    test('debe permitir establecer barcode como null', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        barcode: '1234567890',
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', { barcode: null });

      expect(mockProduct.barcode).toBeNull();
    });

    test('debe actualizar dimensiones JSON', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        dimensions: { length: 10, width: 5 },
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      const newDimensions = { length: 20, width: 10, height: 5 };
      await updateProduct('SKU001', { dimensions: newDimensions });

      expect(mockProduct.dimensions).toEqual(newDimensions);
    });
  });

  describe('deleteProduct', () => {
    test('debe eliminar un producto', async() => {
      products.destroy.mockResolvedValue(1);

      const result = await deleteProduct('SKU001');

      expect(products.destroy).toHaveBeenCalledTimes(1);
      expect(products.destroy).toHaveBeenCalledWith({ where: { id: 'SKU001' } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el producto no existe', async() => {
      products.destroy.mockResolvedValue(0);

      const result = await deleteProduct('INEXISTENTE');

      expect(result).toBe(0);
    });

    test('debe llamar destroy con el id correcto', async() => {
      products.destroy.mockResolvedValue(1);

      await deleteProduct('SKU-123');

      expect(products.destroy).toHaveBeenCalledWith({ where: { id: 'SKU-123' } });
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
        id: `SKU${String(i + 1).padStart(3, '0')}`,
        sku: `SKU${String(i + 1).padStart(3, '0')}`,
        name: `Producto ${i + 1}`,
        base_price: (i + 1) * 10
      }));

      products.findAll.mockResolvedValue(manyProducts);

      const result = await getAllProducts();

      expect(result).toHaveLength(100);
      expect(result[0].id).toBe('SKU001');
      expect(result[99].id).toBe('SKU100');
    });

    test('getProduct con id string', async() => {
      const mockProduct = { id: 'SKU001', sku: 'SKU001', name: 'Producto' };
      products.findOne.mockResolvedValue(mockProduct);

      await getProduct('SKU001');

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
      const createdProduct = { id: 'SKU-DEC', ...productWithDecimals };

      products.create.mockResolvedValue(createdProduct);

      const result = await addNewProduct(productWithDecimals);

      expect(result.cost_price).toBe(99.99);
      expect(result.base_price).toBe(149.99);
    });

    test('updateProduct con precio cero', async() => {
      const mockProduct = {
        id: 'SKU001',
        sku: 'SKU001',
        name: 'Producto',
        base_price: 100.00,
        cost_price: 50.00,
        save: jest.fn().mockResolvedValue({})
      };

      products.findByPk.mockResolvedValue(mockProduct);

      await updateProduct('SKU001', { cost_price: 0 });

      expect(mockProduct.cost_price).toBe(0);
    });
  });

  describe('getProductWithActiveOffer', () => {
    const mockProductData = {
      id: 1,
      name: 'Producto Test',
      base_price: '100.00',
      toJSON: function() { return this; }
    };

    test('debe retornar producto sin oferta si no hay campañas activas', async() => {
      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([]);

      const result = await getProductWithActiveOffer(1);

      expect(result.has_active_campaign).toBe(false);
      expect(result.campaign).toBeNull();
      expect(result.original_price).toBe(100);
      expect(result.final_price).toBe(100);
    });

    test('debe retornar null si el producto no existe', async() => {
      products.findByPk.mockResolvedValue(null);

      const result = await getProductWithActiveOffer(999);

      expect(result).toBeNull();
    });

    test('debe aplicar descuento porcentual correctamente', async() => {
      const mockCampaignProduct = {
        discount_type: 'percentage',
        discount_value: '20',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(50),
        branchOverrides: []
      };

      const mockCampaign = {
        id: 1,
        name: 'Campaña 20% off',
        description: 'Descuento del 20%',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        priority: 1,
        branches: [],
        campaignProducts: [mockCampaignProduct]
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([mockCampaign]);

      const result = await getProductWithActiveOffer(1);

      expect(result.has_active_campaign).toBe(true);
      expect(result.original_price).toBe(100);
      expect(result.offer_price).toBe(80);
      expect(result.discount_amount).toBe(20);
      expect(result.discount_percentage).toBe('20.00');
      expect(result.final_price).toBe(80);
    });

    test('debe aplicar precio fijo correctamente', async() => {
      const mockCampaignProduct = {
        discount_type: 'fixed_price',
        discount_value: '75',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(30),
        branchOverrides: []
      };

      const mockCampaign = {
        id: 2,
        name: 'Precio Fijo $75',
        description: 'Precio especial',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        priority: 1,
        branches: [],
        campaignProducts: [mockCampaignProduct]
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([mockCampaign]);

      const result = await getProductWithActiveOffer(1);

      expect(result.has_active_campaign).toBe(true);
      expect(result.original_price).toBe(100);
      expect(result.offer_price).toBe(75);
      expect(result.discount_amount).toBe(25);
      expect(result.final_price).toBe(75);
    });

    test('debe ignorar campaña si no hay stock disponible', async() => {
      const mockCampaignProduct = {
        discount_type: 'percentage',
        discount_value: '10',
        hasAvailableStock: jest.fn().mockReturnValue(false),
        getRemainingStock: jest.fn().mockReturnValue(0),
        branchOverrides: []
      };

      const mockCampaign = {
        id: 1,
        name: 'Sin Stock',
        campaignProducts: [mockCampaignProduct],
        branches: []
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([mockCampaign]);

      const result = await getProductWithActiveOffer(1);

      expect(result.has_active_campaign).toBe(false);
    });

    test('debe filtrar campaña por sucursal si se proporciona branchId', async() => {
      const mockCampaignProduct = {
        discount_type: 'percentage',
        discount_value: '15',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(100),
        branchOverrides: []
      };

      const mockCampaign = {
        id: 1,
        name: 'Solo Sucursal 1',
        campaignProducts: [mockCampaignProduct],
        branches: [{ id: 1, name: 'Sucursal 1' }]
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([mockCampaign]);

      const result = await getProductWithActiveOffer(1, 2);

      expect(result.has_active_campaign).toBe(false);
    });

    test('debe aplicar override de descuento por sucursal', async() => {
      const mockOverride = {
        branch_id: 1,
        discount_value_override: '30'
      };

      const mockCampaignProduct = {
        discount_type: 'percentage',
        discount_value: '10',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(100),
        branchOverrides: [mockOverride]
      };

      const mockCampaign = {
        id: 1,
        name: 'Campaña con Override',
        description: 'Override para sucursal',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        priority: 1,
        branches: [{ id: 1, name: 'Sucursal 1' }],
        campaignProducts: [mockCampaignProduct]
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([mockCampaign]);

      const result = await getProductWithActiveOffer(1, 1);

      expect(result.has_active_campaign).toBe(true);
      expect(result.campaign.discount_value).toBe(30);
    });

    test('debe seleccionar campaña con mayor prioridad', async() => {
      const mockCampaignProduct1 = {
        discount_type: 'percentage',
        discount_value: '5',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(100),
        branchOverrides: []
      };

      const mockCampaignProduct2 = {
        discount_type: 'percentage',
        discount_value: '25',
        hasAvailableStock: jest.fn().mockReturnValue(true),
        getRemainingStock: jest.fn().mockReturnValue(100),
        branchOverrides: []
      };

      const lowPriorityCampaign = {
        id: 1,
        name: 'Campaña Baja',
        campaignProducts: [mockCampaignProduct1],
        branches: [],
        priority: 1
      };

      const highPriorityCampaign = {
        id: 2,
        name: 'Campaña Alta',
        campaignProducts: [mockCampaignProduct2],
        branches: [],
        priority: 10
      };

      products.findByPk.mockResolvedValue(mockProductData);
      Campaigns.findAll.mockResolvedValue([highPriorityCampaign, lowPriorityCampaign]);

      const result = await getProductWithActiveOffer(1);

      expect(result.has_active_campaign).toBe(true);
      expect(result.campaign.id).toBe(2);
      expect(result.campaign.name).toBe('Campaña Alta');
      expect(result.offer_price).toBe(75);
    });
  });
});
