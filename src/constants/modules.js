const BRANCH = Object.freeze({
  MODULE_NAME: 'branches',
  VIEW: 'view_branch',
  NAME_VIEW: 'Ver sucursal',
  VIEW_ALL: 'view_branches',
  NAME_ALL: 'Ver sucursales',
  ADD: 'create_branch',
  NAME_ADD: 'Crear sucursal',
  UPDATE: 'update_branch',
  NAME_UPDATE: 'Modificar sucursales',
  DELETE: 'delete_branch',
  NAME_DELETE: 'Eliminar sucursales'
});

const EMPlOYEE = Object.freeze({
  MODULE_NAME: 'employees',
  VIEW: 'view_employee',
  NAME_VIEW: 'Ver empleado',
  VIEW_ALL: 'view_employees',
  NAME_ALL: 'Ver empleados',
  ADD: 'create_employee',
  NAME_ADD: 'Crear empleados',
  UPDATE: 'update_employee',
  NAME_UPDATE: 'Modificar empleados',
  DELETE: 'delete_employee',
  NAME_DELETE: 'Eliminar empleados'
});

module.exports = { BRANCH, EMPlOYEE };
