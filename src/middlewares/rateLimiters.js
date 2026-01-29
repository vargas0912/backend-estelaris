const rateLimit = require('express-rate-limit');

/**
 * Middleware condicional que bypasea el rate limiting en entorno de test
 * y aplica el rate limiter en otros entornos
 */
const createConditionalLimiter = (limiterConfig) => {
  const limiter = rateLimit(limiterConfig);

  return (req, res, next) => {
    // Bypass en entorno de test
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    // Aplicar rate limiter en otros entornos
    return limiter(req, res, next);
  };
};

/**
 * Rate limiter para operaciones de lectura (GET individuales y listados simples)
 * Permite mayor volumen ya que son operaciones menos costosas
 */
const readLimiter = createConditionalLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: {
    error: 'Demasiadas solicitudes de lectura, intente nuevamente en un minuto'
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false // Deshabilitar headers `X-RateLimit-*`
});

/**
 * Rate limiter para operaciones de escritura (POST, PUT, PATCH)
 * Más restrictivo para prevenir abuso en creación/modificación
 */
const writeLimiter = createConditionalLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 requests por minuto
  message: {
    error: 'Demasiadas solicitudes de escritura, intente nuevamente en un minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones de búsqueda/listado con filtros
 * Intermedio entre lectura y escritura, ya que pueden ser costosas
 */
const searchLimiter = createConditionalLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: {
    error: 'Demasiadas solicitudes de búsqueda, intente nuevamente en un minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones de eliminación (DELETE)
 * Muy restrictivo para prevenir eliminaciones masivas accidentales o maliciosas
 */
const deleteLimiter = createConditionalLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto
  message: {
    error: 'Demasiadas solicitudes de eliminación, intente nuevamente en un minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  readLimiter,
  writeLimiter,
  searchLimiter,
  deleteLimiter
};
