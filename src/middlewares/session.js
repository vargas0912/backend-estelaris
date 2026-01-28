const { handleHttpError } = require('../utils/handleErorr');
const { verifyToken } = require('../utils/handleJwt');
const logger = require('../utils/logger');

const { getUser } = require('../services/users');
const { SESSION } = require('../constants/errors');

/**
 * Middleware for check sesion and privileges
 * @param {Request} req Request param
 * @param {Response} res Response
 * @param {Next} next
 * @returns
 */
const authMidleware = async(req, res, next) => {
  try {
    if (!req.headers.authorization) {
      handleHttpError(res, SESSION.NOT_TOKEN, 401);
      return;
    }

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);

    // Verificar si hay error específico de JWT
    if (dataToken && dataToken.error) {
      if (dataToken.error === 'TOKEN_EXPIRED') {
        handleHttpError(res, 'Token has expired', 401);
        return;
      }
      if (dataToken.error === 'TOKEN_INVALID' || dataToken.error === 'TOKEN_NOT_ACTIVE') {
        handleHttpError(res, SESSION.TOKEN_INVALID, 401);
        return;
      }
    }

    if (!dataToken) {
      handleHttpError(res, SESSION.TOKEN_INVALID, 401);
      return;
    }

    if (!dataToken.id) {
      handleHttpError(res, SESSION.ERROR_ID_TOKEN, 401);
      return;
    }

    const user = await getUser(dataToken.id);

    if (!user) {
      handleHttpError(res, SESSION.USER_ID_TOKEN_NOT_EXISTS, 401);
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', { error: error.message, stack: error.stack });
    handleHttpError(res, SESSION.NOT_SESION, 401);
  }
};

module.exports = authMidleware;
