const superadminLogin = {
  email: 'superadmin@estelaris.com',
  password: 'Admin123'
};

const buildUser = (suffix, role = 'user') => ({
  name: `Template ${suffix}`,
  email: `ptpl_${suffix}@test.com`,
  role,
  password: 'Test1234'
});

const templateCreateNoName = { privileges: [1] };
const templateCreateNoPrivileges = { name: 'Sin privilegios definidos' };
const templateCreatePrivilegesNotArray = { name: 'Invalida', privileges: 'abc' };
const templateCreateUnknownPrivilege = { name: 'Privilegio inexistente', privileges: [999999] };

module.exports = {
  superadminLogin,
  buildUser,
  templateCreateNoName,
  templateCreateNoPrivileges,
  templateCreatePrivilegesNotArray,
  templateCreateUnknownPrivilege
};
