const { users } = require('../models/index');
const authMiddleware = require('./session');

/**
 * Middleware condicional de autenticación para el endpoint de registro de superadmin.
 * Permite acceso público SOLO si no existe ningún superadmin en la base de datos (bootstrap inicial).
 * Una vez que existe al menos un superadmin, requiere autenticación.
 *
 * Este middleware implementa la seguridad CRIT-001: solo superadmin puede crear otro superadmin,
 * excepto en el caso del bootstrap inicial donde aún no existe ningún superadmin.
 *
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Function} next - Next middleware function
 */
const conditionalAuthForSuperAdmin = async(req, res, next) => {
  try {
    // Verificar si ya existe al menos un superadmin en la base de datos
    const superadminCount = await users.count({
      where: {
        role: 'superadmin'
      }
    });

    // Si existe al menos un superadmin, requiere autenticación
    if (superadminCount > 0) {
      // Marcar que se requiere autenticación completa
      req.requiresAuth = true;
      // Llamar al middleware de autenticación normal
      return authMiddleware(req, res, next);
    }

    // Si no existe ningún superadmin, permitir acceso público (bootstrap inicial)
    // Esto solo debería suceder la primera vez que se configura el sistema
    req.requiresAuth = false;
    req.isBootstrap = true;
    next();
  } catch (error) {
    // En caso de error, requerir autenticación por seguridad
    req.requiresAuth = true;
    return authMiddleware(req, res, next);
  }
};

module.exports = conditionalAuthForSuperAdmin;
