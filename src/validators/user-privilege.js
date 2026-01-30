const { check } = require('express-validator');

const validateResults = require('../utils/handleValidator');

const { USER_VALIDATORS, FIELDS } = require('../constants/privileges');

const validateGetUserAllRecord = [
  check(FIELDS.ID)
    .exists().withMessage(USER_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetUserOneRecord = [
  check(FIELDS.USERID)
    .exists().withMessage(USER_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.ID_IS_EMPTY).bail(),
  check(FIELDS.CODENAME)
    .exists().withMessage(USER_VALIDATORS.CODE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.CODE_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateAddUserRecord = [
  check('user_id')
    .exists().withMessage(USER_VALIDATORS.USER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.USER_ID_IS_EMPTY).bail()
    .isNumeric().withMessage('USER_ID_MUST_BE_NUMERIC').bail(),
  check(FIELDS.PRIVILEGE_ID)
    .exists().withMessage(USER_VALIDATORS.PRIVILEGE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.PRIVILEGE_ID_IS_EMPTY).bail()
    .isNumeric().withMessage('PRIVILEGE_ID_MUST_BE_NUMERIC').bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateDeleteRecord = [
  check(FIELDS.USERID)
    .exists().withMessage(USER_VALIDATORS.USER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.USER_ID_IS_EMPTY).bail(),
  check(FIELDS.PID)
    .exists().withMessage(USER_VALIDATORS.PRIVILEGE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.PRIVILEGE_ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetUserAllRecord, validateGetUserOneRecord, validateAddUserRecord, validateDeleteRecord };
