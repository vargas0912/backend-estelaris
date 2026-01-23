const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { PRICE_LISTS_VALIDATORS } = require('../constants/priceLists');

const validateGetRecord = [
  check('id')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('description'),
  check('discount_percent')
    .optional()
    .isDecimal().withMessage(PRICE_LISTS_VALIDATORS.DISCOUNT_PERCENT_INVALID).bail(),
  check('is_active'),
  check('priority')
    .optional()
    .isInt().withMessage(PRICE_LISTS_VALIDATORS.PRIORITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(PRICE_LISTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRICE_LISTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('description'),
  check('discount_percent')
    .optional()
    .isDecimal().withMessage(PRICE_LISTS_VALIDATORS.DISCOUNT_PERCENT_INVALID).bail(),
  check('is_active'),
  check('priority')
    .optional()
    .isInt().withMessage(PRICE_LISTS_VALIDATORS.PRIORITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, valiAddRecord, valiUpdateRecord };
