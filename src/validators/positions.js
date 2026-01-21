const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const { POSITIONS_VALIDATORS } = require('../constants/positions');

const validateGetRecord = [
  check('id')
    .exists().withMessage(POSITIONS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(POSITIONS_VALIDATORS.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists().withMessage(POSITIONS_VALIDATORS.DESC_NOT_EXISTS).bail()
    .notEmpty().withMessage(POSITIONS_VALIDATORS.DESC_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(POSITIONS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(POSITIONS_VALIDATORS.ID_IS_EMPTY).bail(),
  check('name')
    .exists().withMessage(POSITIONS_VALIDATORS.DESC_NOT_EXISTS).bail()
    .notEmpty().withMessage(POSITIONS_VALIDATORS.DESC_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord, valiAddRecord, valiUpdateRecord };
