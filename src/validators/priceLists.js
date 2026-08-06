const { param, body } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { PRICE_LISTS_VALIDATORS } = require('../constants/priceLists');

const validateGetAll = [
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  param('id')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  body('name')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  body('description'),
  body('discount_percent')
    .optional()
    .isDecimal().withMessage(PRICE_LISTS_VALIDATORS.DISCOUNT_PERCENT_INVALID).bail(),
  body('is_active'),
  body('priority')
    .optional()
    .isInt().withMessage(PRICE_LISTS_VALIDATORS.PRIORITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  param('id')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.ID_IS_EMPTY).bail(),
  body('name')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  body('description'),
  body('discount_percent')
    .optional()
    .isDecimal().withMessage(PRICE_LISTS_VALIDATORS.DISCOUNT_PERCENT_INVALID).bail(),
  body('is_active'),
  body('priority')
    .optional()
    .isInt().withMessage(PRICE_LISTS_VALIDATORS.PRIORITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetAll, validateGetRecord, valiAddRecord, valiUpdateRecord };
