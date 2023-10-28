const { matchedData } = require('express-validator');

const { handleHttpError } = require('../utils/handleErorr');

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

const addPrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const privilege = await addPrivilege(req);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updatePrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const privilegeId = req.id;

    const privilege = await updatePrivilege(privilegeId, req);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deletePrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const privilege = await deletePrivilege(req.id);
    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const getOnePrivilegeRecord = async (req, res) => {
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

const getPrivilegesByModuleRecords = async (req, res) => {
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

const getAllPrivilegesRecords = async (req, res) => {
  try {
    const privileges = await getAllPrivileges();

    res.send({ privileges });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getAllUserPrivilegesRecords = async (req, res) => {
  try {
    const role = req.user.role;

    req = matchedData(req);

    const privileges = await getAllUserPrivileges(req.id);

    res.send({ role, privileges });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getOneUserPrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const privilege = await getOneUserPrivilege(req.userid, req.codename);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const addUserPrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const privilege = await addNewUserPrivilege(req);

    res.send({ privilege });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const deleteUserPrivilegeRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteUserPrivilege(req.userid, req.pid);

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
