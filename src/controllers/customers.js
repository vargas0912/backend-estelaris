const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllCustomers,
  getCustomer,
  getCustomersByBranch,
  getCustomersByMunicipality,
  addNewCustomer,
  updateCustomer,
  deleteCustomer,
  activatePortal
} = require('../services/customers');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const customers = await getAllCustomers();
    res.send({ customers });
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
    const customer = await getCustomer(id);

    if (!customer) {
      handleHttpError(res, `CUSTOMER ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ customer });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener clientes por sucursal
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByBranch = async(req, res) => {
  try {
    const { branchId } = matchedData(req);
    const customers = await getCustomersByBranch(branchId);
    res.send({ customers });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

/**
 * Obtener clientes por municipio
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByMunicipality = async(req, res) => {
  try {
    const { municipalityId } = matchedData(req);
    const customers = await getCustomersByMunicipality(municipalityId);
    res.send({ customers });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_MUNICIPALITY -> ${error}`, 400);
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
    const customer = await addNewCustomer(req);

    if (customer.error) {
      handleHttpError(res, customer.message, 400);
      return;
    }

    res.send({ customer });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

/**
 * Actualizar un registro
 * @param {*} req
 * @param {*} res
 */
const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);
    const customer = await updateCustomer(req.id, req);

    if (customer.error) {
      handleHttpError(res, customer.message, 400);
      return;
    }

    res.send({ customer });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

/**
 * Eliminar un registro (soft delete)
 * @param {*} req
 * @param {*} res
 */
const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);
    const customer = await deleteCustomer(req.id);

    if (customer.error) {
      handleHttpError(res, customer.message, 404);
      return;
    }

    res.send({ customer });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

/**
 * Activar portal de cliente
 * @param {*} req
 * @param {*} res
 */
const activatePortalCtrl = async(req, res) => {
  try {
    const { id, password } = matchedData(req);
    const result = await activatePortal(id, password);

    if (result.error) {
      handleHttpError(res, result.message, 400);
      return;
    }

    res.send({
      message: 'Portal activado correctamente',
      customer: result.customer,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      },
      tempPassword: result.tempPassword
    });
  } catch (error) {
    handleHttpError(res, `ERROR_ACTIVATE_PORTAL --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecords,
  getRecordsByBranch,
  getRecordsByMunicipality,
  addRecord,
  updateRecord,
  deleteRecord,
  activatePortalCtrl
};
