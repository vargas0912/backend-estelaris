const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');
const { ACCOUNTING_PERIOD_VALIDATORS: V } = require('../constants/accountingPeriods');

const validateGetRecord = [
  check('id')
    .exists().withMessage(V.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.ID_IS_EMPTY).bail()
    .isInt().withMessage(V.ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(V.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.NAME_IS_EMPTY).bail()
    .isString()
    .trim()
    .isLength({ max: 50 }),
  check('year')
    .exists().withMessage(V.YEAR_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.YEAR_IS_EMPTY).bail()
    .isInt({ min: 2000, max: 2100 }).withMessage(V.YEAR_INVALID).bail()
    .toInt(),
  check('month')
    .exists().withMessage(V.MONTH_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.MONTH_IS_EMPTY).bail()
    .isInt({ min: 1, max: 12 }).withMessage(V.MONTH_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetAll, validateGetRecord, valiAddRecord };
