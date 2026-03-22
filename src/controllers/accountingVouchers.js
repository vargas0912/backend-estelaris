const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  applyVoucher,
  cancelVoucher,
  deleteVoucher
} = require('../services/accountingVouchers');

// Mapeo de códigos de error del servicio → HTTP status codes
const ERROR_STATUS_MAP = {
  NOT_FOUND: 404,
  PERIOD_NOT_FOUND: 404,
  ACCOUNT_NOT_FOUND: 404,
  PERIOD_NOT_OPEN: 409,
  VOUCHER_NOT_DRAFT: 409,
  VOUCHER_ALREADY_CANCELLED: 409,
  UNBALANCED_VOUCHER: 422,
  MIN_TWO_LINES: 422,
  ACCOUNT_NOT_ALLOWS_MOVEMENTS: 422
};

/**
 * Maneja errores del servicio: busca el status code en el mapa y llama handleHttpError.
 */
const handleServiceError = (res, error) => {
  const status = ERROR_STATUS_MAP[error] || 400;
  handleHttpError(res, error, status);
};

const getAll = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    const vouchers = await getAllVouchers(filters);
    res.send({ vouchers });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const voucher = await getVoucherById(id);

    if (!voucher) {
      handleHttpError(res, `VOUCHER ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ voucher });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const create = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const result = await createVoucher(data, userId);

    if (result && result.error) {
      handleServiceError(res, result.error);
      return;
    }

    res.send({ voucher: result });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD -> ${error}`, 400);
  }
};

const update = async (req, res) => {
  try {
    const data = matchedData(req);
    const result = await updateVoucher(data.id, data);

    if (result && result.error) {
      handleServiceError(res, result.error);
      return;
    }

    res.send({ voucher: result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD -> ${error}`, 400);
  }
};

const apply = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await applyVoucher(id);

    if (result && result.error) {
      handleServiceError(res, result.error);
      return;
    }

    res.send({ voucher: result });
  } catch (error) {
    handleHttpError(res, `ERROR_APPLY_RECORD -> ${error}`, 400);
  }
};

const cancel = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await cancelVoucher(id);

    if (result && result.error) {
      handleServiceError(res, result.error);
      return;
    }

    res.send({ voucher: result });
  } catch (error) {
    handleHttpError(res, `ERROR_CANCEL_RECORD -> ${error}`, 400);
  }
};

const remove = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteVoucher(id);

    if (result && result.error) {
      handleServiceError(res, result.error);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error}`, 400);
  }
};

module.exports = { getAll, getById, create, update, apply, cancel, remove };
