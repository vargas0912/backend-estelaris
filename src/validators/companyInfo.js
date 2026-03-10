const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { COMPANY_INFO_VALIDATORS } = require('../constants/companyInfo');

/**
 * Validación para PUT /api/company-info
 * Todos los campos son opcionales — actualización parcial.
 */
const valiUpdateRecord = [
  check('company_name')
    .optional()
    .isString().withMessage(COMPANY_INFO_VALIDATORS.COMPANY_NAME_INVALID).bail()
    .notEmpty().withMessage(COMPANY_INFO_VALIDATORS.COMPANY_NAME_IS_EMPTY).bail()
    .isLength({ max: 150 }).withMessage(COMPANY_INFO_VALIDATORS.COMPANY_NAME_TOO_LONG).bail(),

  check('trade_name')
    .optional({ nullable: true })
    .isString().withMessage(COMPANY_INFO_VALIDATORS.TRADE_NAME_INVALID).bail()
    .isLength({ max: 150 }).withMessage(COMPANY_INFO_VALIDATORS.TRADE_NAME_TOO_LONG).bail(),

  check('rfc')
    .optional()
    .isString().withMessage(COMPANY_INFO_VALIDATORS.RFC_INVALID).bail()
    .notEmpty().withMessage(COMPANY_INFO_VALIDATORS.RFC_IS_EMPTY).bail()
    .isLength({ min: 12, max: 13 }).withMessage(COMPANY_INFO_VALIDATORS.RFC_LENGTH).bail()
    .toUpperCase(),

  check('fiscal_regime')
    .optional()
    .isString().withMessage(COMPANY_INFO_VALIDATORS.FISCAL_REGIME_INVALID).bail()
    .notEmpty().withMessage(COMPANY_INFO_VALIDATORS.FISCAL_REGIME_IS_EMPTY).bail(),

  check('fiscal_address')
    .optional()
    .isString().withMessage(COMPANY_INFO_VALIDATORS.FISCAL_ADDRESS_INVALID).bail()
    .notEmpty().withMessage(COMPANY_INFO_VALIDATORS.FISCAL_ADDRESS_IS_EMPTY).bail(),

  check('zip_code')
    .optional()
    .isString().withMessage(COMPANY_INFO_VALIDATORS.ZIP_CODE_INVALID).bail()
    .notEmpty().withMessage(COMPANY_INFO_VALIDATORS.ZIP_CODE_IS_EMPTY).bail()
    .isLength({ max: 10 }).withMessage(COMPANY_INFO_VALIDATORS.ZIP_CODE_TOO_LONG).bail(),

  check('fiscal_email')
    .optional({ nullable: true })
    .isEmail().withMessage(COMPANY_INFO_VALIDATORS.FISCAL_EMAIL_INVALID).bail(),

  check('phone')
    .optional({ nullable: true })
    .isString().withMessage(COMPANY_INFO_VALIDATORS.PHONE_INVALID).bail()
    .isLength({ max: 20 }).withMessage(COMPANY_INFO_VALIDATORS.PHONE_TOO_LONG).bail(),

  check('logo_url')
    .optional({ nullable: true })
    .isURL().withMessage(COMPANY_INFO_VALIDATORS.LOGO_URL_INVALID).bail(),

  check('website')
    .optional({ nullable: true })
    .isURL().withMessage(COMPANY_INFO_VALIDATORS.WEBSITE_INVALID).bail(),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { valiUpdateRecord };
