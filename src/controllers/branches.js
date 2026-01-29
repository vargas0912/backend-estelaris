const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllBranches, getBranch, addNewBranch, updateBranch, deleteBranch } = require('../services/branches');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const branches = await getAllBranches();

    res.send({ branches });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un registro
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const branch = await getBranch(id);

    if (!branch) {
      handleHttpError(res, `BRANCH ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ branch });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo registro
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const branch = await addNewBranch(req);

    res.send({ branch });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const branch = await updateBranch(req.id, req);

    res.send({ branch });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const branch = await deleteBranch(req.id);

    if (branch.data && branch.data.msg === 'NOT_FOUND') {
      handleHttpError(res, `BRANCH ${req.id} NOT EXISTS`, 404);
      return;
    }

    res.send({ branch });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, addRecord, updateRecord, deleteRecord };
