const { Op } = require('sequelize');
const { loyaltyConfig, customerPoints, pointTransactions } = require('../models/index');
const { LOYALTY_ERRORS } = require('../constants/loyaltyPoints');

/**
 * Obtiene la configuración activa de lealtad para una sucursal.
 * Prioriza la config específica de sucursal sobre la global (branch_id = null).
 * @param {number|null} branchId
 * @returns {loyaltyConfig|null}
 */
const getActiveConfig = async (branchId) => {
  const config = await loyaltyConfig.findOne({
    where: {
      is_active: true,
      [Op.or]: [
        { branch_id: branchId },
        { branch_id: null }
      ]
    },
    order: [
      // Primero la específica de sucursal, luego la global
      [
        loyaltyConfig.sequelize.literal(
          'CASE WHEN branch_id IS NOT NULL THEN 0 ELSE 1 END'
        ),
        'ASC'
      ]
    ],
    limit: 1
  });

  return config || null;
};

/**
 * Obtiene o crea el registro de puntos de un cliente.
 * @param {number} customerId
 * @param {object} transaction - Transacción de Sequelize
 * @returns {customerPoints}
 */
const getOrCreateCustomerPoints = async (customerId, transaction) => {
  const options = transaction ? { transaction } : {};

  const [record] = await customerPoints.findOrCreate({
    where: { customer_id: customerId },
    defaults: {
      customer_id: customerId,
      total_points: 0,
      lifetime_points: 0,
      updated_at: new Date()
    },
    ...options
  });

  return record;
};

/**
 * Calcula los puntos que ganaría el cliente en una venta.
 * @param {loyaltyConfig} config
 * @param {number} subtotal
 * @param {number} taxAmount
 * @param {number} discountAmount
 * @returns {number} Puntos enteros calculados
 */
const calculateEarnedPoints = (config, subtotal, taxAmount, discountAmount) => {
  let base = subtotal;

  if (config.earn_on_tax) {
    base += taxAmount;
  }

  // Si gana sobre el monto pre-descuento, se suma el descuento de vuelta
  if (config.earn_on_discount) {
    base += discountAmount;
  }

  const rawPoints = base * parseFloat(config.points_per_peso);

  switch (config.rounding_strategy) {
    case 'ceil':
      return Math.ceil(rawPoints);
    case 'round':
      return Math.round(rawPoints);
    case 'floor':
    default:
      return Math.floor(rawPoints);
  }
};

/**
 * Valida si el cliente puede canjear los puntos indicados contra el total de la venta.
 * @param {loyaltyConfig} config
 * @param {customerPoints} customerPointsRecord
 * @param {number} pointsToRedeem
 * @param {number} salesTotal
 * @returns {{ pointsDiscount: number }|{ error: string }}
 */
const validateRedeem = (config, customerPointsRecord, pointsToRedeem, salesTotal) => {
  const currentBalance = parseFloat(customerPointsRecord.total_points);

  if (pointsToRedeem > currentBalance) {
    return { error: LOYALTY_ERRORS.INSUFFICIENT_POINTS };
  }

  if (pointsToRedeem < config.min_points_redeem) {
    return { error: LOYALTY_ERRORS.POINTS_BELOW_MINIMUM };
  }

  const pointsDiscount = parseFloat((pointsToRedeem * parseFloat(config.peso_per_point)).toFixed(2));
  const maxAllowedDiscount = parseFloat((salesTotal * (parseFloat(config.max_redeem_pct) / 100)).toFixed(2));

  if (pointsDiscount > maxAllowedDiscount) {
    return { error: LOYALTY_ERRORS.POINTS_EXCEED_MAX_DISCOUNT };
  }

  if (config.max_redeem_points !== null && pointsToRedeem > config.max_redeem_points) {
    return { error: LOYALTY_ERRORS.POINTS_EXCEED_MAX_LIMIT };
  }

  return { pointsDiscount };
};

/**
 * Obtiene el registro de puntos con bloqueo para escritura. Crea el registro si no existe.
 * @param {number} customerId
 * @param {object} transaction
 * @returns {customerPoints}
 */
const getLockedCustomerPoints = async (customerId, transaction) => {
  await customerPoints.findOrCreate({
    where: { customer_id: customerId },
    defaults: {
      customer_id: customerId,
      total_points: 0,
      lifetime_points: 0,
      updated_at: new Date()
    },
    transaction
  });

  return customerPoints.findOne({
    where: { customer_id: customerId },
    lock: transaction.LOCK.UPDATE,
    transaction
  });
};

/**
 * Canjea puntos de un cliente como parte de una venta.
 * Debe ejecutarse dentro de una transacción existente.
 * @param {number} customerId
 * @param {number} pointsToRedeem
 * @param {number} pointsDiscount
 * @param {number} saleId
 * @param {number} userId
 * @param {object} transaction
 */
const redeemPoints = async (customerId, pointsToRedeem, pointsDiscount, saleId, userId, transaction) => {
  const record = await getLockedCustomerPoints(customerId, transaction);

  const currentBalance = parseFloat(record.total_points);
  const newBalance = parseFloat((currentBalance - pointsToRedeem).toFixed(2));

  await pointTransactions.create({
    customer_id: customerId,
    type: 'redeem',
    points: -pointsToRedeem,
    balance_after: newBalance,
    reference_type: 'sale',
    reference_id: saleId,
    user_id: userId,
    notes: `Canje en venta #${saleId}. Descuento aplicado: $${pointsDiscount}`
  }, { transaction });

  record.total_points = newBalance;
  record.updated_at = new Date();
  await record.save({ transaction });
};

/**
 * Acredita puntos a un cliente como resultado de una venta.
 * Debe ejecutarse dentro de una transacción existente.
 * @param {number} customerId
 * @param {number} points
 * @param {number} saleId
 * @param {number} userId
 * @param {number|null} expiryDays
 * @param {object} transaction
 */
const earnPoints = async (customerId, points, saleId, userId, expiryDays, transaction) => {
  const record = await getLockedCustomerPoints(customerId, transaction);

  const currentBalance = parseFloat(record.total_points);
  const currentLifetime = parseFloat(record.lifetime_points);
  const newBalance = parseFloat((currentBalance + points).toFixed(2));
  const newLifetime = parseFloat((currentLifetime + points).toFixed(2));

  const expiresAt = expiryDays !== null && expiryDays !== undefined
    ? new Date(Date.now() + expiryDays * 86400000)
    : null;

  await pointTransactions.create({
    customer_id: customerId,
    type: 'earn',
    points,
    balance_after: newBalance,
    reference_type: 'sale',
    reference_id: saleId,
    user_id: userId,
    expires_at: expiresAt,
    notes: `Puntos ganados en venta #${saleId}`
  }, { transaction });

  record.total_points = newBalance;
  record.lifetime_points = newLifetime;
  record.updated_at = new Date();
  await record.save({ transaction });
};

/**
 * Revierte un canje de puntos al cancelar una venta.
 * @param {number} customerId
 * @param {number} saleId
 * @param {number} userId
 * @param {object} transaction
 */
const voidRedeemPoints = async (customerId, saleId, userId, transaction) => {
  const originalTx = await pointTransactions.findOne({
    where: {
      customer_id: customerId,
      type: 'redeem',
      reference_type: 'sale',
      reference_id: saleId
    },
    transaction
  });

  if (!originalTx) return;

  const record = await getLockedCustomerPoints(customerId, transaction);
  const pointsToRestore = Math.abs(parseFloat(originalTx.points));
  const newBalance = parseFloat((parseFloat(record.total_points) + pointsToRestore).toFixed(2));

  await pointTransactions.create({
    customer_id: customerId,
    type: 'void',
    points: pointsToRestore,
    balance_after: newBalance,
    reference_type: 'sale',
    reference_id: saleId,
    user_id: userId,
    notes: `Reversión de canje por cancelación de venta #${saleId}`
  }, { transaction });

  record.total_points = newBalance;
  record.updated_at = new Date();
  await record.save({ transaction });
};

/**
 * Revierte puntos ganados al cancelar una venta.
 * @param {number} customerId
 * @param {number} saleId
 * @param {number} userId
 * @param {object} transaction
 */
const voidEarnPoints = async (customerId, saleId, userId, transaction) => {
  const originalTx = await pointTransactions.findOne({
    where: {
      customer_id: customerId,
      type: 'earn',
      reference_type: 'sale',
      reference_id: saleId
    },
    transaction
  });

  if (!originalTx) return;

  const record = await getLockedCustomerPoints(customerId, transaction);
  const earnedPoints = parseFloat(originalTx.points);
  const currentBalance = parseFloat(record.total_points);
  const currentLifetime = parseFloat(record.lifetime_points);

  // Solo se pueden quitar los puntos que el cliente tenga disponibles
  const pointsToVoid = Math.min(earnedPoints, currentBalance);
  const newBalance = parseFloat((currentBalance - pointsToVoid).toFixed(2));
  const newLifetime = parseFloat((currentLifetime - pointsToVoid).toFixed(2));

  await pointTransactions.create({
    customer_id: customerId,
    type: 'void',
    points: -pointsToVoid,
    balance_after: newBalance,
    reference_type: 'sale',
    reference_id: saleId,
    user_id: userId,
    notes: `Reversión de puntos ganados por cancelación de venta #${saleId}`
  }, { transaction });

  record.total_points = newBalance;
  record.lifetime_points = newLifetime < 0 ? 0 : newLifetime;
  record.updated_at = new Date();
  await record.save({ transaction });
};

/**
 * Devuelve el resumen de puntos de un cliente.
 * @param {number} customerId
 * @returns {customerPoints|null}
 */
const getCustomerPointsSummary = async (customerId) => {
  const record = await customerPoints.findOne({
    where: { customer_id: customerId }
  });

  return record || { customer_id: customerId, total_points: 0, lifetime_points: 0 };
};

/**
 * Devuelve el historial de transacciones de puntos de un cliente con paginación.
 * @param {number} customerId
 * @param {{ page?: number, limit?: number }} options
 * @returns {{ rows: pointTransactions[], count: number }}
 */
const getCustomerTransactions = async (customerId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  return pointTransactions.findAndCountAll({
    where: { customer_id: customerId },
    order: [['created_at', 'DESC']],
    paranoid: false,
    limit,
    offset
  });
};

/**
 * Ajuste manual de puntos (positivo o negativo) por un administrador.
 * @param {number} customerId
 * @param {number} amount - Puede ser positivo o negativo
 * @param {string} notes
 * @param {number} userId
 * @returns {{ success: true }|{ error: string }}
 */
const adjustPoints = async (customerId, amount, notes, userId) => {
  if (!amount) {
    return { error: LOYALTY_ERRORS.INVALID_ADJUST_AMOUNT };
  }

  const record = await getOrCreateCustomerPoints(customerId, null);
  const currentBalance = parseFloat(record.total_points);

  if (amount < 0 && (currentBalance + amount) < 0) {
    return { error: LOYALTY_ERRORS.ADJUST_WOULD_NEGATIVE_BALANCE };
  }

  const newBalance = parseFloat((currentBalance + amount).toFixed(2));
  const newLifetime = amount > 0
    ? parseFloat((parseFloat(record.lifetime_points) + amount).toFixed(2))
    : parseFloat(record.lifetime_points);

  await pointTransactions.create({
    customer_id: customerId,
    type: 'adjust',
    points: amount,
    balance_after: newBalance,
    reference_type: 'admin',
    reference_id: null,
    user_id: userId,
    notes: notes || null
  });

  record.total_points = newBalance;
  record.lifetime_points = newLifetime;
  record.updated_at = new Date();
  await record.save();

  return { success: true };
};

/**
 * Procesa y vence los puntos expirados de todos los clientes.
 * @param {number} userId - Usuario que ejecuta el proceso
 * @returns {{ affectedCustomers: number }}
 */
const processExpiredPoints = async (userId) => {
  const now = new Date();

  // Buscar transacciones de tipo 'earn' con fecha de expiración pasada
  const expiredTransactions = await pointTransactions.findAll({
    where: {
      type: 'earn',
      expires_at: { [Op.lte]: now },
      deleted_at: null
    }
  });

  if (expiredTransactions.length === 0) {
    return { affectedCustomers: 0 };
  }

  // Agrupar por cliente
  const byCustomer = expiredTransactions.reduce((acc, tx) => {
    const cid = tx.customer_id;
    if (!acc[cid]) acc[cid] = 0;
    acc[cid] += parseFloat(tx.points);
    return acc;
  }, {});

  let affectedCustomers = 0;

  for (const [customerIdStr, totalExpiredPoints] of Object.entries(byCustomer)) {
    const customerId = parseInt(customerIdStr, 10);
    const record = await customerPoints.findOne({ where: { customer_id: customerId } });

    if (!record) continue;

    const currentBalance = parseFloat(record.total_points);
    // Solo se pueden vencer los puntos que el cliente tenga disponibles
    const pointsToExpire = Math.min(totalExpiredPoints, currentBalance);

    if (pointsToExpire <= 0) continue;

    const newBalance = parseFloat((currentBalance - pointsToExpire).toFixed(2));

    await pointTransactions.create({
      customer_id: customerId,
      type: 'expire',
      points: -pointsToExpire,
      balance_after: newBalance,
      reference_type: 'expiry',
      reference_id: null,
      user_id: userId,
      notes: `Vencimiento automático de ${pointsToExpire} puntos`
    });

    record.total_points = newBalance;
    record.updated_at = new Date();
    await record.save();

    affectedCustomers++;
  }

  return { affectedCustomers };
};

module.exports = {
  getActiveConfig,
  getOrCreateCustomerPoints,
  calculateEarnedPoints,
  validateRedeem,
  redeemPoints,
  earnPoints,
  voidRedeemPoints,
  voidEarnPoints,
  getCustomerPointsSummary,
  getCustomerTransactions,
  adjustPoints,
  processExpiredPoints
};
