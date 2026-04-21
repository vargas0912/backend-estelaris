const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');
const { ACCOUNTING_ACCOUNT_VALIDATORS: V } = require('../constants/accountingAccounts');

const VALID_TYPES = ['activo', 'pasivo', 'capital', 'ingreso', 'egreso', 'costo'];
const VALID_NATURES = ['deudora', 'acreedora'];

const validateGetRecord = [
  check('id')
    .exists().withMessage(V.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.ID_IS_EMPTY).bail()
    .isInt().withMessage(V.ID_NOT_EXISTS),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('code')
    .exists().withMessage(V.CODE_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.CODE_IS_EMPTY).bail()
    .isString()
    .trim()
    .isLength({ max: 20 }),
  check('name')
    .exists().withMessage(V.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.NAME_IS_EMPTY).bail()
    .isString()
    .trim()
    .isLength({ max: 120 }),
  check('type')
    .exists().withMessage(V.TYPE_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.TYPE_IS_EMPTY).bail()
    .isIn(VALID_TYPES).withMessage(V.TYPE_INVALID),
  check('nature')
    .exists().withMessage(V.NATURE_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.NATURE_IS_EMPTY).bail()
    .isIn(VALID_NATURES).withMessage(V.NATURE_INVALID),
  check('level')
    .exists().withMessage(V.LEVEL_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.LEVEL_IS_EMPTY).bail()
    .isInt({ min: 1, max: 3 }).withMessage(V.LEVEL_INVALID),
  check('parent_id')
    .optional()
    .isInt({ min: 1 }).withMessage(V.PARENT_ID_INVALID),
  check('allows_movements')
    .optional()
    .isBoolean(),
  check('is_system')
    .optional()
    .isBoolean(),
  check('active')
    .optional()
    .isBoolean(),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(V.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(V.ID_IS_EMPTY).bail()
    .isInt().withMessage(V.ID_NOT_EXISTS),
  check('code')
    .optional()
    .notEmpty().withMessage(V.CODE_IS_EMPTY)
    .isString()
    .trim()
    .isLength({ max: 20 }),
  check('name')
    .optional()
    .notEmpty().withMessage(V.NAME_IS_EMPTY)
    .isString()
    .trim()
    .isLength({ max: 120 }),
  check('type')
    .optional()
    .isIn(VALID_TYPES).withMessage(V.TYPE_INVALID),
  check('nature')
    .optional()
    .isIn(VALID_NATURES).withMessage(V.NATURE_INVALID),
  check('level')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage(V.LEVEL_INVALID),
  check('parent_id')
    .optional()
    .isInt({ min: 1 }).withMessage(V.PARENT_ID_INVALID),
  check('allows_movements')
    .optional()
    .isBoolean(),
  check('active')
    .optional()
    .isBoolean(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetAll, validateGetRecord, valiAddRecord, valiUpdateRecord };
