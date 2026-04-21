const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { ACCOUNTING_VOUCHER_VALIDATORS: V } = require('../constants/accountingVouchers');
const { paginationChecks } = require('./shared');

const VOUCHER_TYPES = ['ingreso', 'egreso', 'diario', 'ajuste'];
const VOUCHER_STATUSES = ['borrador', 'aplicada', 'cancelada'];

const validateGetRecord = [
  check('id')
    .exists().withMessage(V.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.ID_IS_EMPTY).bail()
    .isInt().withMessage(V.ID_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateListFilters = [
  check('period_id')
    .optional()
    .isInt().withMessage(V.PERIOD_ID_INVALID)
    .toInt(),
  check('branch_id')
    .optional()
    .isInt(),
  check('type')
    .optional()
    .isIn(VOUCHER_TYPES).withMessage(V.TYPE_INVALID),
  check('status')
    .optional()
    .isIn(VOUCHER_STATUSES),
  check('reference_type')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 }),
  check('reference_id')
    .optional()
    .isInt()
    .toInt(),
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('type')
    .exists().withMessage(V.TYPE_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.TYPE_IS_EMPTY).bail()
    .isIn(VOUCHER_TYPES).withMessage(V.TYPE_INVALID),
  check('period_id')
    .exists().withMessage(V.PERIOD_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.PERIOD_ID_IS_EMPTY).bail()
    .isInt().withMessage(V.PERIOD_ID_INVALID)
    .toInt(),
  check('branch_id')
    .optional()
    .isInt()
    .toInt(),
  check('date')
    .exists().withMessage(V.DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.DATE_IS_EMPTY).bail()
    .isISO8601().withMessage(V.DATE_INVALID),
  check('description')
    .exists().withMessage(V.DESCRIPTION_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.DESCRIPTION_IS_EMPTY).bail()
    .isString()
    .trim()
    .isLength({ max: 255 }),
  check('reference_type')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 }),
  check('reference_id')
    .optional()
    .isInt()
    .toInt(),
  check('lines')
    .exists().withMessage(V.LINES_NOT_EXISTS).bail()
    .isArray({ min: 2 }).withMessage(V.LINES_MIN),
  check('lines.*.account_id')
    .exists()
    .isInt()
    .toInt(),
  check('lines.*.debit')
    .optional()
    .isDecimal(),
  check('lines.*.credit')
    .optional()
    .isDecimal(),
  check('lines.*.description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 }),
  check('lines.*.order')
    .optional()
    .isInt()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(V.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.ID_IS_EMPTY).bail()
    .isInt().withMessage(V.ID_INVALID)
    .toInt(),
  check('type')
    .optional()
    .isIn(VOUCHER_TYPES).withMessage(V.TYPE_INVALID),
  check('period_id')
    .optional()
    .isInt().withMessage(V.PERIOD_ID_INVALID)
    .toInt(),
  check('branch_id')
    .optional()
    .isInt()
    .toInt(),
  check('date')
    .optional()
    .isISO8601().withMessage(V.DATE_INVALID),
  check('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 }),
  check('reference_type')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 }),
  check('reference_id')
    .optional()
    .isInt()
    .toInt(),
  check('lines')
    .optional()
    .isArray({ min: 2 }).withMessage(V.LINES_MIN),
  check('lines.*.account_id')
    .optional()
    .isInt()
    .toInt(),
  check('lines.*.debit')
    .optional()
    .isDecimal(),
  check('lines.*.credit')
    .optional()
    .isDecimal(),
  check('lines.*.description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 }),
  check('lines.*.order')
    .optional()
    .isInt()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetRecord, validateListFilters, valiAddRecord, valiUpdateRecord };
