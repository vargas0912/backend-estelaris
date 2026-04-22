const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const { PRODUCT_STOCKS_VALIDATORS } = require('../constants/productStocks');

const validateGetAll = [
  ...paginationChecks,
  check('search').optional().isString().trim(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('purch_id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByProduct = [
  check('product_id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_IS_EMPTY).bail()
    .isString().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail()
    .isLength({ max: 20 }).withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  ...paginationChecks,
  check('search').optional().isString().trim(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_INVALID).bail(),
  ...paginationChecks,
  check('search').optional().isString().trim(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('product_id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_IS_EMPTY).bail()
    .isString().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail()
    .isLength({ max: 20 }).withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  check('branch_id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_INVALID).bail(),
  check('quantity')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.QUANTITY_INVALID).bail(),
  check('min_stock')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.MIN_STOCK_INVALID).bail(),
  check('max_stock')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.MAX_STOCK_INVALID).bail(),
  check('location'),
  check('last_count_date')
    .optional()
    .isISO8601().withMessage(PRODUCT_STOCKS_VALIDATORS.LAST_COUNT_DATE_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PRODUCT_STOCKS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_STOCKS_VALIDATORS.ID_IS_EMPTY).bail(),
  check('product_id')
    .optional()
    .isString().withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail()
    .isLength({ max: 20 }).withMessage(PRODUCT_STOCKS_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  check('branch_id')
    .optional()
    .isInt().withMessage(PRODUCT_STOCKS_VALIDATORS.BRANCH_ID_INVALID).bail(),
  check('quantity')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.QUANTITY_INVALID).bail(),
  check('min_stock')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.MIN_STOCK_INVALID).bail(),
  check('max_stock')
    .optional()
    .isDecimal().withMessage(PRODUCT_STOCKS_VALIDATORS.MAX_STOCK_INVALID).bail(),
  check('location'),
  check('last_count_date')
    .optional()
    .isISO8601().withMessage(PRODUCT_STOCKS_VALIDATORS.LAST_COUNT_DATE_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = {
  validateGetAll,
  validateGetRecord,
  validateGetByProduct,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord
};
