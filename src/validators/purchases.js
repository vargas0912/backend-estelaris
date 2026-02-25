const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { PURCHASES_VALIDATORS } = require('../constants/purchases');

const validateGetRecord = [
  check('id')
    .exists().withMessage(PURCHASES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetBySupplier = [
  check('supplier_id')
    .exists().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('supplier_id')
    .exists().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.SUPPLIER_ID_INVALID).bail()
    .toInt(),
  check('branch_id')
    .exists().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.BRANCH_ID_INVALID).bail()
    .toInt(),
  check('purch_date')
    .exists().withMessage(PURCHASES_VALIDATORS.PURCH_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.PURCH_DATE_IS_EMPTY).bail()
    .isDate().withMessage(PURCHASES_VALIDATORS.PURCH_DATE_INVALID).bail(),
  check('invoice_number')
    .optional({ nullable: true })
    .isString().withMessage(PURCHASES_VALIDATORS.INVOICE_NUMBER_INVALID).bail()
    .isLength({ max: 50 }).withMessage(PURCHASES_VALIDATORS.INVOICE_NUMBER_TOO_LONG).bail(),
  check('purch_type')
    .optional()
    .isIn(['Contado', 'Credito']).withMessage(PURCHASES_VALIDATORS.PURCH_TYPE_INVALID).bail(),
  check('payment_method')
    .optional({ nullable: true })
    .isIn(['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']).withMessage(PURCHASES_VALIDATORS.PAYMENT_METHOD_INVALID).bail(),
  check('discount_amount')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.DISCOUNT_AMOUNT_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(PURCHASES_VALIDATORS.DISCOUNT_AMOUNT_INVALID),
  check('due_date')
    .optional({ nullable: true })
    .isDate().withMessage(PURCHASES_VALIDATORS.DUE_DATE_INVALID).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(PURCHASES_VALIDATORS.NOTES_INVALID).bail(),
  check('items')
    .exists().withMessage(PURCHASES_VALIDATORS.ITEMS_NOT_EXISTS).bail()
    .isArray({ min: 1 }).withMessage(PURCHASES_VALIDATORS.ITEMS_INVALID).bail(),
  check('items.*.product_id')
    .isInt({ min: 1 }).withMessage(PURCHASES_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail()
    .toInt(),
  check('items.*.qty')
    .isDecimal({ decimal_digits: '0,3', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.ITEM_QTY_INVALID).bail()
    .custom(val => parseFloat(val) > 0).withMessage(PURCHASES_VALIDATORS.ITEM_QTY_INVALID),
  check('items.*.unit_price')
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.ITEM_UNIT_PRICE_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(PURCHASES_VALIDATORS.ITEM_UNIT_PRICE_INVALID),
  check('items.*.discount')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.ITEM_DISCOUNT_INVALID).bail()
    .custom(val => parseFloat(val) >= 0 && parseFloat(val) <= 100).withMessage(PURCHASES_VALIDATORS.ITEM_DISCOUNT_INVALID),
  check('items.*.tax_rate')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.ITEM_TAX_RATE_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(PURCHASES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  check('status')
    .optional()
    .isIn(['Pendiente', 'Pagado', 'Cancelado']).withMessage(PURCHASES_VALIDATORS.STATUS_INVALID).bail(),
  check('payment_method')
    .optional({ nullable: true })
    .isIn(['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta']).withMessage(PURCHASES_VALIDATORS.PAYMENT_METHOD_INVALID).bail(),
  check('invoice_number')
    .optional({ nullable: true })
    .isString().withMessage(PURCHASES_VALIDATORS.INVOICE_NUMBER_INVALID).bail()
    .isLength({ max: 50 }).withMessage(PURCHASES_VALIDATORS.INVOICE_NUMBER_TOO_LONG).bail(),
  check('due_payment')
    .optional()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(PURCHASES_VALIDATORS.DUE_PAYMENT_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(PURCHASES_VALIDATORS.DUE_PAYMENT_INVALID),
  check('due_date')
    .optional({ nullable: true })
    .isDate().withMessage(PURCHASES_VALIDATORS.DUE_DATE_INVALID).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(PURCHASES_VALIDATORS.NOTES_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateReceiveRecord = [
  check('id')
    .exists().withMessage(PURCHASES_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(PURCHASES_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(PURCHASES_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetRecord,
  validateGetBySupplier,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord,
  validateReceiveRecord
};
