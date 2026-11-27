const crypto = require('crypto');

const logger = require('../utils/logger');
const { handleHttpError } = require('../utils/handleErorr');
const {
  allowBearer,
  csrfMode,
  csrfCookieOptions,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
} = require('../config/security');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_ERROR = 'CSRF_TOKEN_INVALID';

/** Genera un token nuevo y lo pone en la cookie XSRF-TOKEN */
const issueCsrfToken = (res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return token;
};

const tokensMatch = (cookie, header) => {
  if (typeof cookie !== 'string' || typeof header !== 'string') return false;
  if (!cookie || cookie.length !== header.length) return false;
  return crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header));
};

/**
 * Protección CSRF con doble cookie.
 *
 * En POST, PUT, PATCH y DELETE compara la cookie XSRF-TOKEN con el header
 * X-XSRF-TOKEN. Otro sitio puede hacer que el navegador mande las cookies,
 * pero no puede leerlas para copiar el valor en el header.
 *
 * Las peticiones autenticadas con `Authorization: Bearer` (tests, Swagger,
 * scripts) no dependen de cookies, así que no son vulnerables a CSRF y se
 * dejan pasar mientras AUTH_ALLOW_BEARER esté activo.
 */
const csrfProtection = (req, res, next) => {
  const mode = csrfMode();
  if (mode === 'off' || SAFE_METHODS.includes(req.method)) return next();

  const hasBearer = /^Bearer\s+\S+/i.test(req.headers.authorization || '');
  if (hasBearer && allowBearer()) return next();

  if (tokensMatch(req.cookies?.[CSRF_COOKIE_NAME], req.get(CSRF_HEADER_NAME))) return next();

  if (mode === 'report') {
    logger.warn(`[csrf] petición sin token CSRF válido: ${req.method} ${req.originalUrl}`);
    return next();
  }

  return handleHttpError(res, CSRF_ERROR, 403);
};

module.exports = { csrfProtection, issueCsrfToken, CSRF_ERROR };
