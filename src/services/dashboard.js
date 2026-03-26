const { sequelize } = require('../models');

const getDashboardKpis = async () => {
  const [results] = await sequelize.query(`
    SELECT
      COUNT(CASE WHEN status = 'Pagado'    AND deleted_at IS NULL THEN 1 END) AS ventas_saldadas,
      COUNT(CASE WHEN status = 'Pendiente' AND deleted_at IS NULL THEN 1 END) AS ventas_pendientes,
      COUNT(CASE WHEN status = 'Cancelado' AND deleted_at IS NULL THEN 1 END) AS ventas_canceladas,
      COALESCE(SUM(CASE WHEN status = 'Pagado'    AND deleted_at IS NULL THEN sales_total ELSE 0 END), 0) AS ingreso_total,
      (SELECT COALESCE(SUM(si.amount - si.paid_amount), 0)
       FROM sale_installments si
       INNER JOIN sales s2 ON s2.id = si.sale_id AND s2.deleted_at IS NULL AND s2.status = 'Pendiente'
       WHERE si.status = 'Pendiente') AS cartera_pendiente,
      (SELECT COUNT(DISTINCT si.sale_id)
       FROM sale_installments si
       INNER JOIN sales s4 ON s4.id = si.sale_id AND s4.deleted_at IS NULL AND s4.status = 'Pendiente'
       WHERE si.status = 'Pendiente' AND si.due_date < CURDATE()) AS ventas_morosas,
      (SELECT COALESCE(SUM(si.amount - si.paid_amount), 0)
       FROM sale_installments si
       INNER JOIN sales s3 ON s3.id = si.sale_id AND s3.deleted_at IS NULL AND s3.status = 'Pendiente'
       WHERE si.status = 'Pendiente' AND si.due_date < CURDATE()) AS monto_moroso,
      (SELECT COUNT(*) FROM customers WHERE is_active = 1 AND deleted_at IS NULL) AS clientes_activos
    FROM sales
  `);
  return results[0];
};

const getDashboardTrends = async (months = 6) => {
  const [results] = await sequelize.query(`
    SELECT
      DATE_FORMAT(sales_date, '%Y-%m') AS mes,
      COUNT(CASE WHEN status != 'Cancelado' THEN 1 END) AS ventas_nuevas,
      COUNT(CASE WHEN status = 'Pagado'     THEN 1 END) AS ventas_saldadas,
      COUNT(CASE WHEN status = 'Cancelado'  THEN 1 END) AS ventas_canceladas,
      COALESCE(SUM(CASE WHEN status = 'Pagado' THEN sales_total ELSE 0 END), 0) AS ingreso_mensual
    FROM sales
    WHERE deleted_at IS NULL
      AND sales_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
    GROUP BY DATE_FORMAT(sales_date, '%Y-%m')
    ORDER BY mes ASC
  `, { replacements: { months } });
  return results;
};

const getTopProducts = async (limit = 10, months = 3) => {
  const [results] = await sequelize.query(`
    SELECT
      sd.product_id,
      p.name AS product_name,
      SUM(sd.qty) AS unidades_vendidas,
      SUM(sd.subtotal) AS ingreso_total,
      COUNT(DISTINCT sd.sale_id) AS cantidad_ventas
    FROM sale_details sd
    INNER JOIN sales s    ON s.id = sd.sale_id
      AND s.status != 'Cancelado' AND s.deleted_at IS NULL
      AND s.sales_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
    INNER JOIN products p ON p.id = sd.product_id AND p.deleted_at IS NULL
    GROUP BY sd.product_id, p.name
    ORDER BY ingreso_total DESC
    LIMIT :limit
  `, { replacements: { limit, months } });
  return results;
};

const getExpensesByMonth = async (months = 6) => {
  const [results] = await sequelize.query(`
    SELECT
      DATE_FORMAT(trans_date, '%Y-%m') AS mes,
      COALESCE(SUM(expense_amount), 0) AS total_gastos,
      COUNT(*) AS cantidad_gastos
    FROM expenses
    WHERE deleted_at IS NULL
      AND trans_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
    GROUP BY DATE_FORMAT(trans_date, '%Y-%m')
    ORDER BY mes ASC
  `, { replacements: { months } });
  return results;
};

const getExpensesByBranch = async (months = 6) => {
  const [results] = await sequelize.query(`
    SELECT
      b.id AS branch_id,
      b.name AS sucursal,
      COALESCE(SUM(e.expense_amount), 0) AS total_gastos,
      COUNT(e.id) AS cantidad_gastos
    FROM branches b
    LEFT JOIN expenses e ON e.branch_id = b.id AND e.deleted_at IS NULL
    WHERE b.deleted_at IS NULL
      AND e.trans_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
    GROUP BY b.id, b.name
    ORDER BY total_gastos DESC
  `, { replacements: { months } });
  return results;
};

module.exports = { getDashboardKpis, getDashboardTrends, getTopProducts, getExpensesByMonth, getExpensesByBranch };
