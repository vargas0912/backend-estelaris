const rateLimit = require('express-rate-limit');

// Limitar por usuario autenticado; si no hay token (ruta pública), caer a IP
const keyGenerator = (req) =>
  req.user?.id ? `user_${req.user.id}` : req.ip;

/**
 * Middleware condicional que bypasea el rate limiting en entorno de test
 * y aplica el rate limiter en otros entornos
 */
const createConditionalLimiter = (limiterConfig) => {
  const limiter = rateLimit(limiterConfig);

  return (req, res, next) => {
    // Bypass en entorno de test
    if (process.env.DISABLE_RATE_LIMIT) {
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
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator,
  message: {
    error: 'Demasiadas solicitudes de lectura, intente nuevamente en un minuto'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operaciones de escritura (POST, PUT, PATCH)
 * Más restrictivo para prevenir abuso en creación/modificación
 */
const writeLimiter = createConditionalLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator,
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
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator,
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
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator,
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
