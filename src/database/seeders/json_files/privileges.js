const fecha = new Date();
const {
  BRANCH: BR, EMPlOYEE: EMP, PRIVILEGE: PRV, USERS: USR, MUNICIPALITIES: MUN, CAMPAIGN: CMP, CAMPAIGN_PRODUCT: CMPPROD,
  CUSTOMER: CUST, CUSTOMER_ADDRESS: CUSTADDR, PRODUCT_CATEGORY: CATP, USER_BRANCH: UBR, PRODUCT: PRD, POSITION: POS, PRICE_LIST: PL,
  PRODUCT_PRICE: PP, PURCHASE: PURCH
} = require('../../../constants/modules');

const data = [
  // Estados
  { name: 'Ver todos los estados', codeName: 'view_all_states', module: 'states', created_at: fecha, updated_at: fecha },

  // Municipios
  { name: MUN.NAME_VIEW, codeName: MUN.VIEW_ALL, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: MUN.NAME_VIEW_STATE, codeName: MUN.NAME_VIEW_STATE, module: MUN.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Sucursales
  { name: BR.NAME_ADD, codeName: BR.ADD, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_ALL, codeName: BR.VIEW_ALL, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_UPDATE, codeName: BR.UPDATE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: BR.NAME_DELETE, codeName: BR.DELETE, module: BR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // proveedores
  { name: 'Ver proveedores', codeName: 'view_suppliers', module: 'suppliers', created_at: fecha, updated_at: fecha },
  { name: 'Ver proveedores', codeName: 'view_suppliers', module: 'suppliers', created_at: fecha, updated_at: fecha },
  { name: 'Ver proveedores', codeName: 'view_suppliers', module: 'suppliers', created_at: fecha, updated_at: fecha },
  { name: 'Ver proveedores', codeName: 'view_suppliers', module: 'suppliers', created_at: fecha, updated_at: fecha },

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

  // Puestos de trabajo
  { name: POS.NAME_ALL, codeName: POS.VIEW_ALL, module: POS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: POS.NAME_ADD, codeName: POS.ADD, module: POS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: POS.NAME_UPDATE, codeName: POS.UPDATE, module: POS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: POS.NAME_DELETE, codeName: POS.DELETE, module: POS.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Categorias de producto
  { name: CATP.NAME_ALL, codeName: CATP.VIEW_ALL, module: CATP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CATP.NAME_ADD, codeName: CATP.ADD, module: CATP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CATP.NAME_UPDATE, codeName: CATP.UPDATE, module: CATP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CATP.NAME_DELETE, codeName: CATP.DELETE, module: CATP.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Producto
  { name: PRD.NAME_ALL, codeName: PRD.VIEW_ALL, module: PRD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRD.NAME_ADD, codeName: PRD.ADD, module: PRD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRD.NAME_UPDATE, codeName: PRD.UPDATE, module: PRD.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PRD.NAME_DELETE, codeName: PRD.DELETE, module: PRD.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Price list
  { name: PL.NAME_ALL, codeName: PL.VIEW_ALL, module: PL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PL.NAME_ADD, codeName: PL.ADD, module: PL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PL.NAME_UPDATE, codeName: PL.UPDATE, module: PL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PL.NAME_DELETE, codeName: PL.DELETE, module: PL.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Product Price
  { name: PP.NAME_ALL, codeName: PP.VIEW_ALL, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_NAME_VIEW_BY_PRODUCT, codeName: PP.VIEW_BY_PRODUCT, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_NAME_VIEW_BY_PRICE_LIST, codeName: PP.VIEW_BY_PRICE_LIST, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_ADD, codeName: PP.ADD, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_UPDATE, codeName: PP.UPDATE, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_DELETE, codeName: PP.DELETE, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_GENERATE_BY_PRODUCT, codeName: PP.GENERATE_BY_PRODUCT, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_GENERATE_BY_PRICE_LIST, codeName: PP.GENERATE_BY_PRICE_LIST, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_GENERATE_ALL, codeName: PP.GENERATE_ALL, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },

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
  { name: CMPPROD.NAME_MANAGE_OVERRIDES, codeName: CMPPROD.MANAGE_OVERRIDES, module: CMPPROD.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Sucursales de usuario
  { name: UBR.NAME_ALL, codeName: UBR.VIEW_ALL, module: UBR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: UBR.NAME_ADD, codeName: UBR.ADD, module: UBR.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: UBR.NAME_DELETE, codeName: UBR.DELETE, module: UBR.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Compras
  { name: PURCH.NAME_ALL, codeName: PURCH.VIEW_ALL, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PURCH.NAME_ADD, codeName: PURCH.ADD, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PURCH.NAME_UPDATE, codeName: PURCH.UPDATE, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PURCH.NAME_CANCEL, codeName: PURCH.CANCEL, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PURCH.NAME_DELETE, codeName: PURCH.DELETE, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PURCH.NAME_RECEIVE, codeName: PURCH.RECEIVE, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

module.exports = { data };
