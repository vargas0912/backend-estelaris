const handleHttpError = (res, message, code = 403, extra = {}) => {
  res.status(code);
  res.send({ error: message, ...extra });
};

module.exports = { handleHttpError };
