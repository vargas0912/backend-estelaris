const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { EXPENSE_VALIDATORS } = require('../constants/expenses');
const { paginationChecks } = require('./shared');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(EXPENSE_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(EXPENSE_VALIDATORS.ID_NOT_EXISTS),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(EXPENSE_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(EXPENSE_VALIDATORS.BRANCH_ID_NOT_EXISTS),
  ...paginationChecks,
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('expense_type_id')
    .exists().withMessage(EXPENSE_VALIDATORS.EXPENSE_TYPE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.EXPENSE_TYPE_ID_IS_EMPTY).bail()
    .isInt().withMessage(EXPENSE_VALIDATORS.EXPENSE_TYPE_ID_NOT_EXISTS),
  check('trans_date')
    .exists().withMessage(EXPENSE_VALIDATORS.TRANS_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.TRANS_DATE_IS_EMPTY).bail()
    .isDate().withMessage(EXPENSE_VALIDATORS.TRANS_DATE_INVALID),
  check('expense_amount')
    .exists().withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_IS_EMPTY).bail()
    .isDecimal({ decimal_digits: '0,2' }).withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_INVALID)
    .custom(value => parseFloat(value) >= 0).withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_INVALID),
  check('notes').optional(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(EXPENSE_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EXPENSE_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(EXPENSE_VALIDATORS.ID_NOT_EXISTS),
  check('expense_type_id').optional()
    .isInt().withMessage(EXPENSE_VALIDATORS.EXPENSE_TYPE_ID_NOT_EXISTS),
  check('trans_date').optional()
    .isDate().withMessage(EXPENSE_VALIDATORS.TRANS_DATE_INVALID),
  check('expense_amount').optional()
    .isDecimal({ decimal_digits: '0,2' }).withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_INVALID)
    .custom(value => parseFloat(value) >= 0).withMessage(EXPENSE_VALIDATORS.EXPENSE_AMOUNT_INVALID),
  check('notes').optional(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetAll, validateGetRecord, validateGetByBranch, valiAddRecord, valiUpdateRecord };
