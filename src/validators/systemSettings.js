const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');
const { SYSTEM_SETTINGS_VALIDATORS } = require('../constants/systemSettings');

/**
 * Validación para PUT /api/system-settings/:key
 * El campo value es requerido.
 */
const validateGetAll = [
  check('category').optional().isString(),
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('value')
    .exists().withMessage(SYSTEM_SETTINGS_VALIDATORS.VALUE_NOT_EXISTS).bail()
    .notEmpty().withMessage(SYSTEM_SETTINGS_VALIDATORS.VALUE_IS_EMPTY).bail()
    .isString().withMessage(SYSTEM_SETTINGS_VALIDATORS.VALUE_INVALID).bail(),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetAll, valiUpdateRecord };
