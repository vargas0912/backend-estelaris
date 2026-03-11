const { query } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateTrends = [
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateTopProducts = [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('months').optional().isInt({ min: 1, max: 24 }).toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateTrends, validateTopProducts };
