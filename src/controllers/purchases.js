const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllPurchases,
  getPurchase,
  getPurchasesBySupplier,
  getPurchasesByBranch,
  createPurchase,
  updatePurchase,
  cancelPurchase,
  deletePurchase
} = require('../services/purchases');

const getRecords = async (req, res) => {
  try {
    const purchaseList = await getAllPurchases(req.branchId);
    res.send({ purchases: purchaseList });
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
    const { supplier_id: supplierId } = matchedData(req);
    const purchaseList = await getPurchasesBySupplier(supplierId);
    res.send({ purchases: purchaseList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_SUPPLIER -> ${error}`, 400);
  }
};

const getRecordsByBranch = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const purchaseList = await getPurchasesByBranch(branchId);
    res.send({ purchases: purchaseList });
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

module.exports = {
  getRecords,
  getRecord,
  getRecordsBySupplier,
  getRecordsByBranch,
  addRecord,
  updateRecord,
  cancelRecord,
  deleteRecord
};
