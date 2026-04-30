const { sequelize } = require('../models');

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

module.exports = { getDailyMovement };
