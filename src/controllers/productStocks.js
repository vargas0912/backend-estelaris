const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllProductStocks,
  getProductStock,
  getStocksByProduct,
  getStocksByBranch,
  addNewProductStock,
  updateProductStock,
  deleteProductStock
} = require('../services/productStocks');

/**
 * Obtener lista de inventarios
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const stocks = await getAllProductStocks(req.branchId);

    res.send({ stocks });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un inventario
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const stock = await getProductStock(id);

    if (!stock) {
      handleHttpError(res, `PRODUCT_STOCK ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ stock });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener inventarios por producto
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByProduct = async(req, res) => {
  try {
    const { product_id: productId } = matchedData(req);

    const stocks = await getStocksByProduct(productId);

    res.send({ stocks });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_PRODUCT -> ${error}`, 400);
  }
};

/**
 * Obtener inventarios por sucursal
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByBranch = async(req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);

    const stocks = await getStocksByBranch(branchId);

    res.send({ stocks });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo inventario
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const stock = await addNewProductStock(req);

    res.send({ stock });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const stock = await updateProductStock(req.id, req);

    res.send({ stock });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteProductStock(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecords,
  getRecordsByProduct,
  getRecordsByBranch,
  addRecord,
  updateRecord,
  deleteRecord
};
