const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');
const { users } = require('../models/index');

const { REGISTER, USER } = require('../constants/errors');
const { ROLE } = require('../constants/roles');

const validateRegister = [
  check('name')
    .exists().withMessage(REGISTER.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.NAME_IS_EMPTY).bail()
    .isLength({ min: 3, max: 99 }).withMessage(REGISTER.NAME_LENGTH_ERROR).bail(),
  check('email')
    .exists().withMessage(REGISTER.EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.EMAIL_EMPTY).bail()
    .isEmail().withMessage(REGISTER.EMAIL_INVALID).bail()
    .custom(async(value) => {
      // Verifiando si el email ya está registrado
      const user = await users.findOne({
        attributes: ['email'],
        where: {
          email: value.toLowerCase()
        }
      });

      if (user) {
        throw new Error(REGISTER.EMAIL_EXISTS);
      }
    }),
  check('password')
    .exists().withMessage(REGISTER.PASSWORD_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.PASSWORD_EMPTY).bail()
    .isLength({ min: 3, max: 15 }).withMessage(REGISTER.PASSWORD_LENGTH_ERROR),
  check('role')
    .exists().withMessage(REGISTER.ROLE_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.ROLE_IS_EMPTY).bail()
    .isIn([ROLE.USER, ROLE.ADMIN, ROLE.SUPERADMIN]).withMessage(REGISTER.ROLE_INVALID),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateLogin = [
  check('email')
    .exists().withMessage(REGISTER.EMAIL_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.EMAIL_EMPTY).bail()
    .isEmail().withMessage(REGISTER.EMAIL_INVALID),
  check('password')
    .exists().withMessage(REGISTER.PASSWORD_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.PASSWORD_EMPTY).bail()
    .isLength({ min: 3, max: 15 }).withMessage(REGISTER.PASSWORD_LENGTH_ERROR),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateGetUser = [
  check('id')
    .exists().withMessage(USER.ID_NOT_EXISTS).bail(),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

const validateUpdateUser = [
  check('id')
    .exists().withMessage(USER.ID_NOT_EXISTS).bail(),
  check('name')
    .exists().withMessage(REGISTER.NAME_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.NAME_IS_EMPTY).bail()
    .isLength({ min: 3, max: 99 }).withMessage(REGISTER.NAME_LENGTH_ERROR).bail(),
  check('role')
    .exists().withMessage(REGISTER.ROLE_NOT_EXISTS).bail()
    .notEmpty().withMessage(REGISTER.ROLE_IS_EMPTY).bail()
    .isIn(['user', 'admin', 'superadmin']).withMessage(REGISTER.ROLE_INVALID),
  (req, res, next) => {
    return validateResults(req, res, next);
  }
];

module.exports = { validateRegister, validateLogin, validateGetUser, validateUpdateUser };
