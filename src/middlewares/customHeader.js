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
      res.status(403);
      res.send({ error: `APIKEY INCORRECT (${apiKey})` });
    }
  } catch (error) {
    res.status(403);
    res.send({ error: 'CUSTOMHEADER FAIL' });
  }
};

module.exports = customHeader;
