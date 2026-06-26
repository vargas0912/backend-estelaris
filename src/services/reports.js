const { sequelize } = require('../models');
const { getSystemSetting } = require('./systemSettings');

const getDailyMovement = async (branchId, date) => {
  const replacements = { branch_id: branchId, date };

  const [credits, cash, expenses, payments, transfersSent, transfersReceived] = await Promise.all([
    sequelize.query(`
      SELECT
        sd.sale_id          AS saleId,
        s.ticket            AS ticket,
        p.name              AS productName,
        c.name              AS customerName,
        TRIM(CONCAT(ca.street,
          CASE WHEN ca.neighborhood IS NOT NULL AND ca.neighborhood != ''
            THEN CONCAT(', ', ca.neighborhood) ELSE '' END
        ))                  AS customerAddress,
        sd.unit_price       AS unitPrice,
        s.sales_total       AS saleTotal,
        s.anticipo_amount   AS anticipo,
        s.due_payment       AS duePayment,
        s.payment_periods   AS paymentPeriod
      FROM sales s
      INNER JOIN sale_details sd ON sd.sale_id = s.id
      INNER JOIN products p      ON p.id = sd.product_id AND p.deleted_at IS NULL
      INNER JOIN customers c     ON c.id = s.customer_id AND c.deleted_at IS NULL
      LEFT  JOIN customer_addresses ca ON ca.id = s.customer_address_id
      WHERE s.branch_id   = :branch_id
        AND s.sales_date  = :date
        AND s.status     != 'Cancelado'
        AND s.sales_type  = 'Credito'
        AND s.deleted_at IS NULL
      ORDER BY s.id, sd.id
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        sd.sale_id    AS saleId,
        s.ticket      AS ticket,
        sd.qty,
        p.name        AS productName,
        c.name        AS customerName,
        sd.unit_price AS unitPrice,
        sd.subtotal,
        s.sales_total AS saleTotal
      FROM sales s
      INNER JOIN sale_details sd ON sd.sale_id = s.id
      INNER JOIN products p      ON p.id = sd.product_id AND p.deleted_at IS NULL
      INNER JOIN customers c     ON c.id = s.customer_id AND c.deleted_at IS NULL
      WHERE s.branch_id   = :branch_id
        AND s.sales_date  = :date
        AND s.status     != 'Cancelado'
        AND s.sales_type  = 'Contado'
        AND s.deleted_at IS NULL
      ORDER BY s.id, sd.id
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        e.id,
        e.expense_amount AS amount,
        et.name          AS concept,
        e.notes
      FROM expenses e
      INNER JOIN expense_types et ON et.id = e.expense_type_id
      WHERE e.branch_id    = :branch_id
        AND e.trans_date   = :date
        AND e.deleted_at  IS NULL
      ORDER BY e.id
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        sp.sale_id          AS saleId,
        s.ticket            AS ticket,
        c.name              AS customerName,
        sp.payment_date     AS paymentDate,
        sp.payment_amount   AS amount,
        s.due_payment       AS remainingDue
      FROM sale_payments sp
      INNER JOIN sales s     ON s.id = sp.sale_id AND s.deleted_at IS NULL
      INNER JOIN customers c ON c.id = s.customer_id AND c.deleted_at IS NULL
      WHERE sp.branch_id    = :branch_id
        AND sp.payment_date = :date
        AND sp.payment_type = 'Abono'
        AND sp.deleted_at  IS NULL
      ORDER BY sp.id
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        t.id   AS transferId,
        b.name AS toBranchName
      FROM transfers t
      INNER JOIN branches b ON b.id = t.to_branch_id AND b.deleted_at IS NULL
      WHERE t.from_branch_id  = :branch_id
        AND t.transfer_date   = :date
        AND t.status         != 'Cancelado'
        AND t.deleted_at     IS NULL
      ORDER BY t.id
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        t.id   AS transferId,
        b.name AS fromBranchName
      FROM transfers t
      INNER JOIN branches b ON b.id = t.from_branch_id AND b.deleted_at IS NULL
      WHERE t.to_branch_id  = :branch_id
        AND t.transfer_date = :date
        AND t.status        = 'Recibido'
        AND t.deleted_at   IS NULL
      ORDER BY t.id
    `, { replacements, type: sequelize.QueryTypes.SELECT })
  ]);

  // Compute totals; credits has one row per detail so deduplicate on saleId for anticipo
  const seenSaleIds = new Set();
  let anticipos = 0;
  for (const row of credits) {
    if (!seenSaleIds.has(row.saleId)) {
      seenSaleIds.add(row.saleId);
      anticipos += parseFloat(row.anticipo) || 0;
    }
  }

  const cashSales = cash.reduce((sum, r) => sum + (parseFloat(r.subtotal) || 0), 0);
  const expensesTotal = expenses.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const paymentsTotal = payments.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return {
    credits,
    cash,
    expenses,
    payments,
    transfersSent,
    transfersReceived,
    totals: {
      anticipos: Math.round(anticipos * 100) / 100,
      cashSales: Math.round(cashSales * 100) / 100,
      expenses: Math.round(expensesTotal * 100) / 100,
      payments: Math.round(paymentsTotal * 100) / 100
    }
  };
};

const getAccountsReceivable = async (branchId) => {
  const setting = await getSystemSetting('timezone');
  const tz = setting?.value || 'America/Mexico_City';
  const today = new Date().toLocaleDateString('en-CA', { timeZone: tz });

  const replacements = { branch_id: branchId };

  const [sales, installments, paymentsRaw] = await Promise.all([
    sequelize.query(`
      SELECT
        s.id              AS saleId,
        s.ticket          AS ticket,
        s.customer_id     AS customerId,
        c.name            AS customerName,
        s.sales_date      AS salesDate,
        s.due_date        AS dueDate,
        s.sales_total     AS salesTotal,
        s.anticipo_amount AS anticipoAmount,
        s.due_payment     AS duePayment,
        s.payment_periods AS paymentPeriod,
        s.total_days_term AS totalDaysTerm
      FROM sales s
      INNER JOIN customers c ON c.id = s.customer_id AND c.deleted_at IS NULL
      WHERE s.branch_id  = :branch_id
        AND s.sales_type = 'Credito'
        AND s.status     = 'Pendiente'
        AND s.deleted_at IS NULL
      ORDER BY s.sales_date DESC, s.id DESC
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        si.sale_id            AS saleId,
        si.installment_number AS installmentNumber,
        si.due_date           AS dueDate,
        si.amount,
        si.paid_amount        AS paidAmount,
        si.status
      FROM sale_installments si
      WHERE si.sale_id IN (
        SELECT id FROM sales
        WHERE branch_id = :branch_id
          AND sales_type = 'Credito'
          AND status     = 'Pendiente'
          AND deleted_at IS NULL
      )
      ORDER BY si.sale_id, si.installment_number
    `, { replacements, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT
        sp.sale_id        AS saleId,
        sp.payment_date   AS paymentDate,
        sp.payment_amount AS amount,
        sp.payment_method AS method
      FROM sale_payments sp
      WHERE sp.sale_id IN (
        SELECT id FROM sales
        WHERE branch_id = :branch_id
          AND sales_type = 'Credito'
          AND status     = 'Pendiente'
          AND deleted_at IS NULL
      )
        AND sp.payment_type = 'Abono'
        AND sp.deleted_at  IS NULL
      ORDER BY sp.sale_id, sp.payment_date, sp.id
    `, { replacements, type: sequelize.QueryTypes.SELECT })
  ]);

  // Group installments and payments by saleId
  const installmentMap = new Map();
  for (const row of installments) {
    if (!installmentMap.has(row.saleId)) installmentMap.set(row.saleId, []);
    installmentMap.get(row.saleId).push(row);
  }

  const paymentMap = new Map();
  for (const row of paymentsRaw) {
    if (!paymentMap.has(row.saleId)) paymentMap.set(row.saleId, []);
    paymentMap.get(row.saleId).push(row);
  }

  const summary = {
    totalVencido: 0,
    totalAtrasado: 0,
    totalAlCorriente: 0,
    totalAbonanHoy: 0,
    countVencido: 0,
    countAtrasado: 0,
    countAlCorriente: 0,
    countAbonanHoy: 0
  };

  const credits = sales.map((sale) => {
    const saleInstallments = installmentMap.get(sale.saleId) || [];
    const paymentsReceived = paymentMap.get(sale.saleId) || [];
    const notPaid = saleInstallments.filter(i => i.status !== 'Pagado');

    let creditStatus;
    if (sale.dueDate && sale.dueDate <= today) {
      creditStatus = 'vencido';
    } else if (notPaid.some(i => i.dueDate < today)) {
      creditStatus = 'atrasado';
    } else if (notPaid.some(i => i.dueDate === today)) {
      creditStatus = 'abonan_hoy';
    } else {
      creditStatus = 'al_corriente';
    }

    const overdueInstallments = notPaid.filter(i => i.dueDate < today);
    const oldestOverdue = overdueInstallments[0]?.dueDate;
    const daysOverdue = oldestOverdue
      ? Math.floor((new Date(today) - new Date(oldestOverdue)) / 86400000)
      : 0;
    const overdueAmount = Math.round(
      overdueInstallments.reduce((sum, i) => sum + (parseFloat(i.amount) - parseFloat(i.paidAmount)), 0) * 100
    ) / 100;

    const due = parseFloat(sale.duePayment) || 0;
    const statusKeyMap = {
      vencido: 'Vencido',
      atrasado: 'Atrasado',
      al_corriente: 'AlCorriente',
      abonan_hoy: 'AbonanHoy'
    };
    const k = statusKeyMap[creditStatus];
    summary[`total${k}`] += due;
    summary[`count${k}`] += 1;

    return {
      saleId: sale.saleId,
      ticket: sale.ticket || null,
      customerId: sale.customerId,
      customerName: sale.customerName,
      salesDate: sale.salesDate,
      dueDate: sale.dueDate,
      salesTotal: sale.salesTotal,
      anticipoAmount: sale.anticipoAmount,
      duePayment: sale.duePayment,
      paymentPeriod: sale.paymentPeriod,
      totalDaysTerm: sale.totalDaysTerm,
      creditStatus,
      daysOverdue,
      overdueAmount,
      installments: saleInstallments,
      paymentsReceived
    };
  });

  // Round summary totals
  for (const key of ['totalVencido', 'totalAtrasado', 'totalAlCorriente', 'totalAbonanHoy']) {
    summary[key] = Math.round(summary[key] * 100) / 100;
  }

  return { credits, summary };
};

const getInventoryReport = async (branchId, startDate, endDate) => {
  const setting = await getSystemSetting('timezone');
  const tz = setting?.value || 'America/Mexico_City';

  // Compute UTC boundaries for local midnight using Intl (avoids MySQL timezone tables)
  const localDayStartUTC = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Use noon UTC as reference to safely compute the offset (avoids DST edge cases at midnight)
    const noonUTC = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const toMs = (date, timezone) => {
      const p = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(date).filter(({ type }) => type !== 'literal');
      const o = Object.fromEntries(p.map(({ type, value }) => [type, Number(value)]));
      return Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute, o.second);
    };
    const offsetMs = toMs(noonUTC, 'UTC') - toMs(noonUTC, tz);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) + offsetMs).toISOString().slice(0, 19).replace('T', ' ');
  };

  const startUTC = localDayStartUTC(startDate);
  // endUTC is exclusive: start of the day AFTER end_date in local time
  const endDayAfter = new Date(`${endDate}T00:00:00Z`);
  endDayAfter.setUTCDate(endDayAfter.getUTCDate() + 1);
  const endUTC = localDayStartUTC(endDayAfter.toISOString().slice(0, 10));

  const replacements = { branch_id: branchId, start_utc: startUTC, end_utc: endUTC };

  const rows = await sequelize.query(`
    SELECT
      p.id         AS product_id,
      p.name       AS product_name,
      p.cost_price AS unit_price,

      COALESCE((
        SELECT SUM(sm0.qty_change)
        FROM stock_movements sm0
        WHERE sm0.product_id = p.id
          AND sm0.branch_id  = :branch_id
          AND sm0.created_at < :start_utc
      ), 0) AS inicio,

      COALESCE((
        SELECT SUM(sm1.qty_change) FROM stock_movements sm1
        WHERE sm1.product_id = p.id AND sm1.branch_id = :branch_id
          AND sm1.reference_type = 'purchase'
          AND sm1.created_at >= :start_utc AND sm1.created_at < :end_utc
      ), 0) AS compro,

      COALESCE((
        SELECT SUM(sm2.qty_change) FROM stock_movements sm2
        WHERE sm2.product_id = p.id AND sm2.branch_id = :branch_id
          AND sm2.reference_type = 'transfer' AND sm2.qty_change > 0
          AND sm2.created_at >= :start_utc AND sm2.created_at < :end_utc
      ), 0) AS recibio,

      COALESCE((
        SELECT SUM(sm3.qty_change) FROM stock_movements sm3
        WHERE sm3.product_id = p.id AND sm3.branch_id = :branch_id
          AND sm3.reference_type = 'adjustment'
          AND sm3.created_at >= :start_utc AND sm3.created_at < :end_utc
      ), 0) AS cancelo,

      COALESCE((
        SELECT ABS(SUM(sm4.qty_change)) FROM stock_movements sm4
        WHERE sm4.product_id = p.id AND sm4.branch_id = :branch_id
          AND sm4.reference_type = 'transfer' AND sm4.qty_change < 0
          AND sm4.created_at >= :start_utc AND sm4.created_at < :end_utc
      ), 0) AS envio,

      COALESCE((
        SELECT ABS(SUM(sm5.qty_change)) FROM stock_movements sm5
        INNER JOIN sales s1 ON s1.id = sm5.reference_id AND s1.deleted_at IS NULL
        WHERE sm5.product_id = p.id AND sm5.branch_id = :branch_id
          AND sm5.reference_type = 'sale'
          AND s1.sales_type = 'Contado'           
          AND sm5.created_at >= :start_utc AND sm5.created_at < :end_utc
      ), 0) AS contado,

      COALESCE((
        SELECT ABS(SUM(sm6.qty_change)) FROM stock_movements sm6
        INNER JOIN sales s2 ON s2.id = sm6.reference_id AND s2.deleted_at IS NULL
        WHERE sm6.product_id = p.id AND sm6.branch_id = :branch_id
          AND sm6.reference_type = 'sale'
          AND s2.sales_type = 'Credito'           
          AND sm6.created_at >= :start_utc AND sm6.created_at < :end_utc
      ), 0) AS credito

    FROM products p
    WHERE p.deleted_at IS NULL
      AND p.is_active = 1
      AND EXISTS (
        SELECT 1 FROM product_stocks ps
        WHERE ps.product_id = p.id
          AND ps.branch_id  = :branch_id
          AND ps.quantity > 0
          AND ps.deleted_at IS NULL
      )
    ORDER BY p.name
  `, { replacements, type: sequelize.QueryTypes.SELECT });

  const round = (n) => Math.round(parseFloat(n) * 1000) / 1000;

  return rows.map((row) => {
    const inicio = round(row.inicio);
    const compro = round(row.compro);
    const recibio = round(row.recibio);
    const cancelo = round(row.cancelo);
    const envio = round(row.envio);
    const contado = round(row.contado);
    const credito = round(row.credito);
    const unitPrice = round(row.unit_price);
    const existencia = Math.round((inicio + compro + recibio + cancelo - envio - contado - credito) * 1000) / 1000;
    const importe = Math.round(unitPrice * existencia * 100) / 100;

    return {
      productId: row.product_id,
      productName: row.product_name,
      inicio,
      compro,
      recibio,
      cancelo,
      envio,
      contado,
      credito,
      existencia,
      unitPrice,
      importe
    };
  });
};

module.exports = { getDailyMovement, getAccountsReceivable, getInventoryReport };
