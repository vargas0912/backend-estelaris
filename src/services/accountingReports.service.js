const { accountingVouchers, accountingVoucherLines, accountingAccounts, accountingPeriods, branches, sequelize } = require('../models/index');
const { Op } = require('sequelize');

/**
 * Libro diario — lista de pólizas aplicadas con sus líneas
 * @param {Object} filters - { period_id, branch_id, date_from, date_to }
 */
const getJournal = async (filters) => {
  const where = { status: 'aplicada' };

  if (filters.period_id) {
    where.period_id = filters.period_id;
  }

  if (filters.branch_id) {
    where.branch_id = filters.branch_id;
  }

  if (filters.date_from && filters.date_to) {
    where.date = { [Op.between]: [filters.date_from, filters.date_to] };
  } else if (filters.date_from) {
    where.date = { [Op.gte]: filters.date_from };
  } else if (filters.date_to) {
    where.date = { [Op.lte]: filters.date_to };
  }

  const vouchers = await accountingVouchers.findAll({
    where,
    include: [
      {
        model: accountingPeriods,
        as: 'period',
        attributes: ['id', 'name', 'year', 'month']
      },
      {
        model: branches,
        as: 'branch',
        attributes: ['id', 'name']
      },
      {
        model: accountingVoucherLines,
        as: 'lines',
        include: [
          {
            model: accountingAccounts,
            as: 'account',
            attributes: ['id', 'code', 'name']
          }
        ]
      }
    ],
    order: [
      ['date', 'ASC'],
      ['folio', 'ASC']
    ]
  });

  return vouchers;
};

/**
 * Mayor contable — movimientos de una cuenta con saldo acumulado
 * @param {Object} filters - { account_id, period_id, date_from, date_to }
 */
const getLedger = async (filters) => {
  // Buscar la cuenta — falla rápido si no existe
  const account = await accountingAccounts.findByPk(filters.account_id, {
    attributes: ['id', 'code', 'name', 'type', 'nature']
  });

  if (!account) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }

  // Calcular saldo anterior
  let openingBalance = 0;

  if (filters.period_id) {
    // Buscar el período actual para comparar year/month
    const currentPeriod = await accountingPeriods.findByPk(filters.period_id, {
      attributes: ['id', 'year', 'month']
    });

    if (currentPeriod) {
      const priorPeriods = await accountingPeriods.findAll({
        where: {
          [Op.or]: [
            { year: { [Op.lt]: currentPeriod.year } },
            { year: currentPeriod.year, month: { [Op.lt]: currentPeriod.month } }
          ]
        },
        attributes: ['id']
      });

      if (priorPeriods.length > 0) {
        const priorPeriodIds = priorPeriods.map(p => p.id);

        const priorLines = await accountingVoucherLines.findAll({
          where: { account_id: filters.account_id },
          include: [
            {
              model: accountingVouchers,
              as: 'voucher',
              where: { status: 'aplicada', period_id: { [Op.in]: priorPeriodIds } },
              attributes: []
            }
          ],
          attributes: ['debit', 'credit']
        });

        openingBalance = priorLines.reduce(
          (s, l) => s + parseFloat(l.debit) - parseFloat(l.credit),
          0
        );
      }
    }
  } else if (filters.date_from) {
    const priorLines = await accountingVoucherLines.findAll({
      where: { account_id: filters.account_id },
      include: [
        {
          model: accountingVouchers,
          as: 'voucher',
          where: { status: 'aplicada', date: { [Op.lt]: filters.date_from } },
          attributes: []
        }
      ],
      attributes: ['debit', 'credit']
    });

    openingBalance = priorLines.reduce(
      (s, l) => s + parseFloat(l.debit) - parseFloat(l.credit),
      0
    );
  }

  // Construir el where para el voucher en los movimientos del período
  const voucherWhere = { status: 'aplicada' };

  if (filters.period_id) {
    voucherWhere.period_id = filters.period_id;
  }

  if (filters.date_from && filters.date_to) {
    voucherWhere.date = { [Op.between]: [filters.date_from, filters.date_to] };
  } else if (filters.date_from) {
    voucherWhere.date = { [Op.gte]: filters.date_from };
  } else if (filters.date_to) {
    voucherWhere.date = { [Op.lte]: filters.date_to };
  }

  // Movimientos del período con join a voucher para filtros
  const lines = await accountingVoucherLines.findAll({
    where: { account_id: filters.account_id },
    include: [
      {
        model: accountingVouchers,
        as: 'voucher',
        where: voucherWhere,
        attributes: ['id', 'folio', 'date', 'description', 'type']
      }
    ],
    order: [
      [{ model: accountingVouchers, as: 'voucher' }, 'date', 'ASC'],
      [{ model: accountingVouchers, as: 'voucher' }, 'folio', 'ASC']
    ]
  });

  // Calcular saldo acumulado en JS
  let runningBalance = openingBalance;
  const movements = lines.map(line => {
    runningBalance += parseFloat(line.debit) - parseFloat(line.credit);
    return {
      date: line.voucher.date,
      folio: line.voucher.folio,
      description: line.description || line.voucher.description,
      debit: parseFloat(line.debit),
      credit: parseFloat(line.credit),
      balance: runningBalance
    };
  });

  return {
    account: {
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      nature: account.nature
    },
    opening_balance: openingBalance,
    movements,
    closing_balance: runningBalance
  };
};

/**
 * Balanza de comprobación — sumas y saldos por cuenta en un período
 * @param {Object} filters - { period_id }
 */
const getTrialBalance = async (filters) => {
  const sql = `
    SELECT
      aa.id,
      aa.code,
      aa.name,
      aa.type,
      aa.nature,
      aa.level,
      SUM(avl.debit)  AS total_debit,
      SUM(avl.credit) AS total_credit,
      GREATEST(SUM(avl.debit) - SUM(avl.credit), 0) AS debit_balance,
      GREATEST(SUM(avl.credit) - SUM(avl.debit), 0) AS credit_balance
    FROM accounting_voucher_lines avl
    INNER JOIN accounting_vouchers av ON av.id = avl.voucher_id AND av.deleted_at IS NULL AND av.status = 'aplicada'
    INNER JOIN accounting_accounts aa ON aa.id = avl.account_id
    WHERE av.period_id = :period_id
    GROUP BY aa.id, aa.code, aa.name, aa.type, aa.nature, aa.level
    ORDER BY aa.code ASC
  `;

  const accounts = await sequelize.query(sql, {
    replacements: { period_id: filters.period_id },
    type: sequelize.QueryTypes.SELECT
  });

  const totalDebit = accounts.reduce((s, r) => s + parseFloat(r.total_debit || 0), 0);
  const totalCredit = accounts.reduce((s, r) => s + parseFloat(r.total_credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return {
    period_id: filters.period_id,
    accounts,
    total_debit: totalDebit,
    total_credit: totalCredit,
    balanced
  };
};

/**
 * Balance general — activo, pasivo y capital en un período
 * @param {Object} filters - { period_id }
 */
const getBalanceSheet = async (filters) => {
  const sql = `
    SELECT
      aa.id,
      aa.code,
      aa.name,
      aa.type,
      aa.nature,
      aa.level,
      aa.parent_id,
      SUM(avl.debit) - SUM(avl.credit) AS balance
    FROM accounting_voucher_lines avl
    INNER JOIN accounting_vouchers av ON av.id = avl.voucher_id AND av.deleted_at IS NULL AND av.status = 'aplicada'
    INNER JOIN accounting_accounts aa ON aa.id = avl.account_id
    WHERE av.period_id = :period_id
      AND aa.type IN ('activo', 'pasivo', 'capital')
    GROUP BY aa.id, aa.code, aa.name, aa.type, aa.nature, aa.level, aa.parent_id
    ORDER BY aa.code ASC
  `;

  const accounts = await sequelize.query(sql, {
    replacements: { period_id: filters.period_id },
    type: sequelize.QueryTypes.SELECT
  });

  const activo = accounts.filter(r => r.type === 'activo');
  const pasivo = accounts.filter(r => r.type === 'pasivo');
  const capital = accounts.filter(r => r.type === 'capital');

  const totalActivo = activo.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const totalPasivo = pasivo.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const totalCapital = capital.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const balanced = Math.abs(totalActivo - (totalPasivo + totalCapital)) < 0.01;

  return {
    period_id: filters.period_id,
    activo: { accounts: activo, total: totalActivo },
    pasivo: { accounts: pasivo, total: totalPasivo },
    capital: { accounts: capital, total: totalCapital },
    total_pasivo_capital: totalPasivo + totalCapital,
    balanced
  };
};

/**
 * Estado de resultados — ingresos, costos y egresos de un período
 * @param {Object} filters - { period_id, branch_id }
 */
const getIncomeStatement = async (filters) => {
  const branchClause = filters.branch_id ? 'AND av.branch_id = :branch_id' : '';

  const sql = `
    SELECT
      aa.id,
      aa.code,
      aa.name,
      aa.type,
      aa.level,
      aa.parent_id,
      SUM(avl.debit) - SUM(avl.credit) AS balance
    FROM accounting_voucher_lines avl
    INNER JOIN accounting_vouchers av ON av.id = avl.voucher_id AND av.deleted_at IS NULL AND av.status = 'aplicada'
    INNER JOIN accounting_accounts aa ON aa.id = avl.account_id
    WHERE av.period_id = :period_id
      ${branchClause}
      AND aa.type IN ('ingreso', 'costo', 'egreso')
    GROUP BY aa.id, aa.code, aa.name, aa.type, aa.level, aa.parent_id
    ORDER BY aa.code ASC
  `;

  const replacements = { period_id: filters.period_id };
  if (filters.branch_id) replacements.branch_id = filters.branch_id;

  const accounts = await sequelize.query(sql, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  });

  const ingresos = accounts.filter(r => r.type === 'ingreso');
  const costos = accounts.filter(r => r.type === 'costo');
  const egresos = accounts.filter(r => r.type === 'egreso');

  // Ingresos son acreedores: balance SQL = debit - credit → valor negativo; se invierte
  const ventasNetas = ingresos.reduce((s, r) => s + Math.abs(parseFloat(r.balance || 0)), 0);
  const costoVentas = costos.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const utilidadBruta = ventasNetas - costoVentas;
  const gastosOperacion = egresos.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const utilidadNeta = utilidadBruta - gastosOperacion;

  return {
    period_id: filters.period_id,
    branch_id: filters.branch_id || null,
    ingresos: { accounts: ingresos, total: ventasNetas },
    costos: { accounts: costos, total: costoVentas },
    egresos: { accounts: egresos, total: gastosOperacion },
    ventas_netas: ventasNetas,
    costo_ventas: costoVentas,
    utilidad_bruta: utilidadBruta,
    gastos_operacion: gastosOperacion,
    utilidad_neta: utilidadNeta
  };
};

module.exports = { getJournal, getLedger, getTrialBalance, getBalanceSheet, getIncomeStatement };
