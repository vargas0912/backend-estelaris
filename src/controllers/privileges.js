const { matchedData } = require('express-validator');

const { handleHttpError } = require('../utils/handleErorr');
const { ERR_SECURITY } = require('../constants/errors');
const { users } = require('../models/index');

const {
  getOneUserPrivilege,
  getAllUserPrivileges,
  addNewUserPrivilege,
  deleteUserPrivilege
} = require('../services/user-privileges');

const {
  getOnePrivilege,
  getAllPrivileges,
  updatePrivilege,
  addPrivilege,
  deletePrivilege,
  getPrivilegeByModule
} = require('../services/privileges');

const addPrivilegeRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const privilege = await addPrivilege(req);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updatePrivilegeRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const privilegeId = req.id;

    const privilege = await updatePrivilege(privilegeId, req);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deletePrivilegeRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const privilege = await deletePrivilege(req.id);
    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const getOnePrivilegeRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const privilege = await getOnePrivilege(req.id);

    if (!privilege) {
      res.status(404);
    }

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getPrivilegesByModuleRecords = async(req, res) => {
  try {
    req = matchedData(req);

    const privileges = await getPrivilegeByModule(req.module);

    if (!privileges) {
      res.status(404);
    }

    res.send({ privileges });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getAllPrivilegesRecords = async(req, res) => {
  try {
    const privileges = await getAllPrivileges();

    res.send({ privileges });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getAllUserPrivilegesRecords = async(req, res) => {
  try {
    const role = req.user.role;

    req = matchedData(req);
    const privileges = await getAllUserPrivileges(req.id);

    res.send({ role, privileges });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getOneUserPrivilegeRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const privilege = await getOneUserPrivilege(req.userid, req.codename);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const addUserPrivilegeRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    // eslint-disable-next-line camelcase
    const { user_id } = body;

    // Obtener el usuario objetivo
    // eslint-disable-next-line camelcase
    const targetUser = await users.findByPk(user_id);

    if (!targetUser) {
      handleHttpError(res, 'USER_NOT_EXISTS', 404);
      return;
    }

    // Validar que NO se puede asignar privilegios a superadmin (excepto por otro superadmin)
    const performingUserRole = req.user.role;
    if (
      targetUser.role === 'superadmin' &&
      performingUserRole !== 'superadmin'
    ) {
      handleHttpError(
        res,
        ERR_SECURITY.FORBIDDEN_CANNOT_MODIFY_SUPERADMIN_PRIVILEGES,
        403
      );
      return;
    }

    // Proceder con la asignación
    const privilege = await addNewUserPrivilege(body);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const deleteUserPrivilegeRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const { userid, pid } = body;

    // Obtener el usuario objetivo
    const targetUser = await users.findByPk(userid);

    if (!targetUser) {
      handleHttpError(res, 'USER_NOT_EXISTS', 404);
      return;
    }

    // Validar que NO se puede eliminar privilegios de superadmin (excepto por otro superadmin)
    const performingUserRole = req.user.role;
    if (
      targetUser.role === 'superadmin' &&
      performingUserRole !== 'superadmin'
    ) {
      handleHttpError(
        res,
        ERR_SECURITY.FORBIDDEN_CANNOT_MODIFY_SUPERADMIN_PRIVILEGES,
        403
      );
      return;
    }

    // Proceder con la eliminación
    const result = await deleteUserPrivilege(userid, pid);

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  addUserPrivilegeRecord, // UserPrivilege
  getAllUserPrivilegesRecords,
  getOneUserPrivilegeRecord,
  deleteUserPrivilegeRecord,
  getOnePrivilegeRecord, // Privielges
  getAllPrivilegesRecords,
  getPrivilegesByModuleRecords,
  addPrivilegeRecord,
  updatePrivilegeRecord,
  deletePrivilegeRecord
};
