const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

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
const getRecords = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const search = data.search ?? '';
    const { stocks, total } = await getAllProductStocks(req.branchId, page, limit, search);
    res.send(buildPaginationResponse('stocks', stocks, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un inventario
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async (req, res) => {
  try {
    const { purch_id: purchId } = matchedData(req);

    const stock = await getProductStock(purchId);

    if (!stock) {
      handleHttpError(res, `PRODUCT_STOCK ${purchId} NOT EXISTS`, 404);
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
const getRecordsByProduct = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const search = data.search ?? '';
    const { stocks, total } = await getStocksByProduct(data.product_id, page, limit, search);
    res.send(buildPaginationResponse('stocks', stocks, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_PRODUCT -> ${error}`, 400);
  }
};

/**
 * Obtener inventarios por sucursal
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByBranch = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const search = data.search ?? '';
    const { stocks, total } = await getStocksByBranch(data.branch_id, page, limit, search);
    res.send(buildPaginationResponse('stocks', stocks, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo inventario
 * @param {*} req
 * @param {*} res
 */
const addRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const stock = await addNewProductStock(req);

    res.send({ stock });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async (req, res) => {
  try {
    req = matchedData(req);

    const stock = await updateProductStock(req.id, req);

    res.send({ stock });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
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
