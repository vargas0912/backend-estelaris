const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { SALE_PAYMENT_VALIDATORS } = require('../constants/salePayments');
const { paginationChecks } = require('./shared');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_PAYMENT_VALIDATORS.ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetBySale = [
  check('sale_id')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_INVALID).bail(),
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('sale_id')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_PAYMENT_VALIDATORS.SALE_ID_INVALID).bail()
    .toInt(),
  check('payment_amount')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_AMOUNT_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_AMOUNT_IS_EMPTY).bail()
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_AMOUNT_INVALID).bail()
    .custom(val => parseFloat(val) > 0).withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_AMOUNT_INVALID),
  check('payment_date')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_DATE_IS_EMPTY).bail()
    .isDate().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_DATE_INVALID).bail(),
  check('payment_method')
    .exists().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_METHOD_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_METHOD_IS_EMPTY).bail()
    .isIn(['Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta']).withMessage(SALE_PAYMENT_VALIDATORS.PAYMENT_METHOD_INVALID).bail(),
  check('reference_number')
    .optional({ nullable: true })
    .isString().withMessage(SALE_PAYMENT_VALIDATORS.REFERENCE_NUMBER_INVALID).bail()
    .isLength({ max: 100 }).withMessage(SALE_PAYMENT_VALIDATORS.REFERENCE_NUMBER_TOO_LONG).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(SALE_PAYMENT_VALIDATORS.NOTES_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetAll,
  validateGetRecord,
  validateGetBySale,
  valiAddRecord
};
