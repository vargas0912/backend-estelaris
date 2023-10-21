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
  email: 'test2@test.com',
  role: 'admin',
  password: '12345678'
};

const testStorageRegister = {
  url: 'http://localhost:3001/file-test.mp3',
  filename: 'file-test.mp3'
};

const testDataProduct = {
  name: 'Ejemplo',
  description: 'Ejemplo',
  cantidad: 2,
  provider: {
    name: 'Ejemplo',
    contact: 'Ejemplo',
    country: 'VE'
  },
  mediaId: ''
};

module.exports = {
  testAuthRegister,
  testAuthLogin,
  testAuthRegisterAdmin,
  testAuthRegisterSuperAdmin,
  testAuthRegisterSuperAdminErr,
  testAuthRegisterSuperAdminFail,
  testStorageRegister,
  testDataProduct
};
