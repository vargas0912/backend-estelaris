const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage('ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('ID_IS_EMPTY').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByEmployee = [
  check('employee_id')
    .exists().withMessage('EMPLOYEE_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('EMPLOYEE_ID_IS_EMPTY').bail()
    .isInt().withMessage('EMPLOYEE_ID_INVALID').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const sharedVacationChecks = [
  check('start_date')
    .exists().withMessage('START_DATE_NOT_EXISTS').bail()
    .notEmpty().withMessage('START_DATE_IS_EMPTY').bail()
    .isISO8601().withMessage('START_DATE_INVALID').bail(),
  check('end_date')
    .exists().withMessage('END_DATE_NOT_EXISTS').bail()
    .notEmpty().withMessage('END_DATE_IS_EMPTY').bail()
    .isISO8601().withMessage('END_DATE_INVALID').bail(),
  check('reason').optional().isString().trim(),
  (req, res, next) => validateResults(req, res, next)
];

const valiRequestVacation = [
  check('employee_id')
    .exists().withMessage('EMPLOYEE_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('EMPLOYEE_ID_IS_EMPTY').bail()
    .isInt({ min: 1 }).withMessage('EMPLOYEE_ID_INVALID').bail(),
  ...sharedVacationChecks
];

const valiMeRequestVacation = sharedVacationChecks;

const valiApproveReject = [
  check('id')
    .exists().withMessage('ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('ID_IS_EMPTY').bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetAll, validateGetRecord, validateGetByEmployee, valiRequestVacation, valiMeRequestVacation, valiApproveReject };
