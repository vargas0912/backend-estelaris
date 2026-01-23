const { productCategories } = require('../../models/index');
const {
  getAllProductCategories,
  getProductCategory,
  addNewProductCategory,
  updateProductCategory,
  deleteProductCategory
} = require('../../services/productCategories');

// Mock del modelo
jest.mock('../../models/index', () => ({
  productCategories: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  }
}));

describe('ProductCategories Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProductCategories', () => {
    test('debe retornar lista de categorías', async() => {
      const mockCategories = [
        { id: 1, name: 'Electrónica', description: 'Productos electrónicos' },
        { id: 2, name: 'Muebles', description: 'Muebles para el hogar' }
      ];

      productCategories.findAll.mockResolvedValue(mockCategories);

      const result = await getAllProductCategories();

      expect(productCategories.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay categorías', async() => {
      productCategories.findAll.mockResolvedValue([]);

      const result = await getAllProductCategories();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getProductCategory', () => {
    test('debe retornar una categoría por id', async() => {
      const mockCategory = { id: 1, name: 'Electrónica', description: 'Productos electrónicos' };

      productCategories.findOne.mockResolvedValue(mockCategory);

      const result = await getProductCategory(1);

      expect(productCategories.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategory);
    });

    test('debe retornar null si la categoría no existe', async() => {
      productCategories.findOne.mockResolvedValue(null);

      const result = await getProductCategory(999);

      expect(result).toBeNull();
    });
  });

  describe('addNewProductCategory', () => {
    test('debe crear una nueva categoría', async() => {
      const newCategory = { name: 'Nueva Categoría', description: 'Descripción nueva' };
      const createdCategory = { id: 1, ...newCategory };

      productCategories.create.mockResolvedValue(createdCategory);

      const result = await addNewProductCategory(newCategory);

      expect(productCategories.create).toHaveBeenCalledTimes(1);
      expect(productCategories.create).toHaveBeenCalledWith(newCategory);
      expect(result).toEqual(createdCategory);
    });

    test('debe crear categoría sin descripción', async() => {
      const newCategory = { name: 'Solo Nombre' };
      const createdCategory = { id: 1, name: 'Solo Nombre', description: null };

      productCategories.create.mockResolvedValue(createdCategory);

      const result = await addNewProductCategory(newCategory);

      expect(productCategories.create).toHaveBeenCalledWith(newCategory);
      expect(result.name).toBe('Solo Nombre');
    });
  });

  describe('updateProductCategory', () => {
    test('debe actualizar una categoría existente', async() => {
      const mockCategory = {
        id: 1,
        name: 'Electrónica',
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Electrónica Actualizada',
          description: 'Nueva descripción'
        })
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await updateProductCategory(1, {
        name: 'Electrónica Actualizada',
        description: 'Nueva descripción'
      });

      expect(productCategories.findByPk).toHaveBeenCalledWith(1);
      expect(mockCategory.save).toHaveBeenCalled();
      expect(mockCategory.name).toBe('Electrónica Actualizada');
      expect(mockCategory.description).toBe('Nueva descripción');
    });

    test('debe retornar NOT_FOUND si la categoría no existe', async() => {
      productCategories.findByPk.mockResolvedValue(null);

      const result = await updateProductCategory(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockCategory = {
        id: 1,
        name: 'Electrónica',
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Electrónica',
          description: 'Descripción original'
        })
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await updateProductCategory(1, {});

      expect(mockCategory.name).toBe('Electrónica');
      expect(mockCategory.description).toBe('Descripción original');
    });

    test('debe actualizar solo el nombre', async() => {
      const mockCategory = {
        id: 1,
        name: 'Electrónica',
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Nuevo Nombre',
          description: 'Descripción original'
        })
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await updateProductCategory(1, { name: 'Nuevo Nombre' });

      expect(mockCategory.name).toBe('Nuevo Nombre');
      expect(mockCategory.description).toBe('Descripción original');
    });

    test('debe actualizar solo la descripción', async() => {
      const mockCategory = {
        id: 1,
        name: 'Electrónica',
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Electrónica',
          description: 'Nueva descripción'
        })
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await updateProductCategory(1, { description: 'Nueva descripción' });

      expect(mockCategory.name).toBe('Electrónica');
      expect(mockCategory.description).toBe('Nueva descripción');
    });

    test('debe permitir establecer descripción como null', async() => {
      const mockCategory = {
        id: 1,
        name: 'Electrónica',
        description: 'Descripción original',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Electrónica',
          description: null
        })
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await updateProductCategory(1, { description: null });

      expect(mockCategory.description).toBeNull();
    });
  });

  describe('deleteProductCategory', () => {
    test('debe eliminar una categoría', async() => {
      productCategories.destroy.mockResolvedValue(1);

      const result = await deleteProductCategory(1);

      expect(productCategories.destroy).toHaveBeenCalledTimes(1);
      expect(productCategories.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si la categoría no existe', async() => {
      productCategories.destroy.mockResolvedValue(0);

      const result = await deleteProductCategory(999);

      expect(result).toBe(0);
    });
  });

  // ============================================
  // Tests de manejo de errores
  // ============================================
  describe('Manejo de errores de base de datos', () => {
    test('getAllProductCategories debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      productCategories.findAll.mockRejectedValue(dbError);

      await expect(getAllProductCategories()).rejects.toThrow('Database connection failed');
    });

    test('getProductCategory debe propagar error de BD', async() => {
      const dbError = new Error('Database query failed');
      productCategories.findOne.mockRejectedValue(dbError);

      await expect(getProductCategory(1)).rejects.toThrow('Database query failed');
    });

    test('addNewProductCategory debe propagar error de BD', async() => {
      const dbError = new Error('Insert failed');
      productCategories.create.mockRejectedValue(dbError);

      await expect(addNewProductCategory({ name: 'Test' })).rejects.toThrow('Insert failed');
    });

    test('updateProductCategory debe propagar error de BD en findByPk', async() => {
      const dbError = new Error('FindByPk failed');
      productCategories.findByPk.mockRejectedValue(dbError);

      await expect(updateProductCategory(1, { name: 'Test' })).rejects.toThrow('FindByPk failed');
    });

    test('updateProductCategory debe propagar error de BD en save', async() => {
      const dbError = new Error('Save failed');
      const mockCategory = {
        id: 1,
        name: 'Categoría',
        description: 'Descripción',
        save: jest.fn().mockRejectedValue(dbError)
      };

      productCategories.findByPk.mockResolvedValue(mockCategory);

      await expect(updateProductCategory(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deleteProductCategory debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      productCategories.destroy.mockRejectedValue(dbError);

      await expect(deleteProductCategory(1)).rejects.toThrow('Delete failed');
    });
  });

  // ============================================
  // Tests de validación de parámetros
  // ============================================
  describe('Validacion de parametros', () => {
    test('getProductCategory debe llamar findOne con el id correcto', async() => {
      productCategories.findOne.mockResolvedValue(null);

      await getProductCategory(42);

      expect(productCategories.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 }
        })
      );
    });

    test('deleteProductCategory debe llamar destroy con el id correcto', async() => {
      productCategories.destroy.mockResolvedValue(1);

      await deleteProductCategory(123);

      expect(productCategories.destroy).toHaveBeenCalledWith({ where: { id: 123 } });
    });

    test('addNewProductCategory debe pasar el body completo a create', async() => {
      const fullCategoryData = {
        name: 'Categoría Completa',
        description: 'Descripción completa'
      };

      productCategories.create.mockResolvedValue({ id: 1, ...fullCategoryData });

      await addNewProductCategory(fullCategoryData);

      expect(productCategories.create).toHaveBeenCalledWith(fullCategoryData);
    });
  });

  // ============================================
  // Tests de casos edge
  // ============================================
  describe('Casos edge', () => {
    test('getAllProductCategories con muchas categorías', async() => {
      const manyCategories = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Categoría ${i + 1}`,
        description: `Descripción ${i + 1}`
      }));

      productCategories.findAll.mockResolvedValue(manyCategories);

      const result = await getAllProductCategories();

      expect(result).toHaveLength(100);
      expect(result[0].name).toBe('Categoría 1');
      expect(result[99].name).toBe('Categoría 100');
    });

    test('addNewProductCategory con datos mínimos', async() => {
      const minimalData = { name: 'Min' };
      productCategories.create.mockResolvedValue({ id: 1, ...minimalData });

      const result = await addNewProductCategory(minimalData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Min');
    });

    test('getProductCategory con id tipo string numérico', async() => {
      const mockCategory = { id: 1, name: 'Categoría' };
      productCategories.findOne.mockResolvedValue(mockCategory);

      await getProductCategory('1');

      expect(productCategories.findOne).toHaveBeenCalled();
    });

    test('deleteProductCategory debe retornar número de filas eliminadas', async() => {
      productCategories.destroy.mockResolvedValue(1);

      const result = await deleteProductCategory(1);

      expect(typeof result).toBe('number');
      expect(result).toBe(1);
    });
  });
});
