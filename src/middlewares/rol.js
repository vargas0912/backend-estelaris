const { getOneUserPrivilege } = require('../services/user-privileges');
const { handleForbidden } = require('../utils/handleErorr');

const { ROLE } = require('../constants/roles');

/**
 * Verifiy user rol
 * @param {Array} rol User rol array
 * @returns next
 */
const checkRol = (roles, codename) => async(req, res, next) => {
  try {
    const { user } = req;
    const rolesByUser = user.role;

    // Verifica el rol del usuario con el rol pedido en la ruta
    const checkValueRol = roles.some((rolSingle) => rolesByUser.includes(rolSingle));

    if (!checkValueRol) {
      handleForbidden(res, 'ERROR_NOT_PERMISSION');
      return;
    }

    if (user.role !== ROLE.SUPERADMIN) {
      const privilege = await getOneUserPrivilege(user.id, codename);

      if (!privilege) {
        handleForbidden(res, 'NOT_PRIVILEGE');
        return;
      }
    }

    next();
  } catch (error) {
    handleForbidden(res, 'ERROR_NOT_PERMISSION');
  }
};

module.exports = checkRol;
