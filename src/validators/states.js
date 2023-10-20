const { check } = require('express-validator');
const { STATES } = require('../constants/states');

const validateResults = require('../utils/handleValidator');

const validateGetRecord = [
  check('id')
    .exists().withMessage(STATES.ID_NOT_EXISTS).bail()
    .notEmpty().withMessage(STATES.ID_IS_EMPTY).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateGetRecord };
