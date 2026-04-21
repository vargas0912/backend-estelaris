const { users } = require('../models/index');
const { encrypt } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');

const getUser = async(id) => {
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

const getUsers = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await users.findAndCountAll({ limit, offset });
  const allUsers = rows.map(user => {
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = user.toJSON();
    return rest;
  });
  return { users: allUsers, total: count };
};

const registerUser = async(req) => {
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

const registerSuperAdmin = async(req) => {
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

const findByEmail = async(req) => {
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
