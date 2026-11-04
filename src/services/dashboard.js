const { sequelize } = require('../models');

const getDashboardKpis = async (months = 6) => {
  const [results] = await sequelize.query(`
    SELECT
      COUNT(CASE WHEN status = 'Pagado'    THEN 1 END) AS ventas_saldadas,
      COUNT(CASE WHEN status = 'Pendiente' THEN 1 END) AS ventas_pendientes,
      COUNT(CASE WHEN status = 'Cancelado' THEN 1 END) AS ventas_canceladas,
      COALESCE(SUM(CASE WHEN status = 'Pagado' THEN sales_total ELSE 0 END), 0) AS ingreso_total,
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
    WHERE deleted_at IS NULL
      AND sales_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
  `, { replacements: { months } });
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

const TOP_PRODUCTS_SORT_COLUMNS = {
  unidades_vendidas: 'unidades_vendidas',
  ingreso_total: 'ingreso_total'
};

const getTopProducts = async (limit = 10, months = 3, sortBy = 'unidades_vendidas') => {
  const orderColumn = TOP_PRODUCTS_SORT_COLUMNS[sortBy] || 'unidades_vendidas';
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
    ORDER BY ${orderColumn} DESC
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

const getRecentSales = async (limit = 25) => {
  const [results] = await sequelize.query(`
    SELECT
      s.id,
      s.sales_date,
      b.name AS branch_name,
      s.sales_total,
      s.status
    FROM sales s
    INNER JOIN branches b ON b.id = s.branch_id AND b.deleted_at IS NULL
    WHERE s.deleted_at IS NULL
    ORDER BY s.sales_date DESC, s.id DESC
    LIMIT :limit
  `, { replacements: { limit } });
  return results;
};

const getSalesByBranch = async (months = 6) => {
  const [results] = await sequelize.query(`
    SELECT
      b.id AS branch_id,
      b.name AS branch_name,
      COUNT(CASE WHEN s.status != 'Cancelado' THEN 1 END) AS total_ventas,
      COALESCE(SUM(CASE WHEN s.status != 'Cancelado' THEN s.sales_total ELSE 0 END), 0) AS ingreso_total,
      COUNT(CASE WHEN s.status = 'Pagado'    THEN 1 END) AS ventas_saldadas,
      COUNT(CASE WHEN s.status = 'Pendiente' THEN 1 END) AS ventas_pendientes,
      COUNT(CASE WHEN s.status = 'Cancelado' THEN 1 END) AS ventas_canceladas
    FROM branches b
    LEFT JOIN sales s ON s.branch_id = b.id
      AND s.deleted_at IS NULL
      AND s.sales_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL :months MONTH), '%Y-%m-01')
    WHERE b.deleted_at IS NULL
    GROUP BY b.id, b.name
    ORDER BY ingreso_total DESC
  `, { replacements: { months } });
  return results;
};

const DEFAULT_AGING_BUCKETS = [30, 60, 90];

/**
 * Builds contiguous age ranges from ascending day thresholds.
 * [30, 60, 90] => 0-30, 31-60, 61-90, 91+
 */
const buildAgingBuckets = (thresholds) => {
  const buckets = [];
  let min = 0;
  thresholds.forEach((max) => {
    buckets.push({ label: `${min}-${max}`, min_days: min, max_days: max });
    min = max + 1;
  });
  buckets.push({ label: `${min}+`, min_days: min, max_days: null });
  return buckets;
};

const round2 = (n) => Math.round(n * 100) / 100;

const getAgingLots = async ({ buckets = DEFAULT_AGING_BUCKETS, minDays, limit = 50, branchId } = {}) => {
  const bucketDefs = buildAgingBuckets(buckets);
  const oldestBucketStart = bucketDefs[bucketDefs.length - 1].min_days;
  const listMinDays = minDays === undefined ? oldestBucketStart : minDays;
  const branchFilter = branchId ? 'AND ps.branch_id = :branchId' : '';

  const [rows] = await sequelize.query(`
    SELECT
      ps.branch_id,
      b.name AS branch_name,
      ps.product_id,
      p.name AS product_name,
      ps.purch_id,
      ps.bar_code,
      ps.quantity,
      COALESCE(pu.received_at, pu.purch_date) AS received_date,
      DATEDIFF(CURDATE(), COALESCE(pu.received_at, pu.purch_date)) AS days_in_stock,
      COALESCE(pd.unit_cost, 0) AS unit_cost,
      ps.quantity * COALESCE(pd.unit_cost, 0) AS stock_value,
      COALESCE(sold.units_sold, 0) AS units_sold,
      sold.last_sale_date,
      DATEDIFF(CURDATE(), sold.last_sale_date) AS days_since_last_sale
    FROM product_stocks ps
    INNER JOIN purchases pu ON pu.id = ps.purch_id AND pu.deleted_at IS NULL
    INNER JOIN products p   ON p.id = ps.product_id AND p.deleted_at IS NULL
    INNER JOIN branches b   ON b.id = ps.branch_id AND b.deleted_at IS NULL
    LEFT JOIN (
      SELECT purch_id, product_id,
             SUM(qty * unit_price) / NULLIF(SUM(qty), 0) AS unit_cost
      FROM purchase_details
      GROUP BY purch_id, product_id
    ) pd ON pd.purch_id = ps.purch_id AND pd.product_id = ps.product_id
    LEFT JOIN (
      SELECT sd.purch_id, sd.product_id, s.branch_id,
             SUM(sd.qty) AS units_sold,
             MAX(s.sales_date) AS last_sale_date
      FROM sale_details sd
      INNER JOIN sales s ON s.id = sd.sale_id
        AND s.status != 'Cancelado' AND s.deleted_at IS NULL
      GROUP BY sd.purch_id, sd.product_id, s.branch_id
    ) sold ON sold.purch_id = ps.purch_id
      AND sold.product_id = ps.product_id
      AND sold.branch_id = ps.branch_id
    WHERE ps.deleted_at IS NULL
      AND ps.purch_id IS NOT NULL
      AND ps.quantity > 0
      ${branchFilter}
  `, { replacements: { branchId } });

  const lots = rows.map((r) => {
    const quantity = Number(r.quantity);
    const unitsSold = Number(r.units_sold);
    const daysInStock = Number(r.days_in_stock) || 0;
    const received = unitsSold + quantity;
    return {
      branch_id: r.branch_id,
      branch_name: r.branch_name,
      product_id: r.product_id,
      product_name: r.product_name,
      purch_id: r.purch_id,
      bar_code: r.bar_code,
      quantity,
      received_date: r.received_date,
      days_in_stock: daysInStock,
      unit_cost: round2(Number(r.unit_cost)),
      stock_value: round2(Number(r.stock_value)),
      units_sold: unitsSold,
      sell_through_pct: received > 0 ? round2((unitsSold / received) * 100) : 0,
      last_sale_date: r.last_sale_date,
      days_since_last_sale: r.days_since_last_sale === null ? null : Number(r.days_since_last_sale)
    };
  });

  const summary = bucketDefs.map((def) => {
    const inBucket = lots.filter(l => l.days_in_stock >= def.min_days &&
      (def.max_days === null || l.days_in_stock <= def.max_days));
    return {
      ...def,
      lots: inBucket.length,
      quantity: round2(inBucket.reduce((acc, l) => acc + l.quantity, 0)),
      stock_value: round2(inBucket.reduce((acc, l) => acc + l.stock_value, 0))
    };
  });

  const list = lots
    .filter(l => l.days_in_stock >= listMinDays)
    .sort((a, b) => b.stock_value - a.stock_value || b.days_in_stock - a.days_in_stock)
    .slice(0, limit);

  return { buckets: summary, lots: list };
};

module.exports = { getDashboardKpis, getDashboardTrends, getTopProducts, getExpensesByMonth, getExpensesByBranch, getRecentSales, getSalesByBranch, getAgingLots };
