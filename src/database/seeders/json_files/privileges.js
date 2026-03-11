const fecha = new Date();
const {
  BRANCH: BR, EMPlOYEE: EMP, PRIVILEGE: PRV, USERS: USR, MUNICIPALITIES: MUN, CAMPAIGN: CMP, CAMPAIGN_PRODUCT: CMPPROD,
  CUSTOMER: CUST, CUSTOMER_ADDRESS: CUSTADDR, PRODUCT_CATEGORY: CATP, USER_BRANCH: UBR, PRODUCT: PRD, POSITION: POS, PRICE_LIST: PL,
  PRODUCT_PRICE: PP, PURCHASE: PURCH, PRODUCT_STOCK: PS, SUPPLIER: SUP, PURCH_PAYMENT: PP_PAY, TRANSFER: TRANSF,
  SALE: SL, SALE_PAYMENT: SL_PAY, SALE_DELIVERY: SL_DEL, DRIVER: DRV, DASHBOARD: DASH
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

  // Proveedores
  { name: SUP.NAME_ALL, codeName: SUP.VIEW_ALL, module: SUP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SUP.NAME_ADD, codeName: SUP.ADD, module: SUP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SUP.NAME_UPDATE, codeName: SUP.UPDATE, module: SUP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SUP.NAME_DELETE, codeName: SUP.DELETE, module: SUP.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Empleados
  { name: EMP.NAME_ALL, codeName: EMP.VIEW_ALL, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_UPDATE, codeName: EMP.UPDATE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_ADD, codeName: EMP.ADD, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_DELETE, codeName: EMP.DELETE, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_GRANT_ACCESS, codeName: EMP.GRANT_ACCESS, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMP.NAME_REVOKE_ACCESS, codeName: EMP.REVOKE_ACCESS, module: EMP.MODULE_NAME, created_at: fecha, updated_at: fecha },

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
  { name: PP.NAME_VIEW_BY_PRODUCT, codeName: PP.VIEW_BY_PRODUCT, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP.NAME_VIEW_BY_PRICE_LIST, codeName: PP.VIEW_BY_PRICE_LIST, module: PP.MODULE_NAME, created_at: fecha, updated_at: fecha },
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
  { name: PURCH.NAME_RECEIVE, codeName: PURCH.RECEIVE, module: PURCH.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Inventario de Productos
  { name: PS.NAME_ALL, codeName: PS.VIEW_ALL, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PS.NAME_VIEW_BY_PRODUCT, codeName: PS.VIEW_BY_PRODUCT, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PS.NAME_VIEW_BY_BRANCH, codeName: PS.VIEW_BY_BRANCH, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PS.NAME_ADD, codeName: PS.ADD, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PS.NAME_UPDATE, codeName: PS.UPDATE, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PS.NAME_DELETE, codeName: PS.DELETE, module: PS.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Pagos de Compra
  { name: PP_PAY.NAME_ALL, codeName: PP_PAY.VIEW_ALL, module: PP_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP_PAY.NAME_ADD, codeName: PP_PAY.ADD, module: PP_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PP_PAY.NAME_DELETE, codeName: PP_PAY.DELETE, module: PP_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Transferencias
  { name: TRANSF.NAME_ALL, codeName: TRANSF.VIEW_ALL, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TRANSF.NAME_ADD, codeName: TRANSF.ADD, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TRANSF.NAME_UPDATE, codeName: TRANSF.UPDATE, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TRANSF.NAME_DISPATCH, codeName: TRANSF.DISPATCH, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TRANSF.NAME_RECEIVE, codeName: TRANSF.RECEIVE, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TRANSF.NAME_DELETE, codeName: TRANSF.DELETE, module: TRANSF.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Ventas
  { name: SL.NAME_ALL, codeName: SL.VIEW_ALL, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL.NAME_ADD, codeName: SL.ADD, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL.NAME_UPDATE, codeName: SL.UPDATE, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL.NAME_CANCEL, codeName: SL.CANCEL, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL.NAME_DELETE, codeName: SL.DELETE, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL.NAME_VIEW_OVERDUE, codeName: SL.VIEW_OVERDUE, module: SL.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Cobros de Venta
  { name: SL_PAY.NAME_ALL, codeName: SL_PAY.VIEW_ALL, module: SL_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL_PAY.NAME_ADD, codeName: SL_PAY.ADD, module: SL_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL_PAY.NAME_DELETE, codeName: SL_PAY.DELETE, module: SL_PAY.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Entregas de Venta
  { name: SL_DEL.NAME_ALL, codeName: SL_DEL.VIEW_ALL, module: SL_DEL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL_DEL.NAME_ADD, codeName: SL_DEL.ADD, module: SL_DEL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL_DEL.NAME_UPDATE, codeName: SL_DEL.UPDATE, module: SL_DEL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SL_DEL.NAME_DELETE, codeName: SL_DEL.DELETE, module: SL_DEL.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Repartidor
  { name: DRV.NAME_VIEW_DELIVERIES, codeName: DRV.VIEW_DELIVERIES, module: DRV.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: DRV.NAME_UPDATE_DELIVERY, codeName: DRV.UPDATE_DELIVERY, module: DRV.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Dashboard
  { name: DASH.NAME_VIEW, codeName: DASH.VIEW, module: DASH.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

module.exports = { data };
