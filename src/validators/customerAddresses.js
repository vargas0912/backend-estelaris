const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { CUSTOMER_ADDRESSES_VALIDATORS } = require('../constants/errors');

const validateGetRecord = [
  check('id')
    .exists().withMessage('El ID es requerido').bail()
    .notEmpty().withMessage('El ID no puede estar vacío').bail()
    .isNumeric().withMessage('El ID debe ser numérico'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateCreate = [
  check('customer_id')
    .exists().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.CUSTOMER_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.CUSTOMER_REQUIRED).bail()
    .isNumeric().withMessage('customer_id debe ser numérico'),
  check('address_type')
    .exists().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.ADDRESS_TYPE_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.ADDRESS_TYPE_REQUIRED).bail()
    .isIn(['billing', 'shipping']).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.ADDRESS_TYPE_INVALID),
  check('street')
    .exists().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.STREET_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.STREET_REQUIRED).bail()
    .isLength({ min: 1, max: 255 }).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.STREET_LENGTH),
  check('neighborhood').optional(),
  check('postal_code')
    .exists().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.POSTAL_CODE_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.POSTAL_CODE_REQUIRED).bail()
    .isLength({ min: 5, max: 10 }).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.POSTAL_CODE_LENGTH),
  check('country')
    .optional()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.COUNTRY_REQUIRED),
  check('municipality_id')
    .optional()
    .isNumeric().withMessage('municipality_id debe ser numérico'),
  check('is_default')
    .optional()
    .isBoolean().withMessage('is_default debe ser booleano'),
  check('notes').optional(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateUpdate = [
  check('id')
    .exists().withMessage('El ID es requerido').bail()
    .notEmpty().withMessage('El ID no puede estar vacío').bail()
    .isNumeric().withMessage('El ID debe ser numérico'),
  check('address_type')
    .optional()
    .isIn(['billing', 'shipping']).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.ADDRESS_TYPE_INVALID),
  check('street')
    .optional()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.STREET_REQUIRED).bail()
    .isLength({ min: 1, max: 255 }).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.STREET_LENGTH),
  check('neighborhood').optional(),
  check('postal_code')
    .optional()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.POSTAL_CODE_REQUIRED).bail()
    .isLength({ min: 5, max: 10 }).withMessage(CUSTOMER_ADDRESSES_VALIDATORS.POSTAL_CODE_LENGTH),
  check('country')
    .optional()
    .notEmpty().withMessage(CUSTOMER_ADDRESSES_VALIDATORS.COUNTRY_REQUIRED),
  check('municipality_id')
    .optional()
    .isNumeric().withMessage('municipality_id debe ser numérico'),
  check('is_default')
    .optional()
    .isBoolean().withMessage('is_default debe ser booleano'),
  check('notes').optional(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByCustomer = [
  check('customerId')
    .exists().withMessage('El ID del cliente es requerido').bail()
    .notEmpty().withMessage('El ID del cliente no puede estar vacío').bail()
    .isNumeric().withMessage('El ID del cliente debe ser numérico'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = {
  validateGetRecord,
  validateCreate,
  validateUpdate,
  validateGetByCustomer
};
