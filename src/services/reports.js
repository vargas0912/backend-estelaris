const { sequelize } = require('../models');
const { getSystemSetting } = require('./systemSettings');

const getDailyMovement = async (branchId, date) => {
  const replacements = { branch_id: branchId, date };

  const [credits, cash, expenses, payments, transfersSent, transfersReceived] = await Promise.all([
    sequelize.query(`
      SELECT
        sd.sale_id          AS saleId,
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

module.exports = { getDailyMovement, getAccountsReceivable };
