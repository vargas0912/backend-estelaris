const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const {
  getAllPurchases,
  getPurchase,
  getPurchasesBySupplier,
  getPurchasesByBranch,
  createPurchase,
  updatePurchase,
  cancelPurchase,
  deletePurchase,
  receivePurchase
} = require('../services/purchases');

const getRecords = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(matchedData(req));
    const { purchases, total } = await getAllPurchases(req.branchId, page, limit);
    res.send(buildPaginationResponse('purchases', purchases, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const purchase = await getPurchase(id);

    if (!purchase) {
      handleHttpError(res, `PURCHASE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ purchase });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const getRecordsBySupplier = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { purchases, total } = await getPurchasesBySupplier(data.supplier_id, page, limit);
    res.send(buildPaginationResponse('purchases', purchases, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_SUPPLIER -> ${error}`, 400);
  }
};

const getRecordsByBranch = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { purchases, total } = await getPurchasesByBranch(data.branch_id, page, limit);
    res.send(buildPaginationResponse('purchases', purchases, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const purchase = await createPurchase(data, userId);

    if (purchase && purchase.error) {
      handleHttpError(res, purchase.error, 400);
      return;
    }

    res.send({ purchase });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const purchase = await updatePurchase(data.id, data);

    if (purchase && purchase.error) {
      handleHttpError(res, purchase.error, 400);
      return;
    }

    if (purchase && purchase.data && purchase.data.msg === 'NOT_FOUND') {
      handleHttpError(res, `PURCHASE ${data.id} NOT EXISTS`, 404);
      return;
    }

    res.send({ purchase });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const cancelRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await cancelPurchase(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `PURCHASE ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 400);
      return;
    }

    res.send({ purchase: result });
  } catch (error) {
    handleHttpError(res, `ERROR_CANCEL_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deletePurchase(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `PURCHASE ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 400);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

const receiveRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const userId = req.user.id;
    const result = await receivePurchase(id, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `PURCHASE ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ purchase: result });
  } catch (error) {
    handleHttpError(res, `ERROR_RECEIVE_RECORD --> ${error}`, 400);
  }
};

module.exports = {
  getRecords,
  getRecord,
  getRecordsBySupplier,
  getRecordsByBranch,
  addRecord,
  updateRecord,
  cancelRecord,
  deleteRecord,
  receiveRecord
};
