const BRANCH = Object.freeze({
  MODULE_NAME: 'branches',
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
  VIEW_ALL: 'view_employees',
  NAME_ALL: 'Ver empleados',
  ADD: 'create_employee',
  NAME_ADD: 'Crear empleados',
  UPDATE: 'update_employee',
  NAME_UPDATE: 'Modificar empleados',
  DELETE: 'delete_employee',
  NAME_DELETE: 'Eliminar empleados'
});

const PRIVILEGE = Object.freeze({
  MODULE_NAME: 'privileges',
  ADD: 'create_privilege',
  NAME_ADD: 'Crear privilegio',
  UPDATE: 'update_privilege',
  NAME_UPDATE: 'Actualizar privilegio',
  DELETE: 'delete_privilege',
  NAME_DELETE: 'Eliminar privilegio',
  VIEW_USER_PRIVILEGE: 'view_user_privilege',
  NAME_USER_PRIVILEGE: 'Ver usuario - privilegio',
  ADD_USER_PRIVILEGE: 'create_user_privilege',
  NAME_ADD_USER_PRIVILEGE: 'Crear usuario - privilegio',
  DEL_USER_PRIVILEGE: 'delete_user_privilege',
  NAME_DEL_USER_PRIVILEGE: 'Eliminar usuario - privilegio',
  VIEW_MODULE: 'view_module',
  NAME_VIEW_MODULE: 'Ver privilegios por modulo'
});

const USERS = Object.freeze({
  MODULE_NAME: 'users',
  VIEW_ALL: 'view_users',
  NAME_ALL: 'Ver usuarios',
  ADD: 'register_user',
  NAME_ADD: 'Registrar usuarios',
  CREATE_SUPERADMIN: 'create_superadmin',
  NAME_CREATE_SUPERADMIN: 'Crear superadmin',
  UPDATE: 'update_user',
  NAME_UPDATE: 'Modificar usuarios',
  DELETE: 'delete_user',
  NAME_DELETE: 'Eliminar usuarios'
});

const MUNICIPALITIES = Object.freeze({
  MODULE_NAME: 'municipalities',
  VIEW_ALL: 'view_municipality',
  NAME_VIEW: 'Ver municipios',
  VIEW_STATE: 'view_state',
  NAME_VIEW_STATE: 'Ver municipios por estado'
});

const POSITION = Object.freeze({
  MODULE_NAME: 'positions',
  VIEW_ALL: 'view_positions',
  NAME_ALL: 'Ver puestos',
  ADD: 'create_position',
  NAME_ADD: 'Crear puesto',
  UPDATE: 'update_position',
  NAME_UPDATE: 'Modificar puesto',
  DELETE: 'delete_position',
  NAME_DELETE: 'Eliminar puesto'
});

const PRODUCT_CATEGORY = Object.freeze({
  MODULE_NAME: 'categories',
  VIEW_ALL: 'view_categories',
  NAME_ALL: 'Ver categorías de productos',
  ADD: 'create_category',
  NAME_ADD: 'Crear categoría de producto',
  UPDATE: 'update_category',
  NAME_UPDATE: 'Modificar categoría de producto',
  DELETE: 'delete_category',
  NAME_DELETE: 'Eliminar categoría de producto'
});

const PRODUCT = Object.freeze({
  MODULE_NAME: 'products',
  VIEW_ALL: 'view_products',
  NAME_ALL: 'Ver productos',
  ADD: 'create_product',
  NAME_ADD: 'Crear producto',
  UPDATE: 'update_product',
  NAME_UPDATE: 'Modificar producto',
  DELETE: 'delete_product',
  NAME_DELETE: 'Eliminar producto'
});

const PRODUCT_STOCK = Object.freeze({
  MODULE_NAME: 'productStocks',
  VIEW_ALL: 'view_product_stocks',
  NAME_ALL: 'Ver inventarios de productos',
  VIEW_BY_PRODUCT: 'view_stocks_by_product',
  NAME_VIEW_BY_PRODUCT: 'Ver inventario por producto',
  VIEW_BY_BRANCH: 'view_stocks_by_branch',
  NAME_VIEW_BY_BRANCH: 'Ver inventario por sucursal',
  ADD: 'create_product_stock',
  NAME_ADD: 'Crear inventario de producto',
  UPDATE: 'update_product_stock',
  NAME_UPDATE: 'Modificar inventario de producto',
  DELETE: 'delete_product_stock',
  NAME_DELETE: 'Eliminar inventario de producto'
});

const PRICE_LIST = Object.freeze({
  MODULE_NAME: 'priceLists',
  VIEW_ALL: 'view_price_lists',
  NAME_ALL: 'Ver listas de precios',
  ADD: 'create_price_list',
  NAME_ADD: 'Crear lista de precios',
  UPDATE: 'update_price_list',
  NAME_UPDATE: 'Modificar lista de precios',
  DELETE: 'delete_price_list',
  NAME_DELETE: 'Eliminar lista de precios'
});

const PRODUCT_PRICE = Object.freeze({
  MODULE_NAME: 'productPrices',
  VIEW_ALL: 'view_product_prices',
  NAME_ALL: 'Ver precios de productos',
  VIEW_BY_PRODUCT: 'view_prices_by_product',
  NAME_VIEW_BY_PRODUCT: 'Ver precios por producto',
  VIEW_BY_PRICE_LIST: 'view_prices_by_price_list',
  NAME_VIEW_BY_PRICE_LIST: 'Ver precios por lista',
  ADD: 'create_product_price',
  NAME_ADD: 'Crear precio de producto',
  UPDATE: 'update_product_price',
  NAME_UPDATE: 'Modificar precio de producto',
  DELETE: 'delete_product_price',
  NAME_DELETE: 'Eliminar precio de producto'
});

const SUPPLIER = Object.freeze({
  MODULE_NAME: 'suppliers',
  VIEW_ALL: 'view_suppliers',
  NAME_ALL: 'Ver proveedores',
  ADD: 'create_supplier',
  NAME_ADD: 'Crear proveedor',
  UPDATE: 'update_supplier',
  NAME_UPDATE: 'Modificar proveedor',
  DELETE: 'delete_supplier',
  NAME_DELETE: 'Eliminar proveedor'
});

const CAMPAIGN = Object.freeze({
  MODULE_NAME: 'campaigns',
  VIEW_ALL: 'view_campaigns',
  NAME_ALL: 'Ver campañas',
  VIEW_ACTIVE: 'view_active_campaigns',
  NAME_VIEW_ACTIVE: 'Ver campañas activas',
  ADD: 'create_campaign',
  NAME_ADD: 'Crear campaña',
  UPDATE: 'update_campaign',
  NAME_UPDATE: 'Modificar campaña',
  DELETE: 'delete_campaign',
  NAME_DELETE: 'Eliminar campaña',
  ACTIVATE: 'activate_campaign',
  NAME_ACTIVATE: 'Activar campaña',
  DEACTIVATE: 'deactivate_campaign',
  NAME_DEACTIVATE: 'Desactivar campaña',
  MANAGE_BRANCHES: 'manage_campaign_branches',
  NAME_MANAGE_BRANCHES: 'Gestionar sucursales de campaña'
});

const CAMPAIGN_PRODUCT = Object.freeze({
  MODULE_NAME: 'campaignProducts',
  VIEW_ALL: 'view_campaign_products',
  NAME_ALL: 'Ver productos de campaña',
  ADD: 'create_campaign_product',
  NAME_ADD: 'Agregar producto a campaña',
  UPDATE: 'update_campaign_product',
  NAME_UPDATE: 'Modificar producto de campaña',
  DELETE: 'delete_campaign_product',
  NAME_DELETE: 'Eliminar producto de campaña',
  MANAGE_OVERRIDES: 'manage_campaign_product_overrides',
  NAME_MANAGE_OVERRIDES: 'Gestionar overrides de producto'
});

const STATES = Object.freeze({
  MODULE_NAME: 'states',
  VIEW_ALL: 'view_all_states',
  NAME_ALL: 'Ver todos los estados'
});

const CUSTOMER = Object.freeze({
  MODULE_NAME: 'customers',
  VIEW_ALL: 'view_customers',
  NAME_ALL: 'Ver clientes',
  VIEW_BY_BRANCH: 'view_customers_by_branch',
  NAME_VIEW_BY_BRANCH: 'Ver clientes por sucursal',
  VIEW_BY_MUNICIPALITY: 'view_customers_by_municipality',
  NAME_VIEW_BY_MUNICIPALITY: 'Ver clientes por municipio',
  ADD: 'create_customer',
  NAME_ADD: 'Crear cliente',
  UPDATE: 'update_customer',
  NAME_UPDATE: 'Modificar cliente',
  DELETE: 'delete_customer',
  NAME_DELETE: 'Eliminar cliente',
  ACTIVATE_PORTAL: 'activate_customer_portal',
  NAME_ACTIVATE_PORTAL: 'Activar portal de cliente'
});

const CUSTOMER_ADDRESS = Object.freeze({
  MODULE_NAME: 'customerAddresses',
  VIEW_ALL: 'view_customer_addresses',
  NAME_ALL: 'Ver direcciones de cliente',
  ADD: 'create_customer_address',
  NAME_ADD: 'Crear dirección',
  UPDATE: 'update_customer_address',
  NAME_UPDATE: 'Modificar dirección',
  DELETE: 'delete_customer_address',
  NAME_DELETE: 'Eliminar dirección'
});

const USER_BRANCH = Object.freeze({
  MODULE_NAME: 'userBranches',
  VIEW_ALL: 'view_user_branches',
  NAME_ALL: 'Ver sucursales de usuario',
  ADD: 'create_user_branch',
  NAME_ADD: 'Asignar sucursal a usuario',
  DELETE: 'delete_user_branch',
  NAME_DELETE: 'Remover sucursal de usuario'
});

module.exports = { BRANCH, EMPlOYEE, PRIVILEGE, USERS, MUNICIPALITIES, POSITION, PRODUCT_CATEGORY, PRODUCT, PRODUCT_STOCK, PRICE_LIST, PRODUCT_PRICE, SUPPLIER, CAMPAIGN, CAMPAIGN_PRODUCT, STATES, CUSTOMER, CUSTOMER_ADDRESS, USER_BRANCH };
