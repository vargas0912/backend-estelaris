const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { SYSTEM_SETTINGS_VALIDATORS } = require('../constants/systemSettings');

const validateGetAll = [
  check('category').optional().isString(),
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
