const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const { EMPLOYEES_VALIDATORS } = require('../constants/employees');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_INVALID).bail(),
  ...paginationChecks,
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(EMPLOYEES_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('email')
    .exists().withMessage(EMPLOYEES_VALIDATORS.EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.EMAIL_IS_EMPTY).bail()
    .isEmail().withMessage(EMPLOYEES_VALIDATORS.EMAIL_INVALID).bail(),
  check('phone'),
  check('hire_date')
    .exists().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_IS_EMPTY).bail()
    .isISO8601().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_INVALID).bail(),
  check('position_id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.POSITION_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.POSITION_ID_IS_EMPTY).bail(),
  check('branch_id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail(),
  check('active'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(EMPLOYEES_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('email')
    .exists().withMessage(EMPLOYEES_VALIDATORS.EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.EMAIL_IS_EMPTY).bail()
    .isEmail().withMessage(EMPLOYEES_VALIDATORS.EMAIL_INVALID).bail(),
  check('phone'),
  check('hire_date')
    .exists().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_IS_EMPTY).bail()
    .isISO8601().withMessage(EMPLOYEES_VALIDATORS.HIRE_DATE_INVALID).bail(),
  check('position_id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.POSITION_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.POSITION_ID_IS_EMPTY).bail(),
  check('branch_id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail(),
  check('active'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiGrantAccess = [
  check('id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ID_IS_EMPTY).bail(),
  check('email')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ACCESS_EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ACCESS_EMAIL_IS_EMPTY).bail()
    .isEmail().withMessage(EMPLOYEES_VALIDATORS.ACCESS_EMAIL_INVALID).bail(),
  check('password')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ACCESS_PASSWORD_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ACCESS_PASSWORD_IS_EMPTY).bail()
    .isLength({ min: 8 }).withMessage(EMPLOYEES_VALIDATORS.ACCESS_PASSWORD_TOO_SHORT).bail(),
  check('privileges')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ACCESS_PRIVILEGES_NOT_EXISTS).bail()
    .isArray({ min: 1 }).withMessage(EMPLOYEES_VALIDATORS.ACCESS_PRIVILEGES_INVALID).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetAll, validateGetRecord, validateGetByBranch, valiAddRecord, valiUpdateRecord, valiGrantAccess };
