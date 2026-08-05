const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const validateGetAll = [
  ...paginationChecks,
  check('status').optional().isString().trim(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage('El id es requerido').bail()
    .notEmpty().withMessage('El id no puede estar vacío').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiGeneratePeriod = [
  check('name')
    .exists().withMessage('El nombre es requerido').bail()
    .notEmpty().withMessage('El nombre no puede estar vacío').bail()
    .isString().withMessage('El nombre debe ser una cadena de texto').bail(),
  check('start_date')
    .exists().withMessage('La fecha de inicio es requerida').bail()
    .notEmpty().withMessage('La fecha de inicio no puede estar vacía').bail()
    .isISO8601().withMessage('La fecha de inicio debe tener formato ISO8601').bail(),
  check('end_date')
    .exists().withMessage('La fecha de fin es requerida').bail()
    .notEmpty().withMessage('La fecha de fin no puede estar vacía').bail()
    .isISO8601().withMessage('La fecha de fin debe tener formato ISO8601').bail(),
  check('payment_date')
    .exists().withMessage('La fecha de pago es requerida').bail()
    .notEmpty().withMessage('La fecha de pago no puede estar vacía').bail()
    .isISO8601().withMessage('La fecha de pago debe tener formato ISO8601').bail(),
  check('frequency')
    .exists().withMessage('La frecuencia es requerida').bail()
    .notEmpty().withMessage('La frecuencia no puede estar vacía').bail()
    .isIn(['Quincenal', 'Mensual', 'Semanal']).withMessage('La frecuencia debe ser Quincenal, Mensual o Semanal').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdatePeriod = [
  check('id')
    .exists().withMessage('El id es requerido').bail()
    .notEmpty().withMessage('El id no puede estar vacío').bail(),
  check('name')
    .optional()
    .isString().withMessage('El nombre debe ser una cadena de texto').bail(),
  check('payment_date')
    .optional()
    .isISO8601().withMessage('La fecha de pago debe tener formato ISO8601').bail(),
  check('frequency')
    .optional()
    .isIn(['Quincenal', 'Mensual', 'Semanal']).withMessage('La frecuencia debe ser Quincenal, Mensual o Semanal').bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetAll, validateGetRecord, valiGeneratePeriod, valiUpdatePeriod };
