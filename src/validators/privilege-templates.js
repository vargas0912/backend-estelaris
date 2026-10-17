const { check, param } = require('express-validator');

const validateResults = require('../utils/handleValidator');

const { PRIVILEGE_TEMPLATE_ERRORS: ERR } = require('../constants/privileges');

const idParam = param('id')
  .exists().withMessage(ERR.ID_NOT_EXISTS).bail()
  .isInt({ min: 1 }).withMessage(ERR.ID_MUST_BE_NUMERIC).bail();

const privilegeIdsBody = (required) => {
  const base = check('privileges');
  const chain = required
    ? base.exists().withMessage(ERR.PRIVILEGES_MUST_BE_ARRAY).bail()
    : base.optional();
  return chain.isArray().withMessage(ERR.PRIVILEGES_MUST_BE_ARRAY).bail();
};

const privilegeItems = check('privileges.*')
  .isInt({ min: 1 }).withMessage(ERR.INVALID_PRIVILEGES).bail();

const validateGetAll = [
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  idParam,
  (req, res, next) => validateResults(req, res, next)
];

const validateAddRecord = [
  check('name')
    .exists().withMessage(ERR.NAME_NOT_EXISTS).bail()
    .isString().withMessage(ERR.NAME_IS_EMPTY).bail()
    .trim()
    .notEmpty().withMessage(ERR.NAME_IS_EMPTY).bail(),
  check('description').optional({ nullable: true }).isString().bail(),
  privilegeIdsBody(true),
  privilegeItems,
  (req, res, next) => validateResults(req, res, next)
];

const validateUpdateRecord = [
  idParam,
  check('name')
    .optional()
    .isString().withMessage(ERR.NAME_IS_EMPTY).bail()
    .trim()
    .notEmpty().withMessage(ERR.NAME_IS_EMPTY).bail(),
  check('description').optional({ nullable: true }).isString().bail(),
  privilegeIdsBody(false),
  privilegeItems,
  (req, res, next) => validateResults(req, res, next)
];

const validateApply = [
  idParam,
  check('user_id')
    .exists().withMessage(ERR.USER_ID_NOT_EXISTS).bail()
    .isInt({ min: 1 }).withMessage(ERR.USER_ID_MUST_BE_NUMERIC).bail(),
  check('mode')
    .exists().withMessage(ERR.MODE_INVALID).bail()
    .isIn(['replace', 'merge']).withMessage(ERR.MODE_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateSync = [
  idParam,
  check('confirm')
    .exists().withMessage(ERR.CONFIRM_MUST_BE_TRUE).bail()
    .custom(value => value === true).withMessage(ERR.CONFIRM_MUST_BE_TRUE).bail(),
  check('user_ids')
    .optional()
    .isArray().withMessage(ERR.USER_IDS_MUST_BE_ARRAY).bail(),
  check('user_ids.*')
    .isInt({ min: 1 }).withMessage(ERR.USER_ID_MUST_BE_NUMERIC).bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetAll,
  validateGetRecord,
  validateAddRecord,
  validateUpdateRecord,
  validateApply,
  validateSync
};
