'use strict';

const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');
const { SUPPLIERS_VALIDATORS } = require('../constants/suppliers');

const validateGetSupplier = [
  check('id')
    .exists().withMessage(SUPPLIERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SUPPLIERS_VALIDATORS.ID_NOT_INTEGER),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddSupplier = [
  check('name')
    .exists().withMessage(SUPPLIERS_VALIDATORS.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.NAME_IS_EMPTY).bail()
    .isLength({ max: 150 }).withMessage(SUPPLIERS_VALIDATORS.NAME_TOO_LONG),
  check('trade_name')
    .optional()
    .isLength({ max: 150 }).withMessage(SUPPLIERS_VALIDATORS.TRADE_NAME_TOO_LONG),
  check('tax_id')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.TAX_ID_TOO_LONG),
  check('contact_name')
    .optional()
    .isLength({ max: 100 }).withMessage(SUPPLIERS_VALIDATORS.CONTACT_NAME_TOO_LONG),
  check('email')
    .exists().withMessage(SUPPLIERS_VALIDATORS.EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.EMAIL_IS_EMPTY).bail()
    .isEmail().withMessage(SUPPLIERS_VALIDATORS.EMAIL_INVALID),
  check('phone')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.PHONE_TOO_LONG),
  check('mobile')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.MOBILE_TOO_LONG),
  check('address')
    .optional()
    .isLength({ max: 255 }).withMessage(SUPPLIERS_VALIDATORS.ADDRESS_TOO_LONG),
  check('municipality_id')
    .optional()
    .isInt().withMessage(SUPPLIERS_VALIDATORS.MUNICIPALITY_ID_NOT_INTEGER),
  check('postal_code')
    .optional()
    .isLength({ max: 10 }).withMessage(SUPPLIERS_VALIDATORS.POSTAL_CODE_TOO_LONG),
  check('website')
    .optional()
    .isLength({ max: 255 }).withMessage(SUPPLIERS_VALIDATORS.WEBSITE_TOO_LONG),
  check('payment_terms')
    .optional()
    .isLength({ max: 100 }).withMessage(SUPPLIERS_VALIDATORS.PAYMENT_TERMS_TOO_LONG),
  check('credit_limit')
    .optional()
    .isDecimal().withMessage(SUPPLIERS_VALIDATORS.CREDIT_LIMIT_NOT_DECIMAL),
  check('is_active')
    .optional()
    .isBoolean().withMessage(SUPPLIERS_VALIDATORS.IS_ACTIVE_NOT_BOOLEAN),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateSupplier = [
  check('id')
    .exists().withMessage(SUPPLIERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SUPPLIERS_VALIDATORS.ID_NOT_INTEGER),
  check('name')
    .optional()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.NAME_IS_EMPTY).bail()
    .isLength({ max: 150 }).withMessage(SUPPLIERS_VALIDATORS.NAME_TOO_LONG),
  check('trade_name')
    .optional()
    .isLength({ max: 150 }).withMessage(SUPPLIERS_VALIDATORS.TRADE_NAME_TOO_LONG),
  check('tax_id')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.TAX_ID_TOO_LONG),
  check('contact_name')
    .optional()
    .isLength({ max: 100 }).withMessage(SUPPLIERS_VALIDATORS.CONTACT_NAME_TOO_LONG),
  check('email')
    .optional()
    .notEmpty().withMessage(SUPPLIERS_VALIDATORS.EMAIL_IS_EMPTY).bail()
    .isEmail().withMessage(SUPPLIERS_VALIDATORS.EMAIL_INVALID),
  check('phone')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.PHONE_TOO_LONG),
  check('mobile')
    .optional()
    .isLength({ max: 20 }).withMessage(SUPPLIERS_VALIDATORS.MOBILE_TOO_LONG),
  check('address')
    .optional()
    .isLength({ max: 255 }).withMessage(SUPPLIERS_VALIDATORS.ADDRESS_TOO_LONG),
  check('municipality_id')
    .optional()
    .isInt().withMessage(SUPPLIERS_VALIDATORS.MUNICIPALITY_ID_NOT_INTEGER),
  check('postal_code')
    .optional()
    .isLength({ max: 10 }).withMessage(SUPPLIERS_VALIDATORS.POSTAL_CODE_TOO_LONG),
  check('website')
    .optional()
    .isLength({ max: 255 }).withMessage(SUPPLIERS_VALIDATORS.WEBSITE_TOO_LONG),
  check('payment_terms')
    .optional()
    .isLength({ max: 100 }).withMessage(SUPPLIERS_VALIDATORS.PAYMENT_TERMS_TOO_LONG),
  check('credit_limit')
    .optional()
    .isDecimal().withMessage(SUPPLIERS_VALIDATORS.CREDIT_LIMIT_NOT_DECIMAL),
  check('is_active')
    .optional()
    .isBoolean().withMessage(SUPPLIERS_VALIDATORS.IS_ACTIVE_NOT_BOOLEAN),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetSupplier,
  valiAddSupplier,
  valiUpdateSupplier
};
