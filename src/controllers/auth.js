const { matchedData } = require('express-validator');
const { compare } = require('../utils/handlePassword');
const { tokenSign } = require('../utils/handleJwt');
const { users } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { registerUser, registerSuperAdmin } = require('../services/users');
const { LOGIN, USER } = require('../constants/errors');

/**
 * This controller is used for register user
 * @param {*} req Request
 * @param {*} res Response
 */
const registerAdminCtrl = async (req, res) => {
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
const registerCtrl = async (req, res) => {
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
const loginCtrl = async (req, res) => {
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

    const sesion = {
      token: await tokenSign(user),
      user
    };

    user.set('password', undefined, { strict: false });
    res.send({ sesion });
  } catch (error) {
    handleHttpError(res, LOGIN.ERR_LOGIN, 400);
  }
};

module.exports = { registerAdminCtrl, registerCtrl, loginCtrl };
