const fecha = new Date();
const { BRANCH: BR, EMPlOYEE: EMP, PRIVILEGE: PRV, USERS: USR, MUNICIPALITIES: MUN } = require('../../../constants/modules');

const data = [
  // Sucursales
  { name: BR.NAME_ADD, codeName: BR.ADD, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_VIEW, codeName: BR.VIEW, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_ALL, codeName: BR.VIEW_ALL, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_UPDATE, codeName: BR.UPDATE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_DELETE, codeName: BR.DELETE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Empleados
  { name: EMP.NAME_VIEW, codeName: EMP.VIEW, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_ALL, codeName: EMP.VIEW_ALL, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_UPDATE, codeName: EMP.UPDATE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_ADD, codeName: EMP.ADD, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_DELETE, codeName: EMP.DELETE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Privilegios
  { name: PRV.NAME_VIEW, codeName: PRV.VIEW, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_ADD, codeName: PRV.ADD, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_UPDATE, codeName: PRV.UPDATE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_DELETE, codeName: PRV.DELETE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_USER_PRIVILEGE, codeName: PRV.VIEW_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_ADD_USER_PRIVILEGE, codeName: PRV.ADD_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_DEL_USER_PRIVILEGE, codeName: PRV.DEL_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_VIEW_MODULE, codeName: PRV.VIEW_MODULE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Usuarios
  { name: USR.NAME_ALL, codeName: USR.VIEW_ALL, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_VIEW, codeName: USR.VIEW, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_UPDATE, codeName: USR.UPDATE, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_DELETE, codeName: USR.DELETE, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_ADD, codeName: USR.ADD, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Categorias de producto
  { name: 'Ver categoria', codeName: 'view_category', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Ver categorias', codeName: 'view_categories', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Crear categoria', codeName: 'create_category', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Editar categoria', codeName: 'update_category', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Eliminar categoria', codeName: 'delete_category', module: 'categories', created_at: fecha, updated_at: fecha },

  // Clientes
  { name: 'Ver clientes', codeName: 'view_customers', module: 'customers', created_at: fecha, updated_at: fecha },
  { name: 'Ver cliente', codeName: 'view_customer', module: 'customers', created_at: fecha, updated_at: fecha },
  { name: 'Crear clientes', codeName: 'create_customer', module: 'customers', created_at: fecha, updated_at: fecha },
  { name: 'Actualizar clientes', codeName: 'update_customer', module: 'customers', created_at: fecha, updated_at: fecha },
  { name: 'Eliminar clientes', codeName: 'delete_customer', module: 'customers', created_at: fecha, updated_at: fecha },

  // Municipios
  { name: MUN.NAME_VIEW, codeName: MUN.VIEW, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: MUN.NAME_VIEW_STATE, codeName: MUN.NAME_VIEW_STATE, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

module.exports = { data };
