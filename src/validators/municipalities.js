const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const MUNICIPALITY_VALIDATORS = require('../constants/municipalities');

const validateGetRecord = [
  check('id')
    .exists().withMessage(MUNICIPALITY_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(MUNICIPALITY_VALIDATORS.NAME_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetRecordByState = [
  check('stateId')
    .exists().withMessage(MUNICIPALITY_VALIDATORS.STATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(MUNICIPALITY_VALIDATORS.STATE_IS_EMPTY).bail(),
  ...paginationChecks,
  check('search').optional().isString().trim(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetAll = [
  check('search')
    .exists().withMessage('SEARCH_NOT_EXISTS').bail()
    .notEmpty().withMessage('SEARCH_IS_EMPTY').bail()
    .isString().trim(),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe ser un entero entre 1 y 100')
    .toInt()
    .default(15),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage('NAME_NOT_EXISTS').bail()
    .notEmpty().withMessage('NAME_IS_EMPTY').bail()
    .isString().withMessage('NAME_MUST_BE_STRING'),
  check('state_id')
    .exists().withMessage('STATE_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('STATE_ID_IS_EMPTY').bail()
    .isInt().withMessage('STATE_ID_MUST_BE_INT').toInt(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage('ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('ID_IS_EMPTY').bail()
    .isInt().withMessage('ID_MUST_BE_INT').toInt(),
  check('name')
    .exists().withMessage('NAME_NOT_EXISTS').bail()
    .notEmpty().withMessage('NAME_IS_EMPTY').bail()
    .isString().withMessage('NAME_MUST_BE_STRING'),
  check('state_id')
    .exists().withMessage('STATE_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('STATE_ID_IS_EMPTY').bail()
    .isInt().withMessage('STATE_ID_MUST_BE_INT').toInt(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateDeleteRecord = [
  check('id')
    .exists().withMessage('ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('ID_IS_EMPTY').bail()
    .isInt().withMessage('ID_MUST_BE_INT').toInt(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, validateGetRecordByState, validateGetAll, valiAddRecord, valiUpdateRecord, validateDeleteRecord };
