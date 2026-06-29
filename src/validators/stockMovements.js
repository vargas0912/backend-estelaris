const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { paginationChecks } = require('./shared');

const validateGetByProduct = [
  check('product_id')
    .exists().withMessage('product_id es requerido').bail()
    .notEmpty().withMessage('product_id no puede estar vacío').bail()
    .isString().withMessage('product_id debe ser un texto').bail()
    .isLength({ max: 20 }).withMessage('product_id no puede superar 20 caracteres').bail(),
  ...paginationChecks,
  check('sortOrder')
    .optional()
    .isString().trim()
    .isIn(['ASC', 'DESC']).withMessage('sortOrder debe ser ASC o DESC'),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateGetByProduct };
