const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllProducts, getProduct, addNewProduct, updateProduct, deleteProduct } = require('../services/products');

/**
 * Obtener lista de productos
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const products = await getAllProducts();

    res.send({ products });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un producto
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const product = await getProduct(id);

    if (!product) {
      handleHttpError(res, `PRODUCT ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ product });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo producto
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const product = await addNewProduct(req);

    res.send({ product });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const product = await updateProduct(req.id, req);

    res.send({ product });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteProduct(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, addRecord, updateRecord, deleteRecord };
