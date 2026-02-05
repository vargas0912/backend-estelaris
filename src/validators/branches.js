const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const BRANCH_VALIDATORS = require('../constants/branches');

const validateGetRecord = [
  check('id')
    .exists()
    .withMessage(BRANCH_VALIDATORS.ID_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.ID_IS_EMPTY)
    .bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiAddRecord = [
  check('name')
    .exists()
    .withMessage(BRANCH_VALIDATORS.DESC_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.DESC_IS_EMPTY)
    .bail(),
  check('address')
    .exists()
    .withMessage(BRANCH_VALIDATORS.ADDRESS_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.ADDRESS_IS_EMPTY)
    .bail(),
  check('municipality_id')
    .exists()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_IS_EMPTY)
    .bail(),
  check('phone'),
  check('opening_date'),

  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const valiUpdateRecord = [
  check('id')
    .exists()
    .withMessage(BRANCH_VALIDATORS.ID_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.ID_IS_EMPTY)
    .bail(),
  check('name')
    .exists()
    .withMessage(BRANCH_VALIDATORS.DESC_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.DESC_IS_EMPTY)
    .bail(),
  check('address')
    .exists()
    .withMessage(BRANCH_VALIDATORS.ADDRESS_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.ADDRESS_IS_EMPTY)
    .bail(),
  check('municipality_id')
    .exists()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_IS_EMPTY)
    .bail(),
  check('phone'),
  check('opening_date').optional(),

  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetRecordMunicipality = [
  check('municipality_id')
    .exists()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_ID_NOT_EXISTS)
    .bail()
    .notEmpty()
    .withMessage(BRANCH_VALIDATORS.MUNICIPALITY_ID_IS_EMPTY)
    .bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = {
  validateGetRecord,
  validateGetRecordMunicipality,
  valiAddRecord,
  valiUpdateRecord
};
