const { query } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateDailyMovement = [
  query('branch_id')
    .notEmpty().withMessage('branch_id es requerido')
    .isInt({ min: 1 }).withMessage('branch_id debe ser un número entero positivo')
    .toInt(),
  query('date')
    .notEmpty().withMessage('date es requerida')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('date debe tener formato YYYY-MM-DD'),
  (req, res, next) => validateResults(req, res, next)
];

const validateAccountsReceivable = [
  query('branch_id')
    .notEmpty().withMessage('branch_id es requerido')
    .isInt({ min: 1 }).withMessage('branch_id debe ser un número entero positivo')
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateInventoryReport = [
  query('branch_id')
    .notEmpty().withMessage('branch_id es requerido')
    .isInt({ min: 1 }).withMessage('branch_id debe ser un número entero positivo')
    .toInt(),
  query('start_date')
    .notEmpty().withMessage('start_date es requerida')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('start_date debe tener formato YYYY-MM-DD'),
  query('end_date')
    .notEmpty().withMessage('end_date es requerida')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('end_date debe tener formato YYYY-MM-DD')
    .custom((endDate, { req }) => {
      if (endDate < req.query.start_date) throw new Error('end_date debe ser mayor o igual a start_date');
      return true;
    }),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateDailyMovement, validateAccountsReceivable, validateInventoryReport };
