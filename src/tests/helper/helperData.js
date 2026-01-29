const privilege = {
  name: 'name test',
  codename: 'codename',
  module: 'module test'
};

const positionCreate = {
  name: 'Puesto de prueba'
};

const positionCreateEmpty = {
  name: ''
};

const positionCreateInvalid = {};

const positionUpdate = {
  name: 'Puesto modificado'
};

// Datos de prueba para branches
const branchCreate = {
  name: 'Sucursal de prueba',
  address: 'Calle Test 123',
  phone: '5551234567',
  municipality_id: 1
};

const branchCreateEmpty = {
  name: '',
  address: '',
  phone: ''
};

const branchCreateInvalid = {};

const branchUpdate = {
  name: 'Sucursal modificada',
  address: 'Calle Modificada 456',
  phone: '5559876543',
  municipality_id: 1
};

const branchCreateNoAddress = {
  name: 'Sucursal sin direccion',
  phone: '5551111111',
  municipality_id: 1
};

const branchCreateNoMunicipality = {
  name: 'Sucursal sin municipio',
  address: 'Calle Sin Municipio 789',
  phone: '5552222222'
};

const branchUpdateEmpty = {
  name: '',
  address: '',
  municipality_id: ''
};

const branchUpdatePartial = {
  name: 'Solo nombre actualizado'
};

const branchCreate2 = {
  name: 'Segunda sucursal de prueba',
  address: 'Avenida Segunda 456',
  phone: '5553333333',
  municipality_id: 1
};

// Datos para tests de productCategories
const productCategoryCreate = {
  name: 'Categoría de prueba',
  description: 'Descripción de la categoría de prueba'
};

const productCategoryCreateEmpty = {
  name: ''
};

const productCategoryCreateInvalid = {};

const productCategoryUpdate = {
  name: 'Categoría modificada',
  description: 'Descripción modificada'
};

const productCategoryCreate2 = {
  name: 'Segunda categoría de prueba',
  description: 'Segunda descripción'
};

// Datos de prueba para products
const productCreate = {
  sku: 'SKU-TEST-001',
  name: 'Producto de prueba',
  description: 'Descripción del producto de prueba',
  short_description: 'Desc corta',
  unit_of_measure: 'piece',
  cost_price: 50.00,
  base_price: 100.00,
  is_active: true,
  is_featured: false
};

const productCreateEmpty = {
  sku: '',
  name: '',
  base_price: ''
};

const productCreateInvalid = {};

const productUpdate = {
  sku: 'SKU-TEST-001-UPD',
  name: 'Producto modificado',
  description: 'Descripción modificada',
  base_price: 150.00
};

const productCreate2 = {
  sku: 'SKU-TEST-002',
  name: 'Segundo producto de prueba',
  description: 'Segunda descripción',
  base_price: 200.00
};

const productCreateFull = {
  sku: 'SKU-FULL-001',
  barcode: '7501234567890',
  name: 'Producto completo',
  description: 'Descripción completa del producto',
  short_description: 'Desc corta completa',
  category_id: 1,
  unit_of_measure: 'kg',
  cost_price: 75.50,
  base_price: 125.99,
  weight: 2.5,
  dimensions: { length: 30, width: 20, height: 10 },
  images: ['imagen1.jpg', 'imagen2.jpg'],
  is_active: true,
  is_featured: true,
  seo_title: 'Producto Completo - Comprar',
  seo_description: 'Descripción SEO del producto completo',
  seo_keywords: 'producto, completo, test'
};

const productCreateNoSku = {
  name: 'Producto sin SKU',
  base_price: 100.00
};

const productCreateNoName = {
  sku: 'SKU-NO-NAME',
  base_price: 100.00
};

const productCreateNoPrice = {
  sku: 'SKU-NO-PRICE',
  name: 'Producto sin precio'
};

// Datos de prueba para productStocks
const productStockCreate = {
  product_id: 2,
  branch_id: 2,
  quantity: 100,
  min_stock: 10,
  max_stock: 200,
  location: 'A-01-03'
};

const productStockCreateEmpty = {
  product_id: '',
  branch_id: ''
};

const productStockCreateInvalid = {};

const productStockUpdate = {
  quantity: 150,
  min_stock: 15,
  max_stock: 250,
  location: 'B-02-05'
};

const productStockCreate2 = {
  product_id: 3,
  branch_id: 2,
  quantity: 50,
  min_stock: 5,
  max_stock: 100
};

const productStockCreateFull = {
  product_id: 3,
  branch_id: 3,
  quantity: 75.5,
  min_stock: 10.25,
  max_stock: 150.75,
  location: 'C-03-07',
  last_count_date: '2026-01-23'
};

const productStockCreateNoProduct = {
  branch_id: 1,
  quantity: 100
};

const productStockCreateNoBranch = {
  product_id: 1,
  quantity: 100
};

// Datos de prueba para priceLists
const priceListCreate = {
  name: 'Lista de prueba',
  description: 'Descripción de la lista de prueba',
  discount_percent: 10,
  is_active: true,
  priority: 1
};

const priceListCreateEmpty = {
  name: ''
};

const priceListCreateInvalid = {};

const priceListUpdate = {
  name: 'Lista modificada',
  description: 'Descripción modificada',
  discount_percent: 15
};

const priceListCreate2 = {
  name: 'Segunda lista de prueba',
  description: 'Segunda descripción',
  discount_percent: 20,
  is_active: true,
  priority: 2
};

const priceListCreateFull = {
  name: 'Lista completa',
  description: 'Lista con todos los campos',
  discount_percent: 25,
  is_active: false,
  priority: 5
};

const priceListCreateNoName = {
  description: 'Lista sin nombre',
  discount_percent: 10
};

// Datos de prueba para productPrices
const productPriceCreate = {
  product_id: 3,
  price_list_id: 2,
  price: 100.00,
  min_quantity: 1
};

const productPriceCreateEmpty = {
  product_id: '',
  price_list_id: ''
};

const productPriceCreateInvalid = {};

const productPriceUpdate = {
  price: 150.00,
  min_quantity: 5
};

const productPriceCreate2 = {
  product_id: 3,
  price_list_id: 3,
  price: 90.00,
  min_quantity: 1
};

const productPriceCreateTiered = {
  product_id: 2,
  price_list_id: 2,
  price: 85.00,
  min_quantity: 1
};

const productPriceCreateNoProduct = {
  price_list_id: 1,
  price: 100.00
};

const productPriceCreateNoPriceList = {
  product_id: 1,
  price: 100.00
};

const productPriceCreateNoPrice = {
  product_id: 1,
  price_list_id: 1
};

// Datos de prueba para suppliers
const supplierCreate = {
  name: 'Proveedor de prueba S.A.',
  email: 'proveedor@test.com',
  phone: '8181234567'
};

const supplierCreateEmpty = {
  name: '',
  email: ''
};

const supplierCreateInvalid = {};

const supplierUpdate = {
  name: 'Proveedor modificado S.A.',
  email: 'modificado@test.com',
  credit_limit: 25000.00
};

const supplierCreate2 = {
  name: 'Segundo proveedor de prueba',
  email: 'proveedor2@test.com',
  phone: '8187654321'
};

const supplierCreateFull = {
  name: 'Proveedor Completo S.A. de C.V.',
  trade_name: 'Proveedor Completo',
  tax_id: 'PCO123456789',
  contact_name: 'Juan Pérez',
  email: 'juan@proveedor.com',
  phone: '8181234567',
  mobile: '8112345678',
  address: 'Av. Industrial 456',
  municipality_id: 1,
  postal_code: '64000',
  website: 'https://proveedor.com',
  payment_terms: '30 días',
  credit_limit: 50000.00,
  notes: 'Proveedor preferente',
  is_active: true
};

const supplierCreateNoName = {
  email: 'sinombre@test.com',
  phone: '8181111111'
};

const supplierCreateNoEmail = {
  name: 'Proveedor sin email',
  phone: '8182222222'
};

const supplierCreateInvalidEmail = {
  name: 'Proveedor email inválido',
  email: 'no-es-email',
  phone: '8183333333'
};

// Datos de prueba para users
const userUpdate = {
  name: 'Usuario actualizado',
  role: 'user'
};

const userUpdateWithRole = {
  name: 'Usuario con rol',
  role: 'admin'
};

// Datos de prueba para employees
const employeeCreate = {
  name: 'Empleado de prueba',
  email: 'empleado@test.com',
  phone: '8181234567',
  hire_date: '2026-01-15',
  position_id: 1,
  branch_id: 1,
  active: true
};

const employeeCreateEmpty = {
  name: '',
  email: ''
};

const employeeCreateInvalid = {};

const employeeUpdate = {
  name: 'Empleado modificado',
  email: 'empleado_mod@test.com',
  phone: '8189876543',
  hire_date: '2026-01-15',
  position_id: 1,
  branch_id: 1
};

const employeeCreate2 = {
  name: 'Segundo empleado de prueba',
  email: 'empleado2@test.com',
  phone: '8187654321',
  hire_date: '2026-01-20',
  position_id: 1,
  branch_id: 1,
  active: true
};

const employeeCreateFull = {
  name: 'Empleado Completo',
  email: 'completo@test.com',
  phone: '8181111111',
  mobile: '8112222222',
  hire_date: '2026-01-10',
  termination_date: null,
  position_id: 1,
  branch_id: 1,
  salary: 15000.00,
  emergency_contact_name: 'Juan Pérez',
  emergency_contact_phone: '8113333333',
  notes: 'Empleado de confianza',
  active: true
};

const employeeCreateNoName = {
  email: 'sinombre@test.com',
  position_id: 1,
  branch_id: 1
};

const employeeCreateNoEmail = {
  name: 'Empleado sin email',
  position_id: 1,
  branch_id: 1
};

const employeeCreateNoPosition = {
  name: 'Empleado sin puesto',
  email: 'sinpuesto@test.com',
  branch_id: 1
};

const employeeCreateNoBranch = {
  name: 'Empleado sin sucursal',
  email: 'sinsucursal@test.com',
  position_id: 1
};

// Datos de prueba para privileges
const privilegeCreate = {
  name: 'Crear Usuario',
  codename: 'create_user',
  module: 'users'
};

const privilegeCreateEmpty = {
  name: '',
  codename: '',
  module: ''
};

const privilegeCreateInvalid = {};

const privilegeUpdate = {
  name: 'Actualizar Usuario',
  codename: 'update_user',
  module: 'users'
};

const privilegeUpdateEmpty = {
  name: '',
  codename: '',
  module: ''
};

const privilegeCreateNoCodename = {
  name: 'Sin codename',
  module: 'test'
};

const privilegeCreateNoModule = {
  name: 'Sin modulo',
  codename: 'no_module'
};

const privilegeCreate2 = {
  name: 'Eliminar Usuario',
  codename: 'delete_user',
  module: 'users'
};

// Datos de prueba para user-privileges
const userPrivilegeCreate = {
  user_id: 1,
  privilege_id: 1
};

const userPrivilegeCreateEmpty = {
  user_id: '',
  privilege_id: ''
};

const userPrivilegeCreateInvalid = {};

const userPrivilegeCreateNoUser = {
  privilege_id: 1
};

const userPrivilegeCreateNoPrivilege = {
  user_id: 1
};

const testAuthLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const testAuthRegister = {
  name: 'User test',
  email: 'test1@test.com',
  password: 'Test1234',
  status: false,
  role: 'user'
};

const testAuthRegisterSuperAdmin = {
  name: 'Super admin',
  email: 'superadmin@estelaris.com',
  role: 'superadmin',
  password: 'Admin123'
};

const testAuthRegisterSuperAdminErr = {
  name: 'Super admin',
  email: 'superadmin@estelaris.com',
  role: 'user',
  password: 'Admin123'
};

const testAuthRegisterSuperAdminFail = {
  name: 'Super admin',
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const testAuthRegisterAdmin = {
  name: 'User admin',
  email: 'admin@estelaris.com',
  role: 'admin',
  password: 'Admin123'
};

const testStorageRegister = {
  url: 'http://localhost:3001/file-test.mp3',
  filename: 'file-test.mp3'
};

// Datos de prueba para campaigns
const campaignCreate = {
  name: 'Campaña de prueba',
  description: 'Descripción de la campaña de prueba',
  start_date: '2026-02-01T00:00:00.000Z',
  end_date: '2026-02-28T23:59:59.000Z',
  is_active: false,
  priority: 1
};

const campaignCreateEmpty = {
  name: '',
  start_date: '',
  end_date: ''
};

const campaignCreateInvalid = {};

const campaignUpdate = {
  name: 'Campaña modificada',
  description: 'Descripción modificada',
  priority: 2
};

const campaignCreate2 = {
  name: 'Segunda campaña de prueba',
  description: 'Segunda descripción',
  start_date: '2026-03-01T00:00:00.000Z',
  end_date: '2026-03-31T23:59:59.000Z',
  is_active: true,
  priority: 3
};

const campaignInvalidDates = {
  name: 'Campaña con fechas inválidas',
  description: 'end_date antes de start_date',
  start_date: '2026-02-28T00:00:00.000Z',
  end_date: '2026-02-01T00:00:00.000Z',
  is_active: false
};

// Datos de prueba para campaignProducts
const campaignProductCreate = {
  campaign_id: 1,
  product_id: 1,
  discount_type: 'percentage',
  discount_value: 15.0,
  max_quantity: 100
};

const campaignProductCreateEmpty = {
  campaign_id: '',
  product_id: '',
  discount_type: '',
  discount_value: ''
};

const campaignProductCreateInvalid = {};

const campaignProductUpdate = {
  discount_type: 'percentage',
  discount_value: 20.0,
  max_quantity: 150
};

const campaignProductCreate2 = {
  campaign_id: 1,
  product_id: 2,
  discount_type: 'fixed_price',
  discount_value: 99.99
};

const campaignProductInvalidDiscount = {
  campaign_id: 1,
  product_id: 1,
  discount_type: 'percentage',
  discount_value: 150
};

const campaignProductNegativeDiscount = {
  campaign_id: 1,
  product_id: 1,
  discount_type: 'percentage',
  discount_value: -10
};

module.exports = {
  testAuthRegister,
  testAuthLogin,
  testAuthRegisterAdmin,
  testAuthRegisterSuperAdmin,
  testAuthRegisterSuperAdminErr,
  testAuthRegisterSuperAdminFail,
  testStorageRegister,
  privilege,
  positionCreate,
  positionCreateEmpty,
  positionCreateInvalid,
  positionUpdate,
  branchCreate,
  branchCreateEmpty,
  branchCreateInvalid,
  branchUpdate,
  branchCreateNoAddress,
  branchCreateNoMunicipality,
  branchUpdateEmpty,
  branchUpdatePartial,
  branchCreate2,
  privilegeCreate,
  privilegeCreateEmpty,
  privilegeCreateInvalid,
  privilegeUpdate,
  privilegeUpdateEmpty,
  privilegeCreateNoCodename,
  privilegeCreateNoModule,
  privilegeCreate2,
  userPrivilegeCreate,
  userPrivilegeCreateEmpty,
  userPrivilegeCreateInvalid,
  userPrivilegeCreateNoUser,
  userPrivilegeCreateNoPrivilege,
  productCategoryCreate,
  productCategoryCreateEmpty,
  productCategoryCreateInvalid,
  productCategoryUpdate,
  productCategoryCreate2,
  productCreate,
  productCreateEmpty,
  productCreateInvalid,
  productUpdate,
  productCreate2,
  productCreateFull,
  productCreateNoSku,
  productCreateNoName,
  productCreateNoPrice,
  productStockCreate,
  productStockCreateEmpty,
  productStockCreateInvalid,
  productStockUpdate,
  productStockCreate2,
  productStockCreateFull,
  productStockCreateNoProduct,
  productStockCreateNoBranch,
  priceListCreate,
  priceListCreateEmpty,
  priceListCreateInvalid,
  priceListUpdate,
  priceListCreate2,
  priceListCreateFull,
  priceListCreateNoName,
  productPriceCreate,
  productPriceCreateEmpty,
  productPriceCreateInvalid,
  productPriceUpdate,
  productPriceCreate2,
  productPriceCreateTiered,
  productPriceCreateNoProduct,
  productPriceCreateNoPriceList,
  productPriceCreateNoPrice,
  supplierCreate,
  supplierCreateEmpty,
  supplierCreateInvalid,
  supplierUpdate,
  supplierCreate2,
  supplierCreateFull,
  supplierCreateNoName,
  supplierCreateNoEmail,
  supplierCreateInvalidEmail,
  userUpdate,
  userUpdateWithRole,
  employeeCreate,
  employeeCreateEmpty,
  employeeCreateInvalid,
  employeeUpdate,
  employeeCreate2,
  employeeCreateFull,
  employeeCreateNoName,
  employeeCreateNoEmail,
  employeeCreateNoPosition,
  employeeCreateNoBranch,
  campaignCreate,
  campaignCreateEmpty,
  campaignCreateInvalid,
  campaignUpdate,
  campaignCreate2,
  campaignInvalidDates,
  campaignProductCreate,
  campaignProductCreateEmpty,
  campaignProductCreateInvalid,
  campaignProductUpdate,
  campaignProductCreate2,
  campaignProductInvalidDiscount,
  campaignProductNegativeDiscount
};
