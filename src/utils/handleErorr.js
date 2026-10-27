const { FORBIDDEN } = require('../constants/forbidden');
const logger = require('./logger');

const GENERIC_SERVER_ERROR = 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';

const handleHttpError = (res, message, code = 403) => {
  res.status(code);
  res.send({ error: message });
};

/**
 * Standard 403 body: { error: <es-MX message>, code: <STABLE_CODE> }
 * @param {string} code Key of the FORBIDDEN catalog
 */
const handleForbidden = (res, code) => {
  let message = FORBIDDEN[code];
  if (!message) {
    // Unregistered code: fix the call site, but never answer a 403 without `error`.
    logger.error(`handleForbidden: unknown code "${code}"`);
    message = FORBIDDEN.ERROR_NOT_PERMISSION;
  }
  res.status(403);
  res.send({ error: message, code });
};

/**
 * Standard 500 body: { error: <generic es-MX message>, code: <context> }.
 * The technical detail goes to the logs, never to the client.
 * @param {string} context Stable identifier of the failed operation
 * @param {Error} error Original error
 */
const handleServerError = (res, context, error) => {
  logger.error(`${context} -> ${error && error.message ? error.message : error}`);
  res.status(500);
  res.send({ error: GENERIC_SERVER_ERROR, code: context });
};

module.exports = { handleHttpError, handleForbidden, handleServerError };
