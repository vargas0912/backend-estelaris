'use strict';

jest.mock('../../models/index', () => {
  const mockSequelize = {
    transaction: jest.fn()
  };

  return {
    purchases: {
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    purchaseDetails: {
      bulkCreate: jest.fn()
    },
    suppliers: { findAll: jest.fn(), findByPk: jest.fn() },
    branches: { findAll: jest.fn() },
    users: { findAll: jest.fn() },
    products: {
      findAll: jest.fn(),
      findOne: jest.fn()
    },
    sequelize: mockSequelize
  };
});

const { purchases, purchaseDetails, suppliers, products, sequelize } = require('../../models/index');
const {
  getAllPurchases,
  getPurchase,
  getPurchasesBySupplier,
  getPurchasesByBranch,
  createPurchase,
  updatePurchase,
  cancelPurchase,
  deletePurchase
} = require('../../services/purchases');

const mockPurchase = {
  id: 1,
  supplier_id: 1,
  branch_id: 1,
  user_id: 1,
  purch_date: '2026-02-24',
  purch_type: 'Contado',
  status: 'Pendiente',
  subtotal: 500,
  tax_amount: 80,
  purch_total: 580,
  discount_amount: 0,
  details: [
    { id: 1, product_id: 1, qty: 5, unit_price: 100, discount: 0, tax_rate: 16, subtotal: 500 }
  ]
};

describe('Purchases Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPurchases', () => {
    test('debe retornar lista de compras', async () => {
      purchases.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockPurchase] });

      const result = await getAllPurchases();

      expect(purchases.findAndCountAll).toHaveBeenCalledTimes(1);
      expect(result.purchases).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    test('debe retornar array vacío si no hay compras', async () => {
      purchases.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const result = await getAllPurchases();

      expect(result.purchases).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getPurchase', () => {
    test('debe retornar una compra por id', async () => {
      purchases.findOne.mockResolvedValue(mockPurchase);

      const result = await getPurchase(1);

      expect(purchases.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
      expect(result).toEqual(mockPurchase);
    });

    test('debe retornar null si la compra no existe', async () => {
      purchases.findOne.mockResolvedValue(null);

      const result = await getPurchase(9999);

      expect(result).toBeNull();
    });
  });

  describe('getPurchasesBySupplier', () => {
    test('debe retornar compras filtradas por proveedor', async () => {
      purchases.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockPurchase] });

      const result = await getPurchasesBySupplier(1);

      expect(purchases.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { supplier_id: 1 } })
      );
      expect(result.purchases).toHaveLength(1);
    });
  });

  describe('getPurchasesByBranch', () => {
    test('debe retornar compras filtradas por sucursal', async () => {
      purchases.findAndCountAll.mockResolvedValue({ count: 1, rows: [mockPurchase] });

      const result = await getPurchasesByBranch(1);

      expect(purchases.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branch_id: 1 } })
      );
      expect(result.purchases).toEqual([mockPurchase]);
    });
  });

  describe('createPurchase', () => {
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    const validBody = {
      supplier_id: 1,
      branch_id: 1,
      purch_date: '2026-02-24',
      purch_type: 'Contado',
      items: [
        { product_id: 1, qty: 5, unit_price: 100, discount: 0, tax_rate: 16 }
      ]
    };

    beforeEach(() => {
      sequelize.transaction.mockResolvedValue(mockTransaction);
      suppliers.findByPk.mockResolvedValue({ id: 1, payment_days: null });
    });

    test('debe retornar error si algún producto no existe o está inactivo', async () => {
      products.findAll.mockResolvedValue([]); // ninguno encontrado

      const result = await createPurchase(validBody, 1);

      expect(result).toEqual({ error: 'SOME_PRODUCTS_NOT_FOUND_OR_INACTIVE' });
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('debe crear compra y hacer commit de la transacción', async () => {
      products.findAll.mockResolvedValue([{ id: 1 }]);
      purchases.create.mockResolvedValue({ id: 1 });
      purchaseDetails.bulkCreate.mockResolvedValue([]);
      purchases.findOne.mockResolvedValue(mockPurchase);

      const result = await createPurchase(validBody, 1);

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toEqual(mockPurchase);
    });

    test('debe hacer rollback si falla la creación', async () => {
      products.findAll.mockResolvedValue([{ id: 1 }]);
      purchases.create.mockRejectedValue(new Error('DB error'));

      await expect(createPurchase(validBody, 1)).rejects.toThrow('DB error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('debe calcular correctamente subtotal y totales', async () => {
      products.findAll.mockResolvedValue([{ id: 1 }]);
      purchases.create.mockResolvedValue({ id: 1 });
      purchaseDetails.bulkCreate.mockResolvedValue([]);
      purchases.findOne.mockResolvedValue(mockPurchase);

      await createPurchase(validBody, 1);

      const createCall = purchases.create.mock.calls[0][0];
      // qty=5, unit_price=100, discount=0 → subtotal = 500
      expect(parseFloat(createCall.subtotal)).toBeCloseTo(500, 2);
      // tax = 500 * 16/100 = 80
      expect(parseFloat(createCall.tax_amount)).toBeCloseTo(80, 2);
      // total = 500 + 80 - 0 = 580
      expect(parseFloat(createCall.purch_total)).toBeCloseTo(580, 2);
    });

    test('debe aplicar descuento por línea al calcular subtotal', async () => {
      const bodyWithDiscount = {
        ...validBody,
        items: [{ product_id: 1, qty: 10, unit_price: 100, discount: 10, tax_rate: 16 }]
      };

      products.findAll.mockResolvedValue([{ id: 1 }]);
      purchases.create.mockResolvedValue({ id: 1 });
      purchaseDetails.bulkCreate.mockResolvedValue([]);
      purchases.findOne.mockResolvedValue(mockPurchase);

      await createPurchase(bodyWithDiscount, 1);

      const createCall = purchases.create.mock.calls[0][0];
      // qty=10, unit_price=100, discount=10% → subtotal = 10 * 100 * 0.9 = 900
      expect(parseFloat(createCall.subtotal)).toBeCloseTo(900, 2);
    });
  });

  describe('updatePurchase', () => {
    test('debe retornar NOT_FOUND si la compra no existe', async () => {
      purchases.findByPk.mockResolvedValue(null);

      const result = await updatePurchase(9999, { status: 'Pagado' });

      expect(result).toEqual({ data: { msg: 'NOT_FOUND' } });
    });

    test('debe retornar error si la compra está cancelada', async () => {
      purchases.findByPk.mockResolvedValue({ ...mockPurchase, status: 'Cancelado' });

      const result = await updatePurchase(1, { status: 'Pagado' });

      expect(result).toEqual({ error: 'PURCHASE_ALREADY_CANCELLED' });
    });

    test('debe actualizar campos permitidos', async () => {
      const mockData = {
        ...mockPurchase,
        save: jest.fn().mockResolvedValue({ ...mockPurchase, status: 'Pagado' })
      };
      purchases.findByPk.mockResolvedValue(mockData);

      await updatePurchase(1, { status: 'Pagado', payment_method: 'Transferencia' });

      expect(mockData.status).toBe('Pagado');
      expect(mockData.payment_method).toBe('Transferencia');
      expect(mockData.save).toHaveBeenCalled();
    });
  });

  describe('cancelPurchase', () => {
    test('debe retornar error si la compra no existe', async () => {
      purchases.findByPk.mockResolvedValue(null);

      const result = await cancelPurchase(9999);

      expect(result).toEqual({ error: 'NOT_FOUND' });
    });

    test('debe retornar error si ya está cancelada', async () => {
      purchases.findByPk.mockResolvedValue({ ...mockPurchase, status: 'Cancelado' });

      const result = await cancelPurchase(1);

      expect(result).toEqual({ error: 'PURCHASE_ALREADY_CANCELLED' });
    });

    test('debe cancelar correctamente la compra', async () => {
      const mockData = {
        ...mockPurchase,
        status: 'Pendiente',
        save: jest.fn().mockResolvedValue({ ...mockPurchase, status: 'Cancelado' })
      };
      purchases.findByPk.mockResolvedValue(mockData);

      await cancelPurchase(1);

      expect(mockData.status).toBe('Cancelado');
      expect(mockData.save).toHaveBeenCalled();
    });
  });

  describe('deletePurchase', () => {
    test('debe retornar error si la compra no existe', async () => {
      purchases.findByPk.mockResolvedValue(null);

      const result = await deletePurchase(9999);

      expect(result).toEqual({ error: 'NOT_FOUND' });
    });

    test('debe retornar error si la compra no está en Pendiente', async () => {
      purchases.findByPk.mockResolvedValue({ ...mockPurchase, status: 'Pagado' });

      const result = await deletePurchase(1);

      expect(result).toEqual({ error: 'PURCHASE_CANNOT_BE_DELETED' });
    });

    test('debe eliminar compra en estado Pendiente', async () => {
      purchases.findByPk.mockResolvedValue({ ...mockPurchase, status: 'Pendiente' });
      purchases.destroy.mockResolvedValue(1);

      const result = await deletePurchase(1);

      expect(purchases.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(1);
    });
  });

  describe('Manejo de errores', () => {
    test('getAllPurchases debe propagar error de BD', async () => {
      purchases.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await expect(getAllPurchases()).rejects.toThrow('Database error');
    });

    test('getPurchase debe propagar error de BD', async () => {
      purchases.findOne.mockRejectedValue(new Error('Query error'));

      await expect(getPurchase(1)).rejects.toThrow('Query error');
    });
  });
});
