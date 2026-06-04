const crypto = require('crypto');
const { users, userAuditLogs } = require('../models/index');
const { Op } = require('sequelize');
const { encrypt, compare } = require('../utils/handlePassword');
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

const getUsers = async(page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
  const { count, rows } = await users.findAndCountAll({ where, limit, offset });
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

const changePassword = async(userId, currentPassword, newPassword) => {
  const user = await users.findByPk(userId);

  if (!user) return null;

  const isMatch = await compare(currentPassword, user.password);
  if (!isMatch) return false;

  const hashed = await encrypt(newPassword);
  await users.update({ password: hashed, must_change_password: false }, { where: { id: userId } });

  return true;
};

const generateSecurePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = upper + lower + digits + symbols;

  const pick = (set) => set[crypto.randomInt(set.length)];

  const chars = [
    pick(upper),
    pick(lower),
    pick(digits),
    pick(symbols),
    ...Array.from({ length: 8 }, () => pick(all))
  ];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

const resetPassword = async(callerId, targetUserId) => {
  const user = await users.findByPk(targetUserId);
  if (!user) return null;

  const temporaryPassword = generateSecurePassword();
  const hashed = await encrypt(temporaryPassword);

  await users.update({ password: hashed, must_change_password: true }, { where: { id: targetUserId } });

  await userAuditLogs.create({
    action: 'reset_password',
    caller_id: callerId,
    target_user_id: targetUserId
  });

  return { temporaryPassword };
};

module.exports = {
  getUsers,
  getUser,
  registerUser,
  registerSuperAdmin,
  findByEmail,
  changePassword,
  generateSecurePassword,
  resetPassword
};
