const { validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  try {
    // if not exists error, then...
    validationResult(req).throw();

    // ...continue to controller
    return next();
  } catch (error) {
    res.status(400);
    res.send({ errors: error.array() });
  }
};

module.exports = validateResults;
