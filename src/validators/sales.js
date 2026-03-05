const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { SALES_VALIDATORS } = require('../constants/sales');

const validateGetRecord = [
  check('id')
    .exists().withMessage(SALES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByCustomer = [
  check('customer_id')
    .exists().withMessage(SALES_VALIDATORS.CUSTOMER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.CUSTOMER_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.CUSTOMER_ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(SALES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.BRANCH_ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('branch_id')
    .exists().withMessage(SALES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.BRANCH_ID_INVALID).bail()
    .toInt(),
  check('customer_id')
    .exists().withMessage(SALES_VALIDATORS.CUSTOMER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.CUSTOMER_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.CUSTOMER_ID_INVALID).bail()
    .toInt(),
  check('customer_address_id')
    .exists().withMessage(SALES_VALIDATORS.CUSTOMER_ADDRESS_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.CUSTOMER_ADDRESS_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.CUSTOMER_ADDRESS_ID_INVALID).bail()
    .toInt(),
  check('employee_id')
    .exists().withMessage(SALES_VALIDATORS.EMPLOYEE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.EMPLOYEE_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.EMPLOYEE_ID_INVALID).bail()
    .toInt(),
  check('price_list_id')
    .optional({ nullable: true })
    .isInt().withMessage(SALES_VALIDATORS.PRICE_LIST_ID_INVALID).bail()
    .toInt(),
  check('sales_date')
    .exists().withMessage(SALES_VALIDATORS.SALES_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.SALES_DATE_IS_EMPTY).bail()
    .isDate().withMessage(SALES_VALIDATORS.SALES_DATE_INVALID).bail(),
  check('sales_type')
    .optional()
    .isIn(['Contado', 'Credito']).withMessage(SALES_VALIDATORS.SALES_TYPE_INVALID).bail(),
  check('payment_periods')
    .optional({ nullable: true })
    .isIn(['Semanal', 'Quincenal', 'Mensual']).withMessage(SALES_VALIDATORS.PAYMENT_PERIODS_INVALID).bail(),
  check('total_days_term')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage(SALES_VALIDATORS.TOTAL_DAYS_TERM_INVALID).bail()
    .toInt(),
  check('invoice')
    .optional({ nullable: true })
    .isString().withMessage(SALES_VALIDATORS.INVOICE_INVALID).bail()
    .isLength({ max: 50 }).withMessage(SALES_VALIDATORS.INVOICE_TOO_LONG).bail(),
  check('discount_amount')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(SALES_VALIDATORS.DISCOUNT_AMOUNT_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(SALES_VALIDATORS.DISCOUNT_AMOUNT_INVALID),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(SALES_VALIDATORS.NOTES_INVALID).bail(),
  check('items')
    .exists().withMessage(SALES_VALIDATORS.ITEMS_NOT_EXISTS).bail()
    .isArray({ min: 1 }).withMessage(SALES_VALIDATORS.ITEMS_INVALID).bail(),
  check('items.*.product_id')
    .isString().withMessage(SALES_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail()
    .isLength({ max: 20 }).withMessage(SALES_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail(),
  check('items.*.qty')
    .isDecimal({ decimal_digits: '0,3', force_decimal: false }).withMessage(SALES_VALIDATORS.ITEM_QTY_INVALID).bail()
    .custom(val => parseFloat(val) > 0).withMessage(SALES_VALIDATORS.ITEM_QTY_INVALID),
  check('items.*.unit_price')
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(SALES_VALIDATORS.ITEM_UNIT_PRICE_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(SALES_VALIDATORS.ITEM_UNIT_PRICE_INVALID),
  check('items.*.discount')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(SALES_VALIDATORS.ITEM_DISCOUNT_INVALID).bail()
    .custom(val => parseFloat(val) >= 0 && parseFloat(val) <= 100).withMessage(SALES_VALIDATORS.ITEM_DISCOUNT_INVALID),
  check('items.*.tax_rate')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(SALES_VALIDATORS.ITEM_TAX_RATE_INVALID),
  check('items.*.purch_id')
    .optional({ nullable: true })
    .isInt().withMessage(SALES_VALIDATORS.ITEM_PURCH_ID_INVALID).bail()
    .toInt(),
  check('items.*.notes')
    .optional({ nullable: true })
    .isString().withMessage(SALES_VALIDATORS.ITEM_NOTES_INVALID).bail(),
  check('delivery_status')
    .optional()
    .isIn(['Entregado', 'Pendiente']).withMessage(SALES_VALIDATORS.DELIVERY_STATUS_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(SALES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALES_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SALES_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  check('invoice')
    .optional({ nullable: true })
    .isString().withMessage(SALES_VALIDATORS.INVOICE_INVALID).bail()
    .isLength({ max: 50 }).withMessage(SALES_VALIDATORS.INVOICE_TOO_LONG).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(SALES_VALIDATORS.NOTES_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetRecord,
  validateGetByCustomer,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord
};
