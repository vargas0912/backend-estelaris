const { body, param, query } = require('express-validator');

const validateResults = require('../utils/handleValidator');

const { NOTIFICATION_ERRORS: ERR } = require('../constants/privileges');

const idParam = param('id')
  .exists().withMessage(ERR.ID_NOT_EXISTS).bail()
  .isInt({ min: 1 }).withMessage(ERR.ID_MUST_BE_NUMERIC).bail()
  .toInt();

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0').bail().toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser un entero entre 1 y 100').bail().toInt()
];

const validateAddRecord = [
  body('title')
    .exists().withMessage(ERR.TITLE_REQUIRED).bail()
    .isString().withMessage(ERR.TITLE_REQUIRED).bail()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage(ERR.TITLE_REQUIRED).bail(),
  body('body')
    .exists().withMessage(ERR.BODY_REQUIRED).bail()
    .isString().withMessage(ERR.BODY_REQUIRED).bail()
    .trim()
    .notEmpty().withMessage(ERR.BODY_REQUIRED).bail(),
  body('user_ids')
    .optional()
    .isArray().withMessage(ERR.USER_IDS_MUST_BE_ARRAY).bail()
    .custom(value => {
      if (!value.length) throw new Error(ERR.RECIPIENT_REQUIRED);
      return true;
    }),
  body('user_ids.*')
    .isInt({ min: 1 }).withMessage(ERR.USER_ID_INVALID).bail()
    .toInt(),
  body('branch_id')
    .optional()
    .isInt({ min: 1 }).withMessage(ERR.BRANCH_ID_INVALID).bail()
    .toInt(),
  body()
    .custom(({ user_ids: userIds, branch_id: branchId }) => {
      const hasUsers = userIds !== undefined;
      const hasBranch = branchId !== undefined;
      if (!hasUsers && !hasBranch) throw new Error(ERR.RECIPIENT_REQUIRED);
      if (hasUsers && hasBranch) throw new Error(ERR.RECIPIENT_EXCLUSIVE);
      return true;
    }),
  body('scheduled_at')
    .optional({ nullable: true })
    .isISO8601().withMessage(ERR.SCHEDULED_AT_INVALID).bail()
    .toDate(),
  body('due_at')
    .optional({ nullable: true })
    .isISO8601().withMessage(ERR.DUE_AT_INVALID).bail()
    .toDate(),
  body('ref_type')
    .optional({ nullable: true })
    .isString().withMessage(ERR.REF_TYPE_INVALID).bail()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage(ERR.REF_TYPE_INVALID).bail(),
  body('ref_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage(ERR.REF_ID_INVALID).bail()
    .toInt(),
  (req, res, next) => validateResults(req, res, next)
];

const validateUpdateRecord = [
  idParam,
  body('title')
    .optional()
    .isString().withMessage(ERR.TITLE_REQUIRED).bail()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage(ERR.TITLE_REQUIRED).bail(),
  body('body')
    .optional()
    .isString().withMessage(ERR.BODY_REQUIRED).bail()
    .trim()
    .notEmpty().withMessage(ERR.BODY_REQUIRED).bail(),
  body('scheduled_at')
    .optional()
    .isISO8601().withMessage(ERR.SCHEDULED_AT_INVALID).bail()
    .toDate(),
  body('due_at')
    .optional({ nullable: true })
    .isISO8601().withMessage(ERR.DUE_AT_INVALID).bail()
    .toDate(),
  (req, res, next) => validateResults(req, res, next)
];

const validateIdParam = [
  idParam,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetSent = [
  query('batch_id').optional().isUUID().withMessage(ERR.BATCH_ID_INVALID).bail(),
  query('user_id').optional().isInt({ min: 1 }).withMessage(ERR.USER_ID_INVALID).bail().toInt(),
  ...paginationQuery,
  (req, res, next) => validateResults(req, res, next)
];

const validateGetMine = [
  query('unread').optional().isBoolean().withMessage(ERR.UNREAD_INVALID).bail().toBoolean(),
  ...paginationQuery,
  (req, res, next) => validateResults(req, res, next)
];

const validateNoInput = [
  (req, res, next) => validateResults(req, res, next)
];

module.exports = {
  validateAddRecord,
  validateUpdateRecord,
  validateIdParam,
  validateGetSent,
  validateGetMine,
  validateNoInput
};
