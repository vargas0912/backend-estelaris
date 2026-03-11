const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllEmployees, getEmployee, getEmployeesByBranch, addNewEmployee, updateEmployee, deleteEmployee, grantEmployeeAccess, revokeEmployeeAccess } = require('../services/employees');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const employees = await getAllEmployees(req.branchId);

    res.send({ employees });
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

    const employee = await getEmployee(id);

    if (!employee) {
      handleHttpError(res, `EMPLOYEE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ employee });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener empleados por sucursal
 * @param {Request} req Request param con branch_id en params
 * @param {Response} res Response param
 */
const getRecordsByBranch = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);

    const employees = await getEmployeesByBranch(branchId);

    res.send({ employees });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`);
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

    const employee = await addNewEmployee(req);

    res.send({ employee });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const employee = await updateEmployee(req.id, req);

    res.send({ employee });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteEmployee(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

const grantAccess = async (req, res) => {
  try {
    const { id, email, password, privileges } = matchedData(req);
    const result = await grantEmployeeAccess(id, email, password, privileges);

    if (result.error === 'EMPLOYEE_NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.status(201).send(result);
  } catch (error) {
    handleHttpError(res, `ERROR_GRANT_ACCESS --> ${error}`, 400);
  }
};

const revokeAccess = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await revokeEmployeeAccess(id);

    if (result.error === 'EMPLOYEE_NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send(result);
  } catch (error) {
    handleHttpError(res, `ERROR_REVOKE_ACCESS --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, getRecordsByBranch, addRecord, updateRecord, deleteRecord, grantAccess, revokeAccess };
