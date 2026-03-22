const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateJournal = [
  check('period_id').optional().isInt().toInt(),
  check('branch_id').optional().isInt().toInt(),
  check('date_from').optional().isISO8601(),
  check('date_to').optional().isISO8601(),
  (req, res, next) => validateResults(req, res, next)
];

const validateLedger = [
  check('account_id').exists().withMessage('account_id es requerido').isInt().toInt(),
  check('period_id').optional().isInt().toInt(),
  check('date_from').optional().isISO8601(),
  check('date_to').optional().isISO8601(),
  (req, res, next) => validateResults(req, res, next)
];

const validatePeriod = [
  check('period_id').exists().withMessage('period_id es requerido').isInt().toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateIncomeStatement = [
  check('period_id').exists().withMessage('period_id es requerido').isInt().toInt(),
  check('branch_id').optional().isInt().toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateJournal, validateLedger, validatePeriod, validateIncomeStatement };
