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
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, validateGetRecordByState };
