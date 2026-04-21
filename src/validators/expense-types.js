const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const { EXPENSE_TYPE_VALIDATORS } = require('../constants/expense-types');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(EXPENSE_TYPE_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_TYPE_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(EXPENSE_TYPE_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_TYPE_VALIDATORS.NAME_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(EXPENSE_TYPE_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_TYPE_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(EXPENSE_TYPE_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_TYPE_VALIDATORS.NAME_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetAll, validateGetRecord, valiAddRecord, valiUpdateRecord };
