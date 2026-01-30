const { check, body } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { CUSTOMERS_VALIDATORS } = require('../constants/errors');

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
  check('name')
    .exists().withMessage(CUSTOMERS_VALIDATORS.NAME_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.NAME_REQUIRED).bail()
    .isLength({ min: 2, max: 150 }).withMessage(CUSTOMERS_VALIDATORS.NAME_LENGTH),
  check('email')
    .exists().withMessage(CUSTOMERS_VALIDATORS.EMAIL_REQUIRED).bail()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.EMAIL_REQUIRED).bail()
    .isEmail().withMessage(CUSTOMERS_VALIDATORS.EMAIL_INVALID),
  check('phone').optional(),
  check('mobile').optional(),
  // Validación custom: al menos phone o mobile requerido
  body().custom((value, { req }) => {
    if (!req.body.phone && !req.body.mobile) {
      throw new Error(CUSTOMERS_VALIDATORS.PHONE_OR_MOBILE_REQUIRED);
    }
    return true;
  }),
  check('tax_id')
    .optional()
    .isLength({ min: 13, max: 13 }).withMessage(CUSTOMERS_VALIDATORS.TAX_ID_LENGTH),
  check('is_international')
    .optional()
    .isBoolean().withMessage('is_international debe ser booleano'),
  check('country')
    .optional()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.COUNTRY_REQUIRED),
  check('billing_address').optional(),
  check('municipality_id')
    .optional()
    .isNumeric().withMessage('municipality_id debe ser numérico'),
  check('branch_id')
    .optional()
    .isNumeric().withMessage('branch_id debe ser numérico'),
  check('notes').optional(),
  check('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser booleano'),
  // Validación custom: clientes internacionales no pueden tener municipality_id o branch_id
  body().custom((value, { req }) => {
    if (req.body.is_international && (req.body.municipality_id || req.body.branch_id)) {
      throw new Error(CUSTOMERS_VALIDATORS.INTERNATIONAL_NO_LOCATION);
    }
    return true;
  }),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateUpdate = [
  check('id')
    .exists().withMessage('El ID es requerido').bail()
    .notEmpty().withMessage('El ID no puede estar vacío').bail()
    .isNumeric().withMessage('El ID debe ser numérico'),
  check('name')
    .optional()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.NAME_REQUIRED).bail()
    .isLength({ min: 2, max: 150 }).withMessage(CUSTOMERS_VALIDATORS.NAME_LENGTH),
  check('email')
    .optional()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.EMAIL_REQUIRED).bail()
    .isEmail().withMessage(CUSTOMERS_VALIDATORS.EMAIL_INVALID),
  check('phone').optional(),
  check('mobile').optional(),
  check('tax_id')
    .optional()
    .isLength({ min: 13, max: 13 }).withMessage(CUSTOMERS_VALIDATORS.TAX_ID_LENGTH),
  check('is_international')
    .optional()
    .isBoolean().withMessage('is_international debe ser booleano'),
  check('country')
    .optional()
    .notEmpty().withMessage(CUSTOMERS_VALIDATORS.COUNTRY_REQUIRED),
  check('billing_address').optional(),
  check('municipality_id')
    .optional()
    .isNumeric().withMessage('municipality_id debe ser numérico'),
  check('branch_id')
    .optional()
    .isNumeric().withMessage('branch_id debe ser numérico'),
  check('notes').optional(),
  check('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser booleano'),
  // Validación custom: clientes internacionales no pueden tener municipality_id o branch_id
  body().custom((value, { req }) => {
    if (req.body.is_international && (req.body.municipality_id || req.body.branch_id)) {
      throw new Error(CUSTOMERS_VALIDATORS.INTERNATIONAL_NO_LOCATION);
    }
    return true;
  }),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByBranch = [
  check('branchId')
    .exists().withMessage('El ID de sucursal es requerido').bail()
    .notEmpty().withMessage('El ID de sucursal no puede estar vacío').bail()
    .isNumeric().withMessage('El ID de sucursal debe ser numérico'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetByMunicipality = [
  check('municipalityId')
    .exists().withMessage('El ID de municipio es requerido').bail()
    .notEmpty().withMessage('El ID de municipio no puede estar vacío').bail()
    .isNumeric().withMessage('El ID de municipio debe ser numérico'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateActivatePortal = [
  check('id')
    .exists().withMessage('El ID es requerido').bail()
    .notEmpty().withMessage('El ID no puede estar vacío').bail()
    .isNumeric().withMessage('El ID debe ser numérico'),
  check('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = {
  validateGetRecord,
  validateCreate,
  validateUpdate,
  validateGetByBranch,
  validateGetByMunicipality,
  validateActivatePortal
};
