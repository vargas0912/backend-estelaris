const { matchedData } = require('express-validator');
const { compare } = require('../utils/handlePassword');
const { tokenSign, JWT_EXPIRY_MS } = require('../utils/handleJwt');
const { users, branches } = require('../models/index');
const { handleHttpError, handleServerError } = require('../utils/handleErorr');
const { registerUser, registerSuperAdmin } = require('../services/users');
const { LOGIN, USER } = require('../constants/errors');
const { ROLE } = require('../constants/roles');
const { allowBearer, sessionCookieOptions, SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, csrfCookieOptions } = require('../config/security');
const { issueCsrfToken } = require('../middlewares/csrf');

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
    handleServerError(res, USER.ERROR_REGISTER_SUPER_USER, error);
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
    handleServerError(res, USER.ERROR_REGISTER_USER, error);
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
      // El token solo viaja en el cuerpo si se aceptan headers Bearer (tests, Swagger).
      // En el navegador vive únicamente en la cookie HttpOnly.
      ...(allowBearer() ? { token } : {}),
      expires_at: new Date(Date.now() + JWT_EXPIRY_MS).toISOString(),
      user,
      branches: branchesList
    };

    user.set('password', undefined, { strict: false });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(JWT_EXPIRY_MS));
    // Token CSRF nuevo con cada sesión
    issueCsrfToken(res);
    res.send({ sesion });
  } catch (error) {
    handleHttpError(res, LOGIN.ERR_LOGIN, 400);
  }
};

const logoutCtrl = (req, res) => {
  const { maxAge, ...sessionOptions } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, sessionOptions);
  res.clearCookie(CSRF_COOKIE_NAME, csrfCookieOptions());
  res.send({ message: 'Sesión cerrada' });
};
const refreshCtrl = async(req, res) => {
  try {
    const user = req.user;
    const token = await tokenSign(user);

    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(JWT_EXPIRY_MS));
    res.json({
      ...(allowBearer() ? { token } : {}),
      expires_at: new Date(Date.now() + JWT_EXPIRY_MS).toISOString()
    });
  } catch (error) {
    handleHttpError(res, 'ERROR_REFRESH_TOKEN', 400);
  }
};

/**
 * Entrega (o renueva) la cookie XSRF-TOKEN. Público: el front lo llama antes
 * del login y cuando el backend responde CSRF_TOKEN_INVALID.
 */
const csrfCtrl = (req, res) => {
  issueCsrfToken(res);
  res.status(204).end();
};

const verifyPasswordCtrl = async (req, res) => {
  try {
    const { password } = matchedData(req);
    const user = await users.findByPk(req.user.id, { attributes: ['password'] });
    if (!user) return res.status(401).json({ errors: [{ type: 'client', name: 'password', message: 'Contraseña incorrecta' }] });
    const valid = await compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        errors: [{ type: 'client', name: 'password', message: 'Contraseña incorrecta' }]
      });
    }
    res.send({ ok: true });
  } catch (error) {
    handleHttpError(res, 'ERROR_VERIFY_PASSWORD', 400);
  }
};

module.exports = { registerAdminCtrl, registerCtrl, loginCtrl, refreshCtrl, logoutCtrl, verifyPasswordCtrl, csrfCtrl };
