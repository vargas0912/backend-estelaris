const { matchedData } = require('express-validator');
const { compare } = require('../utils/handlePassword');
const { tokenSign, JWT_EXPIRY_MS } = require('../utils/handleJwt');
const { users, branches } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { registerUser, registerSuperAdmin } = require('../services/users');
const { LOGIN, USER } = require('../constants/errors');
const { ROLE } = require('../constants/roles');

/**
 * This controller is used for register user
 * @param {*} req Request
 * @param {*} res Response
 */
const registerAdminCtrl = async(req, res) => {
  try {
    req = matchedData(req);

    const superAdmin = await registerSuperAdmin(req);

    res.send({ superAdmin });
  } catch (error) {
    handleHttpError(res, USER.ERROR_REGISTER_SUPER_USER);
  }
};

/**
 * This controller is used for register user
 * @param {*} req Request
 * @param {*} res Response
 */
const registerCtrl = async(req, res) => {
  try {
    req = matchedData(req);

    const user = await registerUser(req);

    res.send({ user });
  } catch (error) {
    handleHttpError(res, USER.ERROR_REGISTER_USER);
  }
};

/**
 * This controller is used for login user
 * @param {*} req Request
 * @param {*} res Response
 */

const loginCtrl = async(req, res) => {
  try {
    req = matchedData(req);

    const query = {
      email: req.email
    };

    const user = await users.findOne({ where: query });

    if (!user) {
      handleHttpError(res, LOGIN.USER_NOT_EXISTS, 400);
      return;
    }
    const hashPassowrd = user.get('password');

    const check = await compare(req.password, hashPassowrd);

    if (!check) {
      handleHttpError(res, LOGIN.PASSWORD_INVALID, 400);
      return;
    }

    let branchesList;
    if (user.role === ROLE.SUPERADMIN) {
      branchesList = await branches.findAll({ attributes: ['id', 'name'] });
    } else {
      branchesList = await branches.findAll({
        attributes: ['id', 'name'],
        include: [{
          association: 'users',
          where: { id: user.id },
          attributes: [],
          through: { attributes: [] }
        }]
      });
    }

    const token = await tokenSign(user);
    const sesion = {
      token,
      expires_at: new Date(Date.now() + JWT_EXPIRY_MS).toISOString(),
      user,
      branches: branchesList
    };

    user.set('password', undefined, { strict: false });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: JWT_EXPIRY_MS
    });
    res.send({ sesion });
  } catch (error) {
    handleHttpError(res, LOGIN.ERR_LOGIN, 400);
  }
};

const logoutCtrl = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });
  res.send({ message: 'Sesión cerrada' });
};
const refreshCtrl = async(req, res) => {
  try {
    const user = req.user;
    const token = await tokenSign(user);

    res.send({
      token,
      expires_at: new Date(Date.now() + JWT_EXPIRY_MS).toISOString()
    });
  } catch (error) {
    handleHttpError(res, 'ERROR_REFRESH_TOKEN', 400);
  }
};

module.exports = { registerAdminCtrl, registerCtrl, loginCtrl, refreshCtrl, logoutCtrl };
