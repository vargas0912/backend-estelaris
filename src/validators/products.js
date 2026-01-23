const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { PRODUCTS_VALIDATORS } = require('../constants/products');

const validateGetRecord = [
  check('id')
    .exists().withMessage(PRODUCTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('sku')
    .exists().withMessage(PRODUCTS_VALIDATORS.SKU_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.SKU_IS_EMPTY).bail(),
  check('barcode'),
  check('name')
    .exists().withMessage(PRODUCTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('description'),
  check('short_description'),
  check('category_id')
    .optional()
    .isInt().withMessage(PRODUCTS_VALIDATORS.CATEGORY_ID_INVALID).bail(),
  check('unit_of_measure')
    .optional()
    .isIn(['piece', 'kg', 'lt', 'mt', 'box']).withMessage(PRODUCTS_VALIDATORS.UNIT_OF_MEASURE_INVALID).bail(),
  check('cost_price')
    .optional()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.COST_PRICE_INVALID).bail(),
  check('base_price')
    .exists().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_IS_EMPTY).bail()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_INVALID).bail(),
  check('weight')
    .optional()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.WEIGHT_INVALID).bail(),
  check('dimensions'),
  check('images'),
  check('is_active'),
  check('is_featured'),
  check('seo_title'),
  check('seo_description'),
  check('seo_keywords'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PRODUCTS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.ID_IS_EMPTY).bail(),
  check('sku')
    .exists().withMessage(PRODUCTS_VALIDATORS.SKU_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.SKU_IS_EMPTY).bail(),
  check('barcode'),
  check('name')
    .exists().withMessage(PRODUCTS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('description'),
  check('short_description'),
  check('category_id')
    .optional()
    .isInt().withMessage(PRODUCTS_VALIDATORS.CATEGORY_ID_INVALID).bail(),
  check('unit_of_measure')
    .optional()
    .isIn(['piece', 'kg', 'lt', 'mt', 'box']).withMessage(PRODUCTS_VALIDATORS.UNIT_OF_MEASURE_INVALID).bail(),
  check('cost_price')
    .optional()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.COST_PRICE_INVALID).bail(),
  check('base_price')
    .exists().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_IS_EMPTY).bail()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.BASE_PRICE_INVALID).bail(),
  check('weight')
    .optional()
    .isDecimal().withMessage(PRODUCTS_VALIDATORS.WEIGHT_INVALID).bail(),
  check('dimensions'),
  check('images'),
  check('is_active'),
  check('is_featured'),
  check('seo_title'),
  check('seo_description'),
  check('seo_keywords'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, valiAddRecord, valiUpdateRecord };
