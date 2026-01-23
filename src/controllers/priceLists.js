const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllPriceLists,
  getPriceList,
  addNewPriceList,
  updatePriceList,
  deletePriceList
} = require('../services/priceLists');

/**
 * Obtener lista de listas de precios
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const priceLists = await getAllPriceLists();

    res.send({ priceLists });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de una lista de precios
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const priceList = await getPriceList(id);

    if (!priceList) {
      handleHttpError(res, `PRICE_LIST ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ priceList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Agregar una nueva lista de precios
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const priceList = await addNewPriceList(req);

    res.send({ priceList });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const priceList = await updatePriceList(req.id, req);

    res.send({ priceList });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deletePriceList(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, addRecord, updateRecord, deleteRecord };
