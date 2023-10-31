const { matchedData } = require('express-validator');
const { users } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { getUsers, getUser } = require('../services/users');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async (req, res) => {
  try {
    const users = await getUsers();

    res.send({ users });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecord = async (req, res) => {
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

const updateRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const { name, role } = req;

    const userFound = await users.findByPk(req.id);

    if (!userFound) {
      handleHttpError(res, `USER_NOT_FOUND --> ${req.id}`, 404);
      return;
    }

    userFound.name = name || userFound.name;
    userFound.role = role || userFound.role;

    const user = await userFound.save();

    if (user) {
      user.set('password', undefined, { strict: false });
    }

    res.send({ user });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    req = matchedData(req);

    console.log(req);
    const result = await users.destroy({
      where: {
        id: req.id
      }
    });

    if (!result) {
      handleHttpError(res, `USER_NOT_FOUND --> ${req.id}`, 404);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, updateRecord, deleteRecord };
