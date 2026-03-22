const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { generateCatalog, generateVouchers } = require('../services/satAccounting.service');

const ERROR_STATUS_MAP = {
  PERIOD_NOT_FOUND: 404,
  PERIOD_MUST_BE_CLOSED: 409
};

const postCatalog = async (req, res) => {
  try {
    const { periodId } = matchedData(req);
    const result = await generateCatalog(Number(periodId));

    if (result.error) {
      return handleHttpError(res, result.error, ERROR_STATUS_MAP[result.error] || 500);
    }

    res.set('Content-Type', 'application/xml');
    res.set('Content-Disposition', `attachment; filename="catalogo_cuentas_${periodId}.xml"`);
    return res.status(200).send(result.xml);
  } catch (e) {
    handleHttpError(res, 'ERROR_GENERATING_CATALOG', 500);
  }
};

const postVouchers = async (req, res) => {
  try {
    const { periodId } = matchedData(req);
    const result = await generateVouchers(Number(periodId));

    if (result.error) {
      return handleHttpError(res, result.error, ERROR_STATUS_MAP[result.error] || 500);
    }

    res.set('Content-Type', 'application/xml');
    res.set('Content-Disposition', `attachment; filename="polizas_${periodId}.xml"`);
    return res.status(200).send(result.xml);
  } catch (e) {
    handleHttpError(res, 'ERROR_GENERATING_VOUCHERS', 500);
  }
};

module.exports = { postCatalog, postVouchers };
