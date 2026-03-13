const { sequelize } = require('../../models');
const {
  getDashboardKpis,
  getDashboardTrends,
  getTopProducts,
  getExpensesByMonth,
  getExpensesByBranch
} = require('../../services/dashboard');

jest.mock('../../models', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

describe('Dashboard Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardKpis', () => {
    test('debe retornar KPIs del dashboard', async() => {
      const mockKpis = {
        ventas_saldadas: 50,
        ventas_pendientes: 10,
        ventas_canceladas: 5,
        ingreso_total: 50000.00,
        cartera_pendiente: 5000.00,
        ventas_morosas: 2,
        monto_moroso: 1000.00,
        clientes_activos: 100
      };

      sequelize.query.mockResolvedValue([[mockKpis]]);

      const result = await getDashboardKpis();

      expect(result).toEqual(mockKpis);
      expect(sequelize.query).toHaveBeenCalledTimes(1);
    });

    test('debe retornar valores por defecto con BD vacía', async() => {
      const mockKpis = {
        ventas_saldadas: 0,
        ventas_pendientes: 0,
        ventas_canceladas: 0,
        ingreso_total: 0,
        cartera_pendiente: 0,
        ventas_morosas: 0,
        monto_moroso: 0,
        clientes_activos: 0
      };

      sequelize.query.mockResolvedValue([[mockKpis]]);

      const result = await getDashboardKpis();

      expect(result.ventas_saldadas).toBe(0);
      expect(result.ingreso_total).toBe(0);
    });
  });

  describe('getDashboardTrends', () => {
    test('debe retornar tendencias de ventas por mes', async() => {
      const mockTrends = [
        { mes: '2025-01', ventas_nuevas: 20, ventas_saldadas: 15, ventas_canceladas: 2, ingreso_mensual: 10000 },
        { mes: '2025-02', ventas_nuevas: 25, ventas_saldadas: 20, ventas_canceladas: 1, ingreso_mensual: 12000 }
      ];

      sequelize.query.mockResolvedValue([mockTrends]);

      const result = await getDashboardTrends(6);

      expect(result).toEqual(mockTrends);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE_FORMAT'),
        expect.objectContaining({ replacements: { months: 6 } })
      );
    });

    test('debe usar cantidad de meses personalizada', async() => {
      sequelize.query.mockResolvedValue([[]]);

      await getDashboardTrends(12);

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ replacements: { months: 12 } })
      );
    });

    test('debe retornar array vacío sin datos', async() => {
      sequelize.query.mockResolvedValue([[]]);

      const result = await getDashboardTrends();

      expect(result).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    test('debe retornar productos más vendidos', async() => {
      const mockTopProducts = [
        { product_id: 1, product_name: 'Producto A', unidades_vendidas: 100, ingreso_total: 5000, cantidad_ventas: 50 },
        { product_id: 2, product_name: 'Producto B', unidades_vendidas: 80, ingreso_total: 4000, cantidad_ventas: 40 }
      ];

      sequelize.query.mockResolvedValue([mockTopProducts]);

      const result = await getTopProducts(10, 3);

      expect(result).toEqual(mockTopProducts);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('sale_details'),
        expect.objectContaining({ replacements: { limit: 10, months: 3 } })
      );
    });

    test('debe usar límites por defecto', async() => {
      sequelize.query.mockResolvedValue([[]]);

      await getTopProducts();

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ replacements: { limit: 10, months: 3 } })
      );
    });

    test('debe ordenar por ingreso total descendente', async() => {
      sequelize.query.mockResolvedValue([[]]);

      await getTopProducts(5);

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY ingreso_total DESC'),
        expect.any(Object)
      );
    });
  });

  describe('getExpensesByMonth', () => {
    test('debe retornar gastos por mes', async() => {
      const mockExpenses = [
        { mes: '2025-01', total_gastos: 5000, cantidad_gastos: 10 },
        { mes: '2025-02', total_gastos: 4500, cantidad_gastos: 8 }
      ];

      sequelize.query.mockResolvedValue([mockExpenses]);

      const result = await getExpensesByMonth(6);

      expect(result).toEqual(mockExpenses);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM expenses'),
        expect.objectContaining({ replacements: { months: 6 } })
      );
    });

    test('debe retornar array vacío sin gastos', async() => {
      sequelize.query.mockResolvedValue([[]]);

      const result = await getExpensesByMonth();

      expect(result).toEqual([]);
    });
  });

  describe('getExpensesByBranch', () => {
    test('debe retornar gastos agrupados por sucursal', async() => {
      const mockExpenses = [
        { branch_id: 1, sucursal: 'Sucursal Centro', total_gastos: 10000, cantidad_gastos: 20 },
        { branch_id: 2, sucursal: 'Sucursal Norte', total_gastos: 5000, cantidad_gastos: 10 }
      ];

      sequelize.query.mockResolvedValue([mockExpenses]);

      const result = await getExpensesByBranch(6);

      expect(result).toEqual(mockExpenses);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM branches'),
        expect.objectContaining({ replacements: { months: 6 } })
      );
    });

    test('debe incluir sucursales sin gastos', async() => {
      const mockExpenses = [
        { branch_id: 1, sucursal: 'Centro', total_gastos: 1000, cantidad_gastos: 5 },
        { branch_id: 2, sucursal: 'Norte', total_gastos: 0, cantidad_gastos: 0 }
      ];

      sequelize.query.mockResolvedValue([mockExpenses]);

      const result = await getExpensesByBranch(3);

      expect(result).toHaveLength(2);
    });

    test('debe ordenar por total_gastos descendente', async() => {
      sequelize.query.mockResolvedValue([[]]);

      await getExpensesByBranch();

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY total_gastos DESC'),
        expect.any(Object)
      );
    });
  });

  describe('Manejo de errores', () => {
    test('getDashboardKpis debe propagar error de BD', async() => {
      const dbError = new Error('Database error');
      sequelize.query.mockRejectedValue(dbError);

      await expect(getDashboardKpis()).rejects.toThrow('Database error');
    });

    test('getDashboardTrends debe propagar error de BD', async() => {
      sequelize.query.mockRejectedValue(new Error('Query failed'));

      await expect(getDashboardTrends()).rejects.toThrow('Query failed');
    });

    test('getTopProducts debe propagar error de BD', async() => {
      sequelize.query.mockRejectedValue(new Error('Query failed'));

      await expect(getTopProducts()).rejects.toThrow('Query failed');
    });

    test('getExpensesByMonth debe propagar error de BD', async() => {
      sequelize.query.mockRejectedValue(new Error('Query failed'));

      await expect(getExpensesByMonth()).rejects.toThrow('Query failed');
    });

    test('getExpensesByBranch debe propagar error de BD', async() => {
      sequelize.query.mockRejectedValue(new Error('Query failed'));

      await expect(getExpensesByBranch()).rejects.toThrow('Query failed');
    });
  });
});
