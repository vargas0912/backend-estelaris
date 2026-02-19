const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { USER_BRANCHES_VALIDATORS: V } = require('../constants/errors');

const validateGetByUser = [
  check('user_id')
    .exists().withMessage(V.USER_ID_REQUIRED).bail()
    .notEmpty().withMessage(V.USER_ID_REQUIRED).bail()
    .isInt({ min: 1 }).withMessage(V.USER_ID_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(V.BRANCH_ID_REQUIRED).bail()
    .notEmpty().withMessage(V.BRANCH_ID_REQUIRED).bail()
    .isInt({ min: 1 }).withMessage(V.BRANCH_ID_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(V.ID_REQUIRED).bail()
    .notEmpty().withMessage(V.ID_REQUIRED).bail()
    .isInt({ min: 1 }).withMessage(V.ID_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('user_id')
    .exists().withMessage(V.USER_ID_REQUIRED).bail()
    .notEmpty().withMessage(V.USER_ID_REQUIRED).bail()
    .isInt({ min: 1 }).withMessage(V.USER_ID_INVALID),
  check('branch_id')
    .exists().withMessage(V.BRANCH_ID_REQUIRED).bail()
    .notEmpty().withMessage(V.BRANCH_ID_REQUIRED).bail()
    .isInt({ min: 1 }).withMessage(V.BRANCH_ID_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetByUser, validateGetByBranch, validateGetRecord, valiAddRecord };
