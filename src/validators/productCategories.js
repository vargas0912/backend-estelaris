const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { PRODUCT_CATEGORIES_VALIDATORS } = require('../constants/productCategories');

const validateGetRecord = [
  check('id')
    .exists().withMessage(PRODUCT_CATEGORIES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_CATEGORIES_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(PRODUCT_CATEGORIES_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_CATEGORIES_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('description')
    .optional(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PRODUCT_CATEGORIES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_CATEGORIES_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(PRODUCT_CATEGORIES_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(PRODUCT_CATEGORIES_VALIDATORS.NAME_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, valiAddRecord, valiUpdateRecord };
