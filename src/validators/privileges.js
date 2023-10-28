const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { USER_VALIDATORS } = require('../constants/privileges');

const validateGetRecord = [
  check('id')
    .exists().withMessage(USER_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetRecordByModule = [
  check('module')
    .exists().withMessage(USER_VALIDATORS.MODULE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.MODULE_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateAddRecord = [
  check('name')
    .exists().withMessage(USER_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('codename')
    .exists().withMessage(USER_VALIDATORS.CODE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.CODE_IS_EMPTY).bail(),
  check('module')
    .exists().withMessage(USER_VALIDATORS.MODULE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.MODULE_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateUpdateRecord = [
  check('id')
    .exists().withMessage(USER_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(USER_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.NAME_IS_EMPTY).bail(),
  check('codeName')
    .exists().withMessage(USER_VALIDATORS.CODE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.CODE_IS_EMPTY).bail(),
  check('module')
    .exists().withMessage(USER_VALIDATORS.MODULE_NOT_EXISTS).bail()
    .notEmpty().withMessage(USER_VALIDATORS.MODULE_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, validateAddRecord, validateUpdateRecord, validateGetRecordByModule };
