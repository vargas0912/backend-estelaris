const handleHttpError = (res, message, code = 403) => {
  res.status(code);
  res.send({ error: message });
};

module.exports = { handleHttpError };
