const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllAddresses,
  getAddress,
  getAddressesByCustomer,
  addNewAddress,
  updateAddress,
  deleteAddress
} = require('../services/customerAddresses');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const addresses = await getAllAddresses();
    res.send({ addresses });
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
    const address = await getAddress(id);

    if (!address) {
      handleHttpError(res, `ADDRESS ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ address });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener direcciones por cliente
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByCustomer = async(req, res) => {
  try {
    const { customerId } = matchedData(req);
    const addresses = await getAddressesByCustomer(customerId);
    res.send({ addresses });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_CUSTOMER -> ${error}`, 400);
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
    const address = await addNewAddress(req);

    if (address.error) {
      handleHttpError(res, address.message, 400);
      return;
    }

    res.send({ address });
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
    const address = await updateAddress(req.id, req);

    if (address.error) {
      handleHttpError(res, address.message, 400);
      return;
    }

    res.send({ address });
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
    const address = await deleteAddress(req.id);

    if (address.error) {
      handleHttpError(res, address.message, 404);
      return;
    }

    res.send({ address });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecords,
  getRecordsByCustomer,
  addRecord,
  updateRecord,
  deleteRecord
};
