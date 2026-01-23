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
  email: 'superadmin@test.com',
  password: '12345678'
};

const testAuthRegister = {
  name: 'User test',
  email: 'test1@test.com',
  password: '12345678',
  status: false,
  role: 'user'
};

const testAuthRegisterSuperAdmin = {
  name: 'Super admin',
  email: 'superadmin@test.com',
  role: 'superadmin',
  password: '12345678'
};

const testAuthRegisterSuperAdminErr = {
  name: 'Super admin',
  email: 'superadmin@test.com',
  role: 'user',
  password: '12345678'
};

const testAuthRegisterSuperAdminFail = {
  name: 'Super admin',
  email: 'superadmin@test.com',
  password: '12345678'
};

const testAuthRegisterAdmin = {
  name: 'User admin',
  email: 'admin@estelaris.com',
  role: 'admin',
  password: '12345678'
};

const testStorageRegister = {
  url: 'http://localhost:3001/file-test.mp3',
  filename: 'file-test.mp3'
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
  productCreateNoPrice
};
