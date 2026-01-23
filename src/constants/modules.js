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

const PRIVILEGE = Object.freeze({
  MODULE_NAME: 'privileges',
  VIEW: 'view_privilege',
  NAME_VIEW: 'Ver privilegio',
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
  VIEW: 'view_user',
  NAME_VIEW: 'Ver usuario',
  VIEW_ALL: 'view_users',
  NAME_ALL: 'Ver usuarios',
  ADD: 'register_user',
  NAME_ADD: 'Registrar usuarios',
  UPDATE: 'update_user',
  NAME_UPDATE: 'Modificar usuarios',
  DELETE: 'delete_user',
  NAME_DELETE: 'Eliminar usuarios'
});

const MUNICIPALITIES = Object.freeze({
  MODULE_NAME: 'municipalities',
  VIEW: 'view_municipality',
  NAME_VIEW: 'Ver municipio',
  VIEW_STATE: 'view_state',
  NAME_VIEW_STATE: 'Ver municipios por estado'
});

const POSITION = Object.freeze({
  MODULE_NAME: 'positions',
  VIEW: 'view_position',
  NAME_VIEW: 'Ver puesto',
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
  MODULE_NAME: 'productCategories',
  VIEW: 'view_product_category',
  NAME_VIEW: 'Ver categoría de producto',
  VIEW_ALL: 'view_product_categories',
  NAME_ALL: 'Ver categorías de productos',
  ADD: 'create_product_category',
  NAME_ADD: 'Crear categoría de producto',
  UPDATE: 'update_product_category',
  NAME_UPDATE: 'Modificar categoría de producto',
  DELETE: 'delete_product_category',
  NAME_DELETE: 'Eliminar categoría de producto'
});

const PRODUCT = Object.freeze({
  MODULE_NAME: 'products',
  VIEW: 'view_product',
  NAME_VIEW: 'Ver producto',
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
  VIEW: 'view_product_stock',
  NAME_VIEW: 'Ver inventario de producto',
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
  VIEW: 'view_price_list',
  NAME_VIEW: 'Ver lista de precios',
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
  VIEW: 'view_product_price',
  NAME_VIEW: 'Ver precio de producto',
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

module.exports = { BRANCH, EMPlOYEE, PRIVILEGE, USERS, MUNICIPALITIES, POSITION, PRODUCT_CATEGORY, PRODUCT, PRODUCT_STOCK, PRICE_LIST, PRODUCT_PRICE };
