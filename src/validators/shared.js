const { check } = require('express-validator');

const paginationChecks = [
  check('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor a 0'),
  check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser un entero entre 1 y 100')
];

const sortChecks = (whitelist) => [
  check('sortBy').optional().isString().trim().isIn(whitelist).withMessage('INVALID_SORT_FIELD'),
  check('sortOrder').optional().isString().trim().isIn(['ASC', 'DESC']).withMessage('INVALID_SORT_ORDER')
];

module.exports = { paginationChecks, sortChecks };
