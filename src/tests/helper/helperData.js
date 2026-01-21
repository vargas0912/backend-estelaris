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

// Datos adicionales para tests de branches
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
  branchCreate2
};
