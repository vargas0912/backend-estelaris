const { getOneUserPrivilege } = require('../services/user-privileges');
const { handleHttpError } = require('../utils/handleErorr');
const { ERR_SECURITY } = require('../constants/errors');
const { ROLE } = require('../constants/roles');

/**
 * Middleware para validar acceso al endpoint /privileges/user/:id
 *
 * Permite:
 * 1. SIEMPRE: Usuario consultando SUS PROPIOS privileges (req.params.id == req.user.id)
 * 2. SIEMPRE: SuperAdmin consultando cualquier usuario
 * 3. SOLO CON PRIVILEGE: Admin con privilege específico consultando OTRO usuario
 *
 * @param {string} privilegeCodename - Privilege requerido para consultar OTROS usuarios (opcional)
 */
const checkOwnPrivilegesOrSuperAdmin = (privilegeCodename = null) => async(req, res, next) => {
  try {
    const { user } = req;
    const targetUserId = parseInt(req.params.id, 10);

    // CASO 1: Usuario consultando SUS PROPIOS privileges
    // → SIEMPRE permitido (es parte de su sesión)
    if (user.id === targetUserId) {
      return next();
    }

    // CASO 2: SuperAdmin consultando CUALQUIER usuario
    // → SIEMPRE permitido (acceso total)
    if (user.role === ROLE.SUPERADMIN) {
      return next();
    }

    // CASO 3: Admin consultando OTRO usuario
    // → Requiere privilege específico si se especificó
    if (privilegeCodename) {
      const privilege = await getOneUserPrivilege(user.id, privilegeCodename);

      if (!privilege) {
        handleHttpError(res, ERR_SECURITY.NOT_PRIVILEGE, 403);
        return;
      }

      return next();
    }

    // Si llegamos aquí, no tiene permiso
    handleHttpError(res, ERR_SECURITY.NOT_PERMISION, 403);
  } catch (error) {
    console.error('[checkOwnPrivilegesOrSuperAdmin] Error:', error);
    handleHttpError(res, ERR_SECURITY.NOT_PERMISION, 403);
  }
};

module.exports = checkOwnPrivilegesOrSuperAdmin;
