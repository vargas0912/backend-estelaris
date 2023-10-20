const { users } = require('../models/index');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const getUsers = async () => {
  // eslint-disable-next-line no-use-before-define
  const data = await users.findAll();

  // Omitir un valor específico de cada objeto en el array
  const users = data.map(user => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = user.toJSON();
    return rest;
  });

  return users;
};

const getUser = async (id) => {
  const data = await users.findOne({
    where: {
      id
    }
  });

  if (data) {
    data.set('password', undefined, { strict: false });
  }

  return data;
};

const registerUser = async (req) => {
  const password = await encrypt(req.password);
  const body = { ...req, password };

  const register = await users.create(body);
  register.set('password', undefined, { strict: false });

  /// const privileges = await addNewPrivilege(register.id);

  const data = {
    token: await tokenSign(register),
    user: register
    // privileges
  };

  return data;
};

const registerSuperAdmin = async (req) => {
  const password = await encrypt(req.password);
  const body = { ...req, password };

  const register = await users.create(body);
  // register.set('password', undefined, {strict: false});

  // const privileges = await addAdminPrivilege(register.id);

  const data = {
    token: await tokenSign(register),
    user: register
  };

  return data;
};

const findByEmail = async (req) => {
  const query = {
    email: req.email
  };

  const user = await users.findOne({ where: query });
  user.set('password', undefined, { strict: false });

  return user;
};

module.exports = {
  getUsers,
  getUser,
  registerUser,
  registerSuperAdmin,
  findByEmail
};
