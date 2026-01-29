const { matchedData } = require('express-validator');
const { users } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { getUsers, getUser } = require('../services/users');
const { ERR_SECURITY } = require('../constants/errors');
const { pick, USER_UPDATABLE_FIELDS, USER_ADMIN_UPDATABLE_FIELDS } = require('../utils/fieldWhitelist');

/**
 * Valida la jerarquía de roles entre el usuario que ejecuta la acción y el usuario objetivo
 * @param {string} performingUserRole - Rol del usuario que ejecuta la acción (superadmin, admin, user)
 * @param {string} targetUserRole - Rol del usuario objetivo de la acción
 * @returns {boolean} - true si la acción es permitida, false si no
 */
const validateRoleHierarchy = (performingUserRole, targetUserRole) => {
  // Superadmin puede modificar a cualquiera
  if (performingUserRole === 'superadmin') {
    return true;
  }

  // Admin/User NO pueden modificar superadmin
  if (targetUserRole === 'superadmin') {
    return false;
  }

  // Admin puede modificar admin/user
  if (performingUserRole === 'admin' &&
      (targetUserRole === 'admin' || targetUserRole === 'user')) {
    return true;
  }

  // User NO puede modificar a nadie
  return false;
};

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const users = await getUsers();

    res.send({ users });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const user = await getUser(req.id);

    if (!user) {
      handleHttpError(res, `USER_NOT_FOUND --> ${req.id}`, 404);
      return;
    }

    res.send({ user });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`);
  }
};

const updateRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const id = body.id;

    // Obtener el usuario objetivo
    const userFound = await users.findByPk(id);

    if (!userFound) {
      handleHttpError(res, `USER_NOT_FOUND --> ${id}`, 404);
      return;
    }

    // Validar jerarquía de roles
    const performingUserRole = req.user.role;
    if (!validateRoleHierarchy(performingUserRole, userFound.role)) {
      handleHttpError(res, ERR_SECURITY.FORBIDDEN_ROLE_HIERARCHY, 403);
      return;
    }

    // Determinar campos permitidos según el rol del usuario que ejecuta la acción
    const allowedFields = (performingUserRole === 'superadmin' || performingUserRole === 'admin')
      ? USER_ADMIN_UPDATABLE_FIELDS
      : USER_UPDATABLE_FIELDS;

    // Aplicar whitelist para prevenir mass assignment
    const cleanData = pick(body, allowedFields);

    // Si se intenta cambiar el role, validar también
    if (cleanData.role && cleanData.role !== userFound.role) {
      // NO permitir que alguien eleve a superadmin (solo superadmin puede)
      if (cleanData.role === 'superadmin' && performingUserRole !== 'superadmin') {
        handleHttpError(res, ERR_SECURITY.FORBIDDEN_CANNOT_CREATE_SUPERADMIN, 403);
        return;
      }
    }

    // Actualizar solo los campos permitidos
    await users.update(cleanData, {
      where: { id },
      fields: allowedFields
    });

    const user = await users.findByPk(id);

    if (user) {
      user.set('password', undefined, { strict: false });
    }

    res.send({ user });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const id = body.id;

    // Obtener el usuario objetivo
    const targetUser = await users.findByPk(id);

    if (!targetUser) {
      handleHttpError(res, `USER_NOT_FOUND --> ${id}`, 404);
      return;
    }

    // Validar jerarquía de roles
    const performingUserRole = req.user.role;
    if (!validateRoleHierarchy(performingUserRole, targetUser.role)) {
      handleHttpError(res, ERR_SECURITY.FORBIDDEN_ROLE_HIERARCHY, 403);
      return;
    }

    // Proceder con la eliminación (soft delete)
    const result = await users.destroy({
      where: {
        id
      }
    });

    if (!result) {
      handleHttpError(res, `USER_NOT_FOUND --> ${id}`, 404);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, updateRecord, deleteRecord };
