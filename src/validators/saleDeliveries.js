const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { SALE_DELIVERY_VALIDATORS } = require('../constants/saleDeliveries');

const validateGetRecord = [
  check('id')
    .exists().withMessage(SALE_DELIVERY_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_DELIVERY_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const validateGetBySale = [
  check('sale_id')
    .exists().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiAddRecord = [
  check('sale_id')
    .exists().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.SALE_ID_INVALID).bail()
    .toInt(),
  check('customer_address_id')
    .exists().withMessage(SALE_DELIVERY_VALIDATORS.CUSTOMER_ADDRESS_ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_DELIVERY_VALIDATORS.CUSTOMER_ADDRESS_ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.CUSTOMER_ADDRESS_ID_INVALID).bail()
    .toInt(),
  check('driver_id')
    .optional({ nullable: true })
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.DRIVER_ID_INVALID).bail()
    .toInt(),
  check('transport_plate')
    .optional({ nullable: true })
    .isString().withMessage(SALE_DELIVERY_VALIDATORS.TRANSPORT_PLATE_INVALID).bail()
    .isLength({ max: 20 }).withMessage(SALE_DELIVERY_VALIDATORS.TRANSPORT_PLATE_TOO_LONG).bail(),
  check('estimated_date')
    .optional({ nullable: true })
    .isDate().withMessage(SALE_DELIVERY_VALIDATORS.ESTIMATED_DATE_INVALID).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(SALE_DELIVERY_VALIDATORS.NOTES_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

const valiTransition = [
  check('id')
    .exists().withMessage(SALE_DELIVERY_VALIDATORS.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(SALE_DELIVERY_VALIDATORS.ID_IS_EMPTY).bail()
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.ID_INVALID).bail(),
  check('driver_id')
    .optional({ nullable: true })
    .isInt().withMessage(SALE_DELIVERY_VALIDATORS.DRIVER_ID_INVALID).bail()
    .toInt(),
  check('transport_plate')
    .optional({ nullable: true })
    .isString().withMessage(SALE_DELIVERY_VALIDATORS.TRANSPORT_PLATE_INVALID).bail()
    .isLength({ max: 20 }).withMessage(SALE_DELIVERY_VALIDATORS.TRANSPORT_PLATE_TOO_LONG).bail(),
  check('location')
    .optional({ nullable: true })
    .isString().withMessage(SALE_DELIVERY_VALIDATORS.LOCATION_INVALID).bail(),
  check('notes')
    .optional({ nullable: true })
    .isString().withMessage(SALE_DELIVERY_VALIDATORS.NOTES_INVALID).bail(),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateGetRecord,
  validateGetBySale,
  valiAddRecord,
  valiTransition
};
