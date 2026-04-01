const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { loyaltyConfig } = require('../models/index');

const {
  getActiveConfig,
  listConfigs,
  getCustomerPointsSummary,
  getCustomerTransactions: getTransactionsService,
  adjustPoints: adjustPointsService,
  processExpiredPoints
} = require('../services/loyaltyPoints');

/**
 * Obtiene la configuración de lealtad activa para la sucursal del usuario.
 */
const getConfig = async (req, res) => {
  try {
    const branchId = req.branchId || null;
    const config = await getActiveConfig(branchId);

    if (!config) {
      handleHttpError(res, 'LOYALTY_CONFIG_NOT_FOUND', 404);
      return;
    }

    res.send({ config });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_LOYALTY_CONFIG -> ${error}`, 400);
  }
};

/**
 * Lista todas las configuraciones de lealtad (con filtro opcional por branch_id).
 */
const listAllConfigs = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const configs = await listConfigs(branchId ?? null);
    res.send({ configs });
  } catch (error) {
    handleHttpError(res, `ERROR_LIST_LOYALTY_CONFIGS -> ${error}`, 400);
  }
};

/**
 * Crea una nueva configuración de lealtad.
 */
const createConfig = async (req, res) => {
  try {
    const data = matchedData(req);
    const config = await loyaltyConfig.create(data);
    res.status(201).send({ config });
  } catch (error) {
    handleHttpError(res, `ERROR_CREATE_LOYALTY_CONFIG -> ${error}`, 400);
  }
};

/**
 * Actualiza una configuración de lealtad existente.
 */
const updateConfig = async (req, res) => {
  try {
    const data = matchedData(req);
    const { id, ...updateData } = data;

    const config = await loyaltyConfig.findByPk(id);
    if (!config) {
      handleHttpError(res, 'LOYALTY_CONFIG_NOT_FOUND', 404);
      return;
    }

    await config.update(updateData);
    res.send({ config });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_LOYALTY_CONFIG -> ${error}`, 400);
  }
};

/**
 * Obtiene el resumen de puntos de un cliente.
 */
const getCustomerPoints = async (req, res) => {
  try {
    const { customerId } = matchedData(req);

    const pointsSummary = await getCustomerPointsSummary(parseInt(customerId, 10));

    if (!pointsSummary) {
      handleHttpError(res, 'CUSTOMER_POINTS_NOT_FOUND', 404);
      return;
    }

    res.send({ points: pointsSummary });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_CUSTOMER_POINTS -> ${error}`, 400);
  }
};

/**
 * Obtiene el historial de transacciones de puntos de un cliente.
 */
const getCustomerTransactions = async (req, res) => {
  try {
    const data = matchedData(req);
    const customerId = parseInt(data.customerId, 10);
    const page = parseInt(data.page || 1, 10);
    const limit = parseInt(data.limit || 20, 10);

    const result = await getTransactionsService(customerId, { page, limit });

    res.send({
      transactions: result.rows,
      meta: {
        total: result.count,
        page,
        limit,
        pages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_CUSTOMER_TRANSACTIONS -> ${error}`, 400);
  }
};

/**
 * Ajuste manual de puntos de un cliente.
 */
const adjustPoints = async (req, res) => {
  try {
    const data = matchedData(req);
    const customerId = parseInt(data.customerId, 10);
    const userId = req.user.id;

    const result = await adjustPointsService(customerId, data.amount, data.notes, userId);

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    const points = await getCustomerPointsSummary(customerId);
    res.send({ success: true, points });
  } catch (error) {
    handleHttpError(res, `ERROR_ADJUST_POINTS -> ${error}`, 400);
  }
};

/**
 * Procesa el vencimiento de puntos expirados. Solo para superadmin.
 */
const processExpired = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await processExpiredPoints(userId);
    res.send(result);
  } catch (error) {
    handleHttpError(res, `ERROR_PROCESS_EXPIRED_POINTS -> ${error}`, 400);
  }
};

module.exports = {
  getConfig,
  listAllConfigs,
  createConfig,
  updateConfig,
  getCustomerPoints,
  getCustomerTransactions,
  adjustPoints,
  processExpired
};
