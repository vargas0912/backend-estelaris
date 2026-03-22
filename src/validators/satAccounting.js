const { param } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

const validatePeriodId = [
  param('periodId')
    .notEmpty().withMessage('periodId es requerido')
    .isInt({ min: 1 }).withMessage('periodId debe ser un entero positivo')
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatePeriodId };
