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

const MAX_AGING_BUCKETS = 6;
const MAX_AGING_DAYS = 3650;

const validateAgingLots = [
  query('buckets')
    .optional()
    .custom((value) => {
      const nums = String(value).split(',').map(Number);
      const valid = nums.length <= MAX_AGING_BUCKETS &&
        nums.every((n, i) => Number.isInteger(n) && n >= 1 && n <= MAX_AGING_DAYS && (i === 0 || n > nums[i - 1]));
      if (!valid) {
        throw new Error(`buckets must be up to ${MAX_AGING_BUCKETS} strictly ascending positive integers separated by commas`);
      }
      return true;
    })
    .customSanitizer(value => String(value).split(',').map(Number)),
  query('min_days').optional().isInt({ min: 0, max: MAX_AGING_DAYS }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('branch_id').optional().isInt({ min: 1 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateKpis, validateTrends, validateTopProducts, validateExpensesByMonth, validateRecentSales, validateSalesByBranch, validateAgingLots };
