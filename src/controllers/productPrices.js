const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllProductPrices,
  getProductPrice,
  getPricesByProduct,
  getPricesByPriceList,
  addNewProductPrice,
  updateProductPrice,
  deleteProductPrice
} = require('../services/productPrices');

/**
 * Obtener lista de precios de productos
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const prices = await getAllProductPrices();

    res.send({ prices });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un precio de producto
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const price = await getProductPrice(id);

    if (!price) {
      handleHttpError(res, `PRODUCT_PRICE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ price });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener precios por producto
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByProduct = async(req, res) => {
  try {
    const { product_id: productId } = matchedData(req);

    const prices = await getPricesByProduct(productId);

    res.send({ prices });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_PRODUCT -> ${error}`, 400);
  }
};

/**
 * Obtener precios por lista de precios
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByPriceList = async(req, res) => {
  try {
    const { price_list_id: priceListId } = matchedData(req);

    const prices = await getPricesByPriceList(priceListId);

    res.send({ prices });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_PRICE_LIST -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo precio de producto
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const price = await addNewProductPrice(req);

    res.send({ price });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const price = await updateProductPrice(req.id, req);

    res.send({ price });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteProductPrice(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecord,
  getRecords,
  getRecordsByProduct,
  getRecordsByPriceList,
  addRecord,
  updateRecord,
  deleteRecord
};
