const { handleForbidden } = require('../utils/handleErorr');

/**
 * @param {Request} req Request param
 * @param {Response} res Response param
 * @param {Next} next Next action
 */
const customHeader = (req, res, next) => {
  try {
    const apiKey = req.headers.apiKey;

    const apiValue = 'vargas0912';

    if (apiKey === apiValue) {
      next();
    } else {
      handleForbidden(res, 'APIKEY_INCORRECT');
    }
  } catch (error) {
    handleForbidden(res, 'CUSTOMHEADER_FAIL');
  }
};

module.exports = customHeader;
