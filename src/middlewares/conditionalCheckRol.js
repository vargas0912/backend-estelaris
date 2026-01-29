const checkRol = require('./rol');

/**
 * Wrapper condicional para checkRol que lo omite durante el bootstrap inicial.
 * Si el request viene del bootstrap (no hay superadmins), omite la verificación de roles.
 * De lo contrario, ejecuta checkRol normalmente.
 *
 * @param {Array} roles - Array de roles permitidos
 * @param {String} codename - Código del privilegio requerido
 * @returns {Function} Middleware function
 */
const conditionalCheckRol = (roles, codename) => async(req, res, next) => {
  // Si es bootstrap inicial (no hay superadmins), permitir acceso sin verificar roles
  if (req.isBootstrap) {
    return next();
  }

  // Si no es bootstrap, ejecutar checkRol normalmente
  return checkRol(roles, codename)(req, res, next);
};

module.exports = conditionalCheckRol;
