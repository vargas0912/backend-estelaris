/**
 * Función para seleccionar solo campos permitidos de un objeto
 * @param {Object} obj - Objeto con todos los campos
 * @param {Array<string>} keys - Array de claves permitidas
 * @returns {Object} - Objeto con solo las claves permitidas
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Campos que un usuario normal puede actualizar en su propio perfil
 */
const USER_UPDATABLE_FIELDS = ['name', 'email'];

/**
 * Campos que un admin/superadmin puede actualizar en usuarios
 * Incluye 'role' para permitir cambios de rol
 */
const USER_ADMIN_UPDATABLE_FIELDS = ['name', 'email', 'role'];

module.exports = {
  pick,
  USER_UPDATABLE_FIELDS,
  USER_ADMIN_UPDATABLE_FIELDS
};
