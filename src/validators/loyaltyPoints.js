const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validateGetCustomer = [
  check('customerId')
    .exists().withMessage('CUSTOMER_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('CUSTOMER_ID_IS_EMPTY').bail()
    .isInt({ min: 1 }).withMessage('CUSTOMER_ID_INVALID').bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetTransactions = [
  check('customerId')
    .exists().withMessage('CUSTOMER_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('CUSTOMER_ID_IS_EMPTY').bail()
    .isInt({ min: 1 }).withMessage('CUSTOMER_ID_INVALID').bail()
    .toInt(),
  check('page')
    .optional()
    .isInt({ min: 1 }).withMessage('PAGE_INVALID').bail()
    .toInt(),
  check('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('LIMIT_INVALID').bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateCreateConfig = [
  check('branch_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('BRANCH_ID_INVALID').bail()
    .toInt(),
  check('is_active')
    .optional()
    .isBoolean().withMessage('IS_ACTIVE_INVALID').bail(),
  check('points_per_peso')
    .optional()
    .isDecimal({ decimal_digits: '0,4', force_decimal: false }).withMessage('POINTS_PER_PESO_INVALID').bail()
    .custom(val => parseFloat(val) > 0).withMessage('POINTS_PER_PESO_INVALID'),
  check('earn_on_tax')
    .optional()
    .isBoolean().withMessage('EARN_ON_TAX_INVALID').bail(),
  check('earn_on_discount')
    .optional()
    .isBoolean().withMessage('EARN_ON_DISCOUNT_INVALID').bail(),
  check('earn_on_credit')
    .optional()
    .isBoolean().withMessage('EARN_ON_CREDIT_INVALID').bail(),
  check('earn_on_credit_when')
    .optional()
    .isIn(['sale', 'paid']).withMessage('EARN_ON_CREDIT_WHEN_INVALID').bail(),
  check('peso_per_point')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('PESO_PER_POINT_INVALID').bail()
    .custom(val => parseFloat(val) > 0).withMessage('PESO_PER_POINT_INVALID'),
  check('min_points_redeem')
    .optional()
    .isInt({ min: 0 }).withMessage('MIN_POINTS_REDEEM_INVALID').bail()
    .toInt(),
  check('max_redeem_pct')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('MAX_REDEEM_PCT_INVALID').bail()
    .custom(val => parseFloat(val) > 0 && parseFloat(val) <= 100).withMessage('MAX_REDEEM_PCT_INVALID'),
  check('max_redeem_points')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('MAX_REDEEM_POINTS_INVALID').bail()
    .toInt(),
  check('points_expiry_days')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('POINTS_EXPIRY_DAYS_INVALID').bail()
    .toInt(),
  check('rounding_strategy')
    .optional()
    .isIn(['floor', 'round', 'ceil']).withMessage('ROUNDING_STRATEGY_INVALID').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateUpdateConfig = [
  check('id')
    .exists().withMessage('ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('ID_IS_EMPTY').bail()
    .isInt({ min: 1 }).withMessage('ID_INVALID').bail()
    .toInt(),
  check('branch_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('BRANCH_ID_INVALID').bail()
    .toInt(),
  check('is_active')
    .optional()
    .isBoolean().withMessage('IS_ACTIVE_INVALID').bail(),
  check('points_per_peso')
    .optional()
    .isDecimal({ decimal_digits: '0,4', force_decimal: false }).withMessage('POINTS_PER_PESO_INVALID').bail()
    .custom(val => parseFloat(val) > 0).withMessage('POINTS_PER_PESO_INVALID'),
  check('earn_on_tax')
    .optional()
    .isBoolean().withMessage('EARN_ON_TAX_INVALID').bail(),
  check('earn_on_discount')
    .optional()
    .isBoolean().withMessage('EARN_ON_DISCOUNT_INVALID').bail(),
  check('earn_on_credit')
    .optional()
    .isBoolean().withMessage('EARN_ON_CREDIT_INVALID').bail(),
  check('earn_on_credit_when')
    .optional()
    .isIn(['sale', 'paid']).withMessage('EARN_ON_CREDIT_WHEN_INVALID').bail(),
  check('peso_per_point')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('PESO_PER_POINT_INVALID').bail()
    .custom(val => parseFloat(val) > 0).withMessage('PESO_PER_POINT_INVALID'),
  check('min_points_redeem')
    .optional()
    .isInt({ min: 0 }).withMessage('MIN_POINTS_REDEEM_INVALID').bail()
    .toInt(),
  check('max_redeem_pct')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage('MAX_REDEEM_PCT_INVALID').bail()
    .custom(val => parseFloat(val) > 0 && parseFloat(val) <= 100).withMessage('MAX_REDEEM_PCT_INVALID'),
  check('max_redeem_points')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('MAX_REDEEM_POINTS_INVALID').bail()
    .toInt(),
  check('points_expiry_days')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('POINTS_EXPIRY_DAYS_INVALID').bail()
    .toInt(),
  check('rounding_strategy')
    .optional()
    .isIn(['floor', 'round', 'ceil']).withMessage('ROUNDING_STRATEGY_INVALID').bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateAdjustPoints = [
  check('customerId')
    .exists().withMessage('CUSTOMER_ID_NOT_EXISTS').bail()
    .notEmpty().withMessage('CUSTOMER_ID_IS_EMPTY').bail()
    .isInt({ min: 1 }).withMessage('CUSTOMER_ID_INVALID').bail()
    .toInt(),
  check('amount')
    .exists().withMessage('AMOUNT_NOT_EXISTS').bail()
    .notEmpty().withMessage('AMOUNT_IS_EMPTY').bail()
    .isFloat().withMessage('AMOUNT_INVALID').bail()
    .custom(val => parseFloat(val) !== 0).withMessage('AMOUNT_CANNOT_BE_ZERO'),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage('NOTES_INVALID').bail()
    .isLength({ max: 500 }).withMessage('NOTES_TOO_LONG').bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetCustomer,
  validateGetTransactions,
  validateCreateConfig,
  validateUpdateConfig,
  validateAdjustPoints
};
