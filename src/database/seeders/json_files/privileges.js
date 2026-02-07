const fecha = new Date();
const { BRANCH: BR, EMPlOYEE: EMP, PRIVILEGE: PRV, USERS: USR, MUNICIPALITIES: MUN, CAMPAIGN: CMP, CAMPAIGN_PRODUCT: CMPPROD, CUSTOMER: CUST, CUSTOMER_ADDRESS: CUSTADDR } = require('../../../constants/modules');

const data = [
  // Sucursales
  { name: BR.NAME_ADD, codeName: BR.ADD, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_ALL, codeName: BR.VIEW_ALL, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_UPDATE, codeName: BR.UPDATE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_DELETE, codeName: BR.DELETE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Empleados
  { name: EMP.NAME_ALL, codeName: EMP.VIEW_ALL, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_UPDATE, codeName: EMP.UPDATE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_ADD, codeName: EMP.ADD, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_DELETE, codeName: EMP.DELETE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Privilegios
  { name: PRV.NAME_ADD, codeName: PRV.ADD, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_UPDATE, codeName: PRV.UPDATE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_DELETE, codeName: PRV.DELETE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_USER_PRIVILEGE, codeName: PRV.VIEW_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_ADD_USER_PRIVILEGE, codeName: PRV.ADD_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_DEL_USER_PRIVILEGE, codeName: PRV.DEL_USER_PRIVILEGE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRV.NAME_VIEW_MODULE, codeName: PRV.VIEW_MODULE, module: PRV.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Usuarios
  { name: USR.NAME_ALL, codeName: USR.VIEW_ALL, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_UPDATE, codeName: USR.UPDATE, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_DELETE, codeName: USR.DELETE, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_ADD, codeName: USR.ADD, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: USR.NAME_CREATE_SUPERADMIN, codeName: USR.CREATE_SUPERADMIN, module: USR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Categorias de producto
  { name: 'Ver categorias', codeName: 'view_categories', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Crear categoria', codeName: 'create_category', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Editar categoria', codeName: 'update_category', module: 'categories', created_at: fecha, updated_at: fecha },
  { name: 'Eliminar categoria', codeName: 'delete_category', module: 'categories', created_at: fecha, updated_at: fecha },

  // Clientes
  { name: CUST.NAME_ALL, codeName: CUST.VIEW_ALL, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_VIEW_BY_BRANCH, codeName: CUST.VIEW_BY_BRANCH, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_VIEW_BY_MUNICIPALITY, codeName: CUST.VIEW_BY_MUNICIPALITY, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_ADD, codeName: CUST.ADD, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_UPDATE, codeName: CUST.UPDATE, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_DELETE, codeName: CUST.DELETE, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUST.NAME_ACTIVATE_PORTAL, codeName: CUST.ACTIVATE_PORTAL, module: CUST.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Direcciones de Clientes
  { name: CUSTADDR.NAME_ALL, codeName: CUSTADDR.VIEW_ALL, module: CUSTADDR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUSTADDR.NAME_ADD, codeName: CUSTADDR.ADD, module: CUSTADDR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUSTADDR.NAME_UPDATE, codeName: CUSTADDR.UPDATE, module: CUSTADDR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CUSTADDR.NAME_DELETE, codeName: CUSTADDR.DELETE, module: CUSTADDR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Municipios
  { name: MUN.NAME_VIEW, codeName: MUN.VIEW, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: MUN.NAME_VIEW_STATE, codeName: MUN.NAME_VIEW_STATE, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Estados
  { name: 'Ver todos los estados', codeName: 'view_all_states', module: 'states', created_at: fecha, updated_at: fecha },

  // Campañas
  { name: CMP.NAME_ALL, codeName: CMP.VIEW_ALL, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_VIEW_ACTIVE, codeName: CMP.VIEW_ACTIVE, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_ADD, codeName: CMP.ADD, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_UPDATE, codeName: CMP.UPDATE, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_DELETE, codeName: CMP.DELETE, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_ACTIVATE, codeName: CMP.ACTIVATE, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_DEACTIVATE, codeName: CMP.DEACTIVATE, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMP.NAME_MANAGE_BRANCHES, codeName: CMP.MANAGE_BRANCHES, module: CMP.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Productos de Campañas
  { name: CMPPROD.NAME_ALL, codeName: CMPPROD.VIEW_ALL, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMPPROD.NAME_ADD, codeName: CMPPROD.ADD, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMPPROD.NAME_UPDATE, codeName: CMPPROD.UPDATE, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMPPROD.NAME_DELETE, codeName: CMPPROD.DELETE, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CMPPROD.NAME_MANAGE_OVERRIDES, codeName: CMPPROD.MANAGE_OVERRIDES, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

module.exports = { data };
