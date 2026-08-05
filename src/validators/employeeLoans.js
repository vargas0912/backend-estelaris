const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

/**
 * Validaciones para listado paginado de préstamos
 */
const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

/**
 * Validaciones para obtener un préstamo por id
 */
const validateGetRecord = [
  check('id')
    .exists().withMessage('El id es requerido').bail()
    .notEmpty().withMessage('El id no puede estar vacío').bail(),
  (req, res, next) => validateResults(req, res, next)
];

/**
 * Validaciones para obtener préstamos por empleado
 */
const validateGetByEmployee = [
  check('employee_id')
    .exists().withMessage('El employee_id es requerido').bail()
    .notEmpty().withMessage('El employee_id no puede estar vacío').bail()
    .isInt().withMessage('El employee_id debe ser un entero').bail(),
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

/**
 * Validaciones para solicitar un préstamo (POST /)
 */
const valiRequestLoan = [
  check('employee_id')
    .exists().withMessage('El employee_id es requerido').bail()
    .isInt().withMessage('El employee_id debe ser un entero').bail(),
  check('branch_id')
    .optional()
    .isInt().withMessage('El branch_id debe ser un entero'),
  check('amount')
    .exists().withMessage('El monto es requerido').bail()
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0').bail(),
  check('reason')
    .optional()
    .isString().withMessage('La razón debe ser texto'),
  check('disbursement_date')
    .exists().withMessage('La fecha de desembolso es requerida').bail()
    .isISO8601().withMessage('La fecha de desembolso debe tener formato ISO8601').bail(),
  check('installment_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto de cuota debe ser mayor o igual a 0'),
  (req, res, next) => validateResults(req, res, next)
];

/**
 * Validaciones para solicitar un préstamo desde el portal del empleado (sin employee_id ni branch_id)
 */
const valiMeRequestLoan = [
  check('amount')
    .exists().withMessage('AMOUNT_NOT_EXISTS').bail()
    .notEmpty().withMessage('AMOUNT_IS_EMPTY').bail()
    .isFloat({ min: 0.01 }).withMessage('AMOUNT_INVALID').bail(),
  check('reason')
    .optional()
    .isString().trim(),
  check('disbursement_date')
    .exists().withMessage('DISBURSEMENT_DATE_NOT_EXISTS').bail()
    .notEmpty().withMessage('DISBURSEMENT_DATE_IS_EMPTY').bail()
    .isISO8601().withMessage('DISBURSEMENT_DATE_INVALID').bail(),
  check('installment_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('INSTALLMENT_AMOUNT_INVALID'),
  (req, res, next) => validateResults(req, res, next)
];

/**
 * Validaciones para aprobar un préstamo (POST /:id/approve)
 */
const valiApproveLoan = [
  check('id')
    .exists().withMessage('El id es requerido').bail()
    .notEmpty().withMessage('El id no puede estar vacío').bail(),
  check('installment_amount')
    .exists().withMessage('El monto de cuota es requerido').bail()
    .isFloat({ min: 0.01 }).withMessage('El monto de cuota debe ser mayor a 0').bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetAll,
  validateGetRecord,
  validateGetByEmployee,
  valiRequestLoan,
  valiMeRequestLoan,
  valiApproveLoan
};
