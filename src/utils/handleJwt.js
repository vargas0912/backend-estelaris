const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET;

// Validar que JWT_SECRET esté configurado
if (!JWT_SECRET) {
  logger.error(
    'FATAL ERROR: JWT_SECRET is not defined in environment variables'
  );
  process.exit(1);
}

/**
 * Firma un token JWT con el payload del usuario
 * @param {Object} user - Objeto de usuario con id y role
 * @returns {Promise<string>} Token JWT firmado
 */
const tokenSign = async(user) => {
  try {
    const sign = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: '2h',
        algorithm: 'HS256',
        issuer: 'estelaris-api',
        audience: 'estelaris-client'
      }
    );

    return sign;
  } catch (error) {
    logger.error('Error signing JWT token:', {
      error: error.message,
      userId: user.id
    });
    throw error;
  }
};
/**
 * Verifica y decodifica un token JWT
 * @param {String} tokenJwt - Token JWT a verificar
 * @returns {Promise<Object|null>} Payload decodificado o objeto de error
 */
const verifyToken = async(tokenJwt) => {
  try {
    // Verificar con algoritmo específico para prevenir vulnerabilidades
    const decoded = jwt.verify(tokenJwt, JWT_SECRET, {
      algorithms: ['HS256'], // Solo permitir HS256
      issuer: 'estelaris-api',
      audience: 'estelaris-client'
    });

    return decoded;
  } catch (error) {
    // Manejo específico de errores JWT
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { expiredAt: error.expiredAt });
      return {
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired',
        expiredAt: error.expiredAt
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { message: error.message });
      return {
        error: 'TOKEN_INVALID',
        message: 'Token is invalid'
      };
    }

    if (error instanceof jwt.NotBeforeError) {
      logger.warn('Token not active yet', { date: error.date });
      return {
        error: 'TOKEN_NOT_ACTIVE',
        message: 'Token is not active yet'
      };
    }

    // Error desconocido
    logger.error('Unknown JWT verification error:', { error: error.message });
    return null;
  }
};

module.exports = { tokenSign, verifyToken };
