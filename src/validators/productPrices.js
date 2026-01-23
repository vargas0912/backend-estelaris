const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { PRODUCT_PRICES_VALIDATORS } = require('../constants/productPrices');

const validateGetRecord = [
  check('id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByProduct = [
  check('product_id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByPriceList = [
  check('price_list_id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('product_id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  check('price_list_id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_IS_EMPTY).bail()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_INVALID).bail(),
  check('price')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_IS_EMPTY).bail()
    .isDecimal().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_INVALID).bail(),
  check('min_quantity')
    .optional()
    .isDecimal().withMessage(PRODUCT_PRICES_VALIDATORS.MIN_QUANTITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PRODUCT_PRICES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_PRICES_VALIDATORS.ID_IS_EMPTY).bail(),
  check('product_id')
    .optional()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRODUCT_ID_INVALID).bail(),
  check('price_list_id')
    .optional()
    .isInt().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_LIST_ID_INVALID).bail(),
  check('price')
    .optional()
    .isDecimal().withMessage(PRODUCT_PRICES_VALIDATORS.PRICE_INVALID).bail(),
  check('min_quantity')
    .optional()
    .isDecimal().withMessage(PRODUCT_PRICES_VALIDATORS.MIN_QUANTITY_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = {
  validateGetRecord,
  validateGetByProduct,
  validateGetByPriceList,
  valiAddRecord,
  valiUpdateRecord
};
