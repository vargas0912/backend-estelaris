const { query } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateKpis = [
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateTrends = [
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateTopProducts = [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  query('sort_by').optional().isIn(['ingreso_total', 'unidades_vendidas']),
  (req, res, next) => validateResults(req, res, next)
];

const validateExpensesByMonth = [
  query('months').optional().isInt({ min: 1, max: 60 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateRecentSales = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateSalesByBranch = [
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateKpis, validateTrends, validateTopProducts, validateExpensesByMonth, validateRecentSales, validateSalesByBranch };
