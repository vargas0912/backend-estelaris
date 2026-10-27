// Catalog of every deliberate 403 response: stable `code` + user-facing message (es-MX).
const FORBIDDEN = Object.freeze({
  ERROR_NOT_PERMISSION: 'No tienes permiso para realizar esta acción.',
  NOT_PRIVILEGE: 'No cuentas con el privilegio necesario para realizar esta acción. Contacta al administrador.',
  BRANCH_ACCESS_DENIED: 'No tienes acceso a la sucursal seleccionada.',
  EMPLOYEE_SCOPE_NO_EMPLOYEE: 'Tu usuario no tiene un empleado asociado. Contacta al administrador.',
  DATE_GUARD_CONFLICT: 'Se detectó un conflicto entre la fecha de tu equipo y la fecha del sistema. El administrador del sistema será notificado.',
  FORBIDDEN_ROLE_HIERARCHY: 'No tienes permiso para modificar usuarios con ese rol.',
  FORBIDDEN_CANNOT_CREATE_SUPERADMIN: 'Solo un superadmin puede crear o asignar el rol de superadmin.',
  FORBIDDEN_CANNOT_MODIFY_SUPERADMIN_PRIVILEGES: 'Solo un superadmin puede modificar los privilegios de un superadmin.',
  FORBIDDEN_CANNOT_RESET_SUPERADMIN: 'No es posible restablecer la contraseña de un superadmin.',
  APIKEY_INCORRECT: 'No se pudo validar el acceso a la API. Verifica tu configuración.',
  CUSTOMHEADER_FAIL: 'No se pudo validar el acceso a la API. Intenta de nuevo.'
});

module.exports = { FORBIDDEN };
