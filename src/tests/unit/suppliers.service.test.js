'use strict';

const { suppliers, municipalities } = require('../../models/index');
const {
  getAllSuppliers,
  getSupplier,
  addNewSupplier,
  updateSupplier,
  deleteSupplier
} = require('../../services/suppliers');

// Mock del modelo
jest.mock('../../models/index', () => ({
  suppliers: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  },
  municipalities: {
    findAll: jest.fn(),
    findOne: jest.fn()
  }
}));

describe('Suppliers Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    test('debe retornar lista de proveedores', async() => {
      const mockSuppliers = [
        {
          id: 1,
          name: 'Proveedor 1',
          email: 'proveedor1@test.com',
          municipality: { id: 1, name: 'Monterrey' }
        },
        {
          id: 2,
          name: 'Proveedor 2',
          email: 'proveedor2@test.com',
          municipality: { id: 2, name: 'Guadalajara' }
        }
      ];

      suppliers.findAll.mockResolvedValue(mockSuppliers);

      const result = await getAllSuppliers();

      expect(suppliers.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSuppliers);
      expect(result).toHaveLength(2);
    });

    test('debe retornar array vacío si no hay proveedores', async() => {
      suppliers.findAll.mockResolvedValue([]);

      const result = await getAllSuppliers();

      expect(result).toEqual([]);
    });

    test('debe incluir municipio en la consulta', async() => {
      suppliers.findAll.mockResolvedValue([]);

      await getAllSuppliers();

      expect(suppliers.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: municipalities,
              as: 'municipality'
            })
          ])
        })
      );
    });
  });

  describe('getSupplier', () => {
    test('debe retornar un proveedor por id', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor Test',
        email: 'test@proveedor.com',
        phone: '8181234567',
        municipality: { id: 1, name: 'Monterrey' }
      };

      suppliers.findOne.mockResolvedValue(mockSupplier);

      const result = await getSupplier(1);

      expect(suppliers.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSupplier);
    });

    test('debe retornar null si el proveedor no existe', async() => {
      suppliers.findOne.mockResolvedValue(null);

      const result = await getSupplier(999);

      expect(result).toBeNull();
    });
  });

  describe('addNewSupplier', () => {
    test('debe crear un nuevo proveedor', async() => {
      const newSupplier = {
        name: 'Nuevo Proveedor',
        email: 'nuevo@proveedor.com',
        phone: '8181234567'
      };
      const createdSupplier = { id: 1, ...newSupplier };

      suppliers.create.mockResolvedValue(createdSupplier);

      const result = await addNewSupplier(newSupplier);

      expect(suppliers.create).toHaveBeenCalledTimes(1);
      expect(suppliers.create).toHaveBeenCalledWith(newSupplier);
      expect(result).toEqual(createdSupplier);
    });

    test('debe crear proveedor con todos los campos', async() => {
      const fullSupplier = {
        name: 'Proveedor Completo S.A.',
        trade_name: 'Proveedor Completo',
        tax_id: 'RFC123456789',
        contact_name: 'Juan Pérez',
        email: 'juan@proveedor.com',
        phone: '8181234567',
        mobile: '8112345678',
        address: 'Calle Test 123',
        municipality_id: 1,
        postal_code: '64000',
        website: 'https://proveedor.com',
        payment_terms: '30 días',
        credit_limit: 50000.00,
        notes: 'Proveedor preferente',
        is_active: true
      };
      const createdSupplier = { id: 1, ...fullSupplier };

      suppliers.create.mockResolvedValue(createdSupplier);

      const result = await addNewSupplier(fullSupplier);

      expect(result.name).toBe('Proveedor Completo S.A.');
      expect(result.credit_limit).toBe(50000.00);
    });
  });

  describe('updateSupplier', () => {
    test('debe actualizar un proveedor existente', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor Original',
        email: 'original@test.com',
        phone: '8181234567',
        save: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Proveedor Modificado',
          email: 'modificado@test.com'
        })
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, { name: 'Proveedor Modificado', email: 'modificado@test.com' });

      expect(suppliers.findByPk).toHaveBeenCalledWith(1);
      expect(mockSupplier.save).toHaveBeenCalled();
      expect(mockSupplier.name).toBe('Proveedor Modificado');
    });

    test('debe retornar NOT_FOUND si el proveedor no existe', async() => {
      suppliers.findByPk.mockResolvedValue(null);

      const result = await updateSupplier(999, { name: 'Test' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe mantener valores si no se proporcionan nuevos', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor Original',
        email: 'original@test.com',
        phone: '8181234567',
        credit_limit: 10000,
        save: jest.fn().mockResolvedValue({})
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, {});

      expect(mockSupplier.name).toBe('Proveedor Original');
      expect(mockSupplier.email).toBe('original@test.com');
    });

    test('debe actualizar límite de crédito', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor',
        credit_limit: 10000,
        save: jest.fn().mockResolvedValue({})
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, { credit_limit: 25000 });

      expect(mockSupplier.credit_limit).toBe(25000);
    });

    test('debe actualizar is_active a false', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor',
        is_active: true,
        save: jest.fn().mockResolvedValue({})
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, { is_active: false });

      expect(mockSupplier.is_active).toBe(false);
    });
  });

  describe('deleteSupplier', () => {
    test('debe eliminar un proveedor', async() => {
      suppliers.destroy.mockResolvedValue(1);

      const result = await deleteSupplier(1);

      expect(suppliers.destroy).toHaveBeenCalledTimes(1);
      expect(suppliers.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });

    test('debe retornar 0 si el proveedor no existe', async() => {
      suppliers.destroy.mockResolvedValue(0);

      const result = await deleteSupplier(999);

      expect(result).toBe(0);
    });
  });

  describe('Manejo de errores', () => {
    test('getAllSuppliers debe propagar error de BD', async() => {
      const dbError = new Error('Database connection failed');
      suppliers.findAll.mockRejectedValue(dbError);

      await expect(getAllSuppliers()).rejects.toThrow('Database connection failed');
    });

    test('addNewSupplier debe propagar error de duplicado', async() => {
      const dbError = new Error('Duplicate entry');
      suppliers.create.mockRejectedValue(dbError);

      await expect(addNewSupplier({ name: 'Test', email: 'test@test.com' })).rejects.toThrow('Duplicate entry');
    });

    test('updateSupplier debe propagar error de BD', async() => {
      const dbError = new Error('Save failed');
      const mockSupplier = {
        id: 1,
        name: 'Test',
        save: jest.fn().mockRejectedValue(dbError)
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await expect(updateSupplier(1, { name: 'Updated' })).rejects.toThrow('Save failed');
    });

    test('deleteSupplier debe propagar error de BD', async() => {
      const dbError = new Error('Delete failed');
      suppliers.destroy.mockRejectedValue(dbError);

      await expect(deleteSupplier(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('Casos edge', () => {
    test('addNewSupplier con datos mínimos', async() => {
      const minimalSupplier = {
        name: 'Proveedor Mínimo',
        email: 'minimo@test.com'
      };
      const createdSupplier = { id: 1, ...minimalSupplier };

      suppliers.create.mockResolvedValue(createdSupplier);

      const result = await addNewSupplier(minimalSupplier);

      expect(result.name).toBe('Proveedor Mínimo');
    });

    test('updateSupplier debe permitir actualizar RFC', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor',
        tax_id: null,
        save: jest.fn().mockResolvedValue({})
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, { tax_id: 'XAXX010101000' });

      expect(mockSupplier.tax_id).toBe('XAXX010101000');
    });

    test('updateSupplier debe permitir limpiar campos opcionales', async() => {
      const mockSupplier = {
        id: 1,
        name: 'Proveedor',
        website: 'https://old.com',
        notes: 'Notas antiguas',
        save: jest.fn().mockResolvedValue({})
      };

      suppliers.findByPk.mockResolvedValue(mockSupplier);

      await updateSupplier(1, { website: null, notes: null });

      expect(mockSupplier.website).toBeNull();
      expect(mockSupplier.notes).toBeNull();
    });

    test('getSupplier con id tipo string numérico', async() => {
      const mockSupplier = { id: 1, name: 'Proveedor' };
      suppliers.findOne.mockResolvedValue(mockSupplier);

      await getSupplier('1');

      expect(suppliers.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' }
        })
      );
    });
  });
});
