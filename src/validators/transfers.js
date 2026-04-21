const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { TRANSFERS_VALIDATORS } = require('../constants/transfers');
const { paginationChecks } = require('./shared');

const validateGetAll = [
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetRecord = [
  check('id')
    .exists().withMessage(TRANSFERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetByBranch = [
  check('branch_id')
    .exists().withMessage(TRANSFERS_VALIDATORS.BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.BRANCH_ID_INVALID).bail()
    .toInt(),
  ...paginationChecks,
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('from_branch_id')
    .exists().withMessage(TRANSFERS_VALIDATORS.FROM_BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.FROM_BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.FROM_BRANCH_ID_INVALID).bail()
    .toInt(),
  check('to_branch_id')
    .exists().withMessage(TRANSFERS_VALIDATORS.TO_BRANCH_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.TO_BRANCH_ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.TO_BRANCH_ID_INVALID).bail()
    .toInt(),
  check('transfer_date')
    .exists().withMessage(TRANSFERS_VALIDATORS.TRANSFER_DATE_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.TRANSFER_DATE_IS_EMPTY).bail()
    .isDate().withMessage(TRANSFERS_VALIDATORS.TRANSFER_DATE_INVALID).bail(),
  check('driver_id')
    .optional({ nullable: true })
    .isInt().withMessage(TRANSFERS_VALIDATORS.DRIVER_ID_INVALID).bail()
    .toInt(),
  check('transport_plate')
    .optional({ nullable: true })
    .isString().withMessage(TRANSFERS_VALIDATORS.TRANSPORT_PLATE_INVALID).bail()
    .isLength({ max: 20 }).withMessage(TRANSFERS_VALIDATORS.TRANSPORT_PLATE_TOO_LONG).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(TRANSFERS_VALIDATORS.NOTES_INVALID).bail(),
  check('items')
    .exists().withMessage(TRANSFERS_VALIDATORS.ITEMS_NOT_EXISTS).bail()
    .isArray({ min: 1 }).withMessage(TRANSFERS_VALIDATORS.ITEMS_INVALID).bail(),
  check('items.*.product_id')
    .isString().withMessage(TRANSFERS_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail()
    .isLength({ max: 20 }).withMessage(TRANSFERS_VALIDATORS.ITEM_PRODUCT_ID_INVALID).bail(),
  check('items.*.qty')
    .isDecimal({ decimal_digits: '0,3', force_decimal: false }).withMessage(TRANSFERS_VALIDATORS.ITEM_QTY_INVALID).bail()
    .custom(val => parseFloat(val) > 0).withMessage(TRANSFERS_VALIDATORS.ITEM_QTY_INVALID),
  check('items.*.unit_cost')
    .isDecimal({ decimal_digits: '0,2', force_decimal: false }).withMessage(TRANSFERS_VALIDATORS.ITEM_UNIT_COST_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(TRANSFERS_VALIDATORS.ITEM_UNIT_COST_INVALID),
  check('items.*.purch_id')
    .optional({ nullable: true })
    .isInt().withMessage(TRANSFERS_VALIDATORS.ITEM_PURCH_ID_INVALID),
  check('items.*.notes')
    .optional({ nullable: true })
    .isString().withMessage(TRANSFERS_VALIDATORS.ITEM_NOTES_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('id')
    .exists().withMessage(TRANSFERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  check('transfer_date')
    .optional()
    .isDate().withMessage(TRANSFERS_VALIDATORS.TRANSFER_DATE_INVALID).bail(),
  check('driver_id')
    .optional({ nullable: true })
    .isInt().withMessage(TRANSFERS_VALIDATORS.DRIVER_ID_INVALID)
    .toInt(),
  check('transport_plate')
    .optional({ nullable: true })
    .isString().withMessage(TRANSFERS_VALIDATORS.TRANSPORT_PLATE_INVALID).bail()
    .isLength({ max: 20 }).withMessage(TRANSFERS_VALIDATORS.TRANSPORT_PLATE_TOO_LONG),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(TRANSFERS_VALIDATORS.NOTES_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

const validateDispatchRecord = [
  check('id')
    .exists().withMessage(TRANSFERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateReceiveRecord = [
  check('id')
    .exists().withMessage(TRANSFERS_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(TRANSFERS_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(TRANSFERS_VALIDATORS.ID_INVALID).bail()
    .toInt(),
  check('items')
    .exists().withMessage(TRANSFERS_VALIDATORS.RECEIVED_ITEMS_NOT_EXISTS).bail()
    .isArray({ min: 1 }).withMessage(TRANSFERS_VALIDATORS.RECEIVED_ITEMS_INVALID).bail(),
  check('items.*.detail_id')
    .isInt().withMessage(TRANSFERS_VALIDATORS.RECEIVED_ITEM_ID_INVALID).bail()
    .toInt(),
  check('items.*.qty_received')
    .isDecimal({ decimal_digits: '0,3', force_decimal: false }).withMessage(TRANSFERS_VALIDATORS.RECEIVED_ITEM_QTY_INVALID).bail()
    .custom(val => parseFloat(val) >= 0).withMessage(TRANSFERS_VALIDATORS.RECEIVED_ITEM_QTY_INVALID),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetAll,
  validateGetRecord,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord,
  validateDispatchRecord,
  validateReceiveRecord
};
