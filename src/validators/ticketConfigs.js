const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { TICKET_TYPES, PAPER_WIDTHS, TICKET_CONFIG_VALIDATORS } = require('../constants/ticketConfigs');

const ticketTypes = Object.values(TICKET_TYPES);
const paperWidths = Object.values(PAPER_WIDTHS);
const booleanFields = ['show_logo', 'show_iva', 'show_barcode', 'show_folio', 'show_cashier', 'show_branch_address'];

const validateResolve = [
  check('type')
    .isIn(ticketTypes).withMessage(TICKET_CONFIG_VALIDATORS.TYPE_INVALID),

  (req, res, next) => validateResults(req, res, next)
];

const valiUpdateRecord = [
  check('type')
    .isIn(ticketTypes).withMessage(TICKET_CONFIG_VALIDATORS.TYPE_INVALID),

  check('title').optional({ nullable: true })
    .isString().withMessage(TICKET_CONFIG_VALIDATORS.TITLE_INVALID).bail()
    .isLength({ max: 100 }).withMessage(TICKET_CONFIG_VALIDATORS.TITLE_INVALID),

  check('header_text').optional({ nullable: true })
    .isString().withMessage(TICKET_CONFIG_VALIDATORS.HEADER_TEXT_INVALID).bail()
    .isLength({ max: 255 }).withMessage(TICKET_CONFIG_VALIDATORS.HEADER_TEXT_INVALID),

  check('footer_text').optional({ nullable: true })
    .isString().withMessage(TICKET_CONFIG_VALIDATORS.FOOTER_TEXT_INVALID).bail()
    .isLength({ max: 255 }).withMessage(TICKET_CONFIG_VALIDATORS.FOOTER_TEXT_INVALID),

  ...booleanFields.map((field) =>
    check(field).optional()
      .isBoolean({ strict: true }).withMessage(TICKET_CONFIG_VALIDATORS.BOOLEAN_INVALID)
  ),

  check('paper_width').optional()
    .isIn(paperWidths).withMessage(TICKET_CONFIG_VALIDATORS.PAPER_WIDTH_INVALID),

  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateResolve, valiUpdateRecord };
