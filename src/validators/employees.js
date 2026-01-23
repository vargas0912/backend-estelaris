const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { EMPLOYEES_VALIDATORS } = require('../constants/employees');

const validateGetRecord = [
  check('id')
    .exists().withMessage(EMPLOYEES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(EMPLOYEES_VALIDATORS.ID_IS_EMPTY).bail(),
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

module.exports = { validateGetRecord, valiAddRecord, valiUpdateRecord };
