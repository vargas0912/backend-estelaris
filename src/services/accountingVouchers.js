const {
  accountingVouchers,
  accountingVoucherLines,
  accountingPeriods,
  accountingAccounts,
  branches,
  users,
  sequelize
} = require('../models/index');
const { Op } = require('sequelize');

// ─── Includes reutilizables ───────────────────────────────────────────────────

const periodAttributes = ['id', 'name', 'year', 'month', 'status'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];
const accountAttributes = ['id', 'code', 'name', 'type', 'nature'];

const voucherWithLinesInclude = [
  { model: accountingPeriods, as: 'period', attributes: periodAttributes },
  { model: branches, as: 'branch', attributes: branchAttributes },
  { model: users, as: 'createdBy', attributes: userAttributes },
  {
    model: accountingVoucherLines,
    as: 'lines',
    include: [{ model: accountingAccounts, as: 'account', attributes: accountAttributes }]
  }
];

const voucherListInclude = [
  { model: accountingPeriods, as: 'period', attributes: periodAttributes },
  { model: branches, as: 'branch', attributes: branchAttributes },
  { model: users, as: 'createdBy', attributes: userAttributes }
];

// ─── Auxiliares internos ─────────────────────────────────────────────────────

/**
 * Genera el folio de la póliza dentro de una transacción activa.
 * Formato: POL-{year}-{month:02d}-{count+1:03d}  →  POL-2026-03-001
 */
const generateFolio = async (periodId, t) => {
  // Contar todas las pólizas del período, incluyendo eliminadas (paranoid: false)
  const count = await accountingVouchers.count({
    where: { period_id: periodId },
    paranoid: false,
    transaction: t
  });

  const period = await accountingPeriods.findByPk(periodId, { transaction: t });
  const month = String(period.month).padStart(2, '0');
  const seq = String(count + 1).padStart(3, '0');

  return `POL-${period.year}-${month}-${seq}`;
};

/**
 * Obtiene una póliza completa con todas sus relaciones por ID.
 */
const getVoucher = async (id) => {
  return accountingVouchers.findByPk(id, {
    include: voucherWithLinesInclude,
    order: [[{ model: accountingVoucherLines, as: 'lines' }, 'order', 'ASC']]
  });
};

// ─── Funciones exportadas ─────────────────────────────────────────────────────

/**
 * Lista todas las pólizas con filtros opcionales.
 */
const getAllVouchers = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.period_id !== undefined) where.period_id = filters.period_id;
  if (filters.branch_id !== undefined) where.branch_id = filters.branch_id;
  if (filters.type !== undefined) where.type = filters.type;
  if (filters.status !== undefined) where.status = filters.status;
  if (filters.reference_type !== undefined) where.reference_type = filters.reference_type;
  if (filters.reference_id !== undefined) where.reference_id = filters.reference_id;
  if (filters.search) where.folio = { [Op.like]: `%${filters.search}%` };

  const { count, rows } = await accountingVouchers.findAndCountAll({
    where,
    include: voucherListInclude,
    order: [
      ['date', 'DESC'],
      ['folio', 'ASC']
    ],
    limit,
    offset,
    distinct: true
  });
  return { vouchers: rows, total: count };
};

/**
 * Obtiene una póliza por ID. Retorna null si no existe.
 */
const getVoucherById = async (id) => {
  return getVoucher(id);
};

/**
 * Crea una póliza nueva en estado 'borrador'.
 */
const createVoucher = async (body, userId) => {
  const {
    type,
    period_id: periodId,
    branch_id: branchId,
    date,
    description,
    reference_type: referenceType,
    reference_id: referenceId,
    lines
  } = body;

  // Validar período
  const period = await accountingPeriods.findByPk(periodId);
  if (!period) return { error: 'PERIOD_NOT_FOUND' };
  if (period.status !== 'abierto') return { error: 'PERIOD_NOT_OPEN' };

  // Validar mínimo de líneas
  if (!lines || lines.length < 2) return { error: 'MIN_TWO_LINES' };

  // Validar cuentas contables en paralelo
  const accountIds = lines.map(l => l.account_id);
  const foundAccounts = await Promise.all(
    accountIds.map(id => accountingAccounts.findByPk(id, { attributes: ['id', 'allows_movements'] }))
  );

  for (const account of foundAccounts) {
    if (!account) return { error: 'ACCOUNT_NOT_FOUND' };
    if (!account.allows_movements) return { error: 'ACCOUNT_NOT_ALLOWS_MOVEMENTS' };
  }

  const t = await sequelize.transaction();

  try {
    const folio = await generateFolio(periodId, t);

    const voucher = await accountingVouchers.create({
      folio,
      type,
      period_id: periodId,
      branch_id: branchId || null,
      date,
      description,
      status: 'borrador',
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      created_by_user_id: userId
    }, { transaction: t });

    const lineRecords = lines.map((l, i) => ({
      voucher_id: voucher.id,
      account_id: l.account_id,
      debit: l.debit ?? 0,
      credit: l.credit ?? 0,
      description: l.description || null,
      order: l.order !== undefined ? l.order : i,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await accountingVoucherLines.bulkCreate(lineRecords, { transaction: t });

    await t.commit();

    return getVoucher(voucher.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Actualiza una póliza en estado 'borrador'.
 */
const updateVoucher = async (id, body) => {
  const voucher = await accountingVouchers.findByPk(id);
  if (!voucher) return { error: 'NOT_FOUND' };
  if (voucher.status !== 'borrador') return { error: 'VOUCHER_NOT_DRAFT' };

  const {
    type,
    period_id: periodId,
    branch_id: branchId,
    date,
    description,
    reference_type: referenceType,
    reference_id: referenceId,
    lines
  } = body;

  // Validar nuevo período si cambia
  if (periodId !== undefined && periodId !== voucher.period_id) {
    const newPeriod = await accountingPeriods.findByPk(periodId);
    if (!newPeriod) return { error: 'PERIOD_NOT_FOUND' };
    if (newPeriod.status !== 'abierto') return { error: 'PERIOD_NOT_OPEN' };
  }

  // Validar líneas si vienen en el body
  if (lines !== undefined) {
    if (lines.length < 2) return { error: 'MIN_TWO_LINES' };

    const accountIds = lines.map(l => l.account_id);
    const foundAccounts = await Promise.all(
      accountIds.map(aId => accountingAccounts.findByPk(aId, { attributes: ['id', 'allows_movements'] }))
    );

    for (const account of foundAccounts) {
      if (!account) return { error: 'ACCOUNT_NOT_FOUND' };
      if (!account.allows_movements) return { error: 'ACCOUNT_NOT_ALLOWS_MOVEMENTS' };
    }
  }

  const t = await sequelize.transaction();

  try {
    // Actualizar campos presentes en el body
    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (periodId !== undefined) updateData.period_id = periodId;
    if (branchId !== undefined) updateData.branch_id = branchId;
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    if (referenceType !== undefined) updateData.reference_type = referenceType;
    if (referenceId !== undefined) updateData.reference_id = referenceId;

    await voucher.update(updateData, { transaction: t });

    // Reemplazar líneas si vienen en el body
    if (lines !== undefined) {
      await accountingVoucherLines.destroy({ where: { voucher_id: id }, transaction: t });

      const lineRecords = lines.map((l, i) => ({
        voucher_id: id,
        account_id: l.account_id,
        debit: l.debit ?? 0,
        credit: l.credit ?? 0,
        description: l.description || null,
        order: l.order !== undefined ? l.order : i,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await accountingVoucherLines.bulkCreate(lineRecords, { transaction: t });
    }

    await t.commit();

    return getVoucher(id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Aplica una póliza borrador. Valida cuadre contable antes de marcarla como aplicada.
 */
const applyVoucher = async (id) => {
  const voucher = await accountingVouchers.findByPk(id, {
    include: [{ model: accountingVoucherLines, as: 'lines' }]
  });

  if (!voucher) return { error: 'NOT_FOUND' };
  if (voucher.status !== 'borrador') return { error: 'VOUCHER_NOT_DRAFT' };
  if (!voucher.lines || voucher.lines.length < 2) return { error: 'MIN_TWO_LINES' };

  // Verificar cuadre contable
  const totalDebit = voucher.lines.reduce((s, l) => s + parseFloat(l.debit), 0);
  const totalCredit = voucher.lines.reduce((s, l) => s + parseFloat(l.credit), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) return { error: 'UNBALANCED_VOUCHER' };

  // Verificar que el período sigue abierto
  const period = await accountingPeriods.findByPk(voucher.period_id);
  if (!period || period.status !== 'abierto') return { error: 'PERIOD_NOT_OPEN' };

  const t = await sequelize.transaction();

  try {
    await voucher.update({ status: 'aplicada', applied_at: new Date() }, { transaction: t });
    await t.commit();

    return getVoucher(id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Cancela una póliza.
 * - Borrador → se cancela directo.
 * - Aplicada → se cancela y se genera póliza inversa automáticamente (tipo ajuste).
 */
const cancelVoucher = async (id) => {
  const voucher = await accountingVouchers.findByPk(id, {
    include: [{ model: accountingVoucherLines, as: 'lines' }]
  });

  if (!voucher) return { error: 'NOT_FOUND' };
  if (voucher.status === 'cancelada') return { error: 'VOUCHER_ALREADY_CANCELLED' };

  const t = await sequelize.transaction();

  try {
    if (voucher.status === 'borrador') {
      // Cancelación simple: solo cambia el status
      await voucher.update({ status: 'cancelada' }, { transaction: t });
    } else {
      // Póliza aplicada: cancelar y generar reversión
      await voucher.update({ status: 'cancelada' }, { transaction: t });

      // Generar folio para la póliza inversa
      const reversalFolio = await generateFolio(voucher.period_id, t);

      const reversalVoucher = await accountingVouchers.create({
        folio: reversalFolio,
        type: 'ajuste',
        period_id: voucher.period_id,
        branch_id: voucher.branch_id,
        date: voucher.date,
        description: `Reversión de ${voucher.folio}: ${voucher.description}`,
        status: 'aplicada',
        reference_type: voucher.reference_type,
        reference_id: voucher.reference_id,
        created_by_user_id: voucher.created_by_user_id,
        applied_at: new Date()
      }, { transaction: t });

      // Líneas inversas: debit y credit intercambiados
      const reversalLines = voucher.lines.map((l, i) => ({
        voucher_id: reversalVoucher.id,
        account_id: l.account_id,
        debit: l.credit,
        credit: l.debit,
        description: l.description,
        order: l.order !== undefined ? l.order : i,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await accountingVoucherLines.bulkCreate(reversalLines, { transaction: t });
    }

    await t.commit();

    // Retorna la póliza original (ahora cancelada)
    return getVoucher(id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Elimina (soft delete) una póliza en estado borrador.
 */
const deleteVoucher = async (id) => {
  const voucher = await accountingVouchers.findByPk(id);
  if (!voucher) return { error: 'NOT_FOUND' };
  if (voucher.status !== 'borrador') return { error: 'VOUCHER_NOT_DRAFT' };

  const t = await sequelize.transaction();

  try {
    // Eliminar líneas (paranoid: false, se eliminan físicamente)
    await accountingVoucherLines.destroy({ where: { voucher_id: id }, transaction: t });

    // Soft delete de la póliza (paranoid: true)
    await voucher.destroy({ transaction: t });

    await t.commit();

    return { deleted: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  applyVoucher,
  cancelVoucher,
  deleteVoucher
};
