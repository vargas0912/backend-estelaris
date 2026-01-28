'use strict';

const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllSuppliers,
  getSupplier,
  addNewSupplier,
  updateSupplier,
  deleteSupplier
} = require('../services/suppliers');

/**
 * Obtener lista de proveedores
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const suppliers = await getAllSuppliers();

    res.send({ suppliers });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un proveedor
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const supplier = await getSupplier(id);

    if (!supplier) {
      handleHttpError(res, `SUPPLIER ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ supplier });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo proveedor
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const supplier = await addNewSupplier(req);

    res.send({ supplier });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

/**
 * Actualizar un proveedor
 * @param {*} req
 * @param {*} res
 */
const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const supplier = await updateSupplier(req.id, req);

    res.send({ supplier });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

/**
 * Eliminar un proveedor
 * @param {*} req
 * @param {*} res
 */
const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteSupplier(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord
};
