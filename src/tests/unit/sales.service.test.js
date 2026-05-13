const { sales } = require('../../models/index');
const { getAllSales, getSalesByBranch } = require('../../services/sales');

jest.mock('../../models/index', () => ({
  sales: { findAndCountAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), destroy: jest.fn() },
  saleDetails: { bulkCreate: jest.fn() },
  saleInstallments: { bulkCreate: jest.fn(), destroy: jest.fn() },
  salePayments: { create: jest.fn(), count: jest.fn() },
  saleDeliveries: {},
  customers: { findByPk: jest.fn() },
  customerAddresses: { findOne: jest.fn() },
  employees: { findByPk: jest.fn() },
  branches: { findByPk: jest.fn() },
  users: {},
  products: { findAll: jest.fn() },
  productStocks: { findAll: jest.fn(), findOne: jest.fn() },
  stockMovements: { create: jest.fn() },
  sequelize: { transaction: jest.fn() }
}));

jest.mock('../../services/accountingEngine.service', () => ({
  generateFromSale: jest.fn().mockResolvedValue(null),
  generateFromSalePayment: jest.fn().mockResolvedValue(null)
}));

jest.mock('../../services/loyaltyPoints', () => ({
  getActiveConfig: jest.fn().mockResolvedValue(null),
  getOrCreateCustomerPoints: jest.fn(),
  calculateEarnedPoints: jest.fn(),
  validateRedeem: jest.fn(),
  redeemPoints: jest.fn(),
  earnPoints: jest.fn(),
  voidRedeemPoints: jest.fn(),
  voidEarnPoints: jest.fn()
}));

const mockResult = { count: 0, rows: [] };

describe('Sales Service - Sorting (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sales.findAndCountAll.mockResolvedValue(mockResult);
  });

  // ============================================================
  // getAllSales
  // ============================================================
  describe('getAllSales', () => {
    test('default: sin params ordena por id DESC', async () => {
      await getAllSales();

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['id', 'DESC']] })
      );
    });

    test('sortBy=sales_date, sortOrder=ASC', async () => {
      await getAllSales(null, 1, 20, '', 'sales_date', 'ASC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['sales_date', 'ASC']] })
      );
    });

    test('sortBy=sales_total, sortOrder=DESC', async () => {
      await getAllSales(null, 1, 20, '', 'sales_total', 'DESC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['sales_total', 'DESC']] })
      );
    });

    test('sortBy=status usa sortOrder default DESC', async () => {
      await getAllSales(null, 1, 20, '', 'status');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['status', 'DESC']] })
      );
    });

    test('sortBy inválido hace fallback a id', async () => {
      await getAllSales(null, 1, 20, '', '; DROP TABLE sales; --', 'ASC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['id', 'ASC']] })
      );
    });

    test('sortOrder inválido hace fallback a DESC', async () => {
      await getAllSales(null, 1, 20, '', 'sales_date', 'RANDOM');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['sales_date', 'DESC']] })
      );
    });

    test('ambos params inválidos → id DESC', async () => {
      await getAllSales(null, 1, 20, '', 'invalid_col', 'INVALID_ORDER');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['id', 'DESC']] })
      );
    });

    test('retorna { sales, total } con la forma correcta', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      sales.findAndCountAll.mockResolvedValue({ count: 2, rows });

      const result = await getAllSales();

      expect(result.sales).toEqual(rows);
      expect(result.total).toBe(2);
    });

    test('filtra por branchId en el where', async () => {
      await getAllSales(3, 1, 20, '', 'id', 'ASC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ branch_id: 3 }) })
      );
    });

    test('pagination: offset calculado correctamente', async () => {
      await getAllSales(null, 3, 10, '');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 })
      );
    });
  });

  // ============================================================
  // getSalesByBranch
  // ============================================================
  describe('getSalesByBranch', () => {
    test('default: sin params ordena por id DESC', async () => {
      await getSalesByBranch(1);

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['id', 'DESC']] })
      );
    });

    test('sortBy=sales_date, sortOrder=ASC', async () => {
      await getSalesByBranch(1, 1, 20, '', 'sales_date', 'ASC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['sales_date', 'ASC']] })
      );
    });

    test('sortBy inválido hace fallback a id', async () => {
      await getSalesByBranch(1, 1, 20, '', 'created_by; --', 'DESC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['id', 'DESC']] })
      );
    });

    test('sortOrder inválido hace fallback a DESC', async () => {
      await getSalesByBranch(1, 1, 20, '', 'sales_total', 'asc');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['sales_total', 'DESC']] })
      );
    });

    test('siempre filtra por branch_id', async () => {
      await getSalesByBranch(5, 1, 20, '', 'id', 'ASC');

      expect(sales.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { branch_id: 5 } })
      );
    });

    test('propaga error de BD', async () => {
      sales.findAndCountAll.mockRejectedValue(new Error('DB error'));

      await expect(getSalesByBranch(1)).rejects.toThrow('DB error');
    });
  });
});
