const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllTransfers,
  getTransfersByFromBranch,
  getTransfersByToBranch,
  getTransfer,
  createTransfer,
  updateTransfer,
  dispatchTransfer,
  receiveTransfer,
  deleteTransfer
} = require('../services/transfers');

const getRecords = async (req, res) => {
  try {
    const list = await getAllTransfers();
    res.send({ transfers: list });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const transfer = await getTransfer(id);

    if (!transfer) {
      handleHttpError(res, `TRANSFER ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ transfer });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const getRecordsByFromBranch = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const list = await getTransfersByFromBranch(branchId);
    res.send({ transfers: list });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_FROM_BRANCH -> ${error}`, 400);
  }
};

const getRecordsByToBranch = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const list = await getTransfersByToBranch(branchId);
    res.send({ transfers: list });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_TO_BRANCH -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const result = await createTransfer(data, userId);

    if (result && result.error) {
      handleHttpError(res, result.error, 400);
      return;
    }

    res.send({ transfer: result });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD -> ${error}`, 400);
  }
};

const updateRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const result = await updateTransfer(data.id, data);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `TRANSFER ${data.id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ transfer: result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD -> ${error}`, 400);
  }
};

const dispatchRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const userId = req.user.id;

    const result = await dispatchTransfer(id, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `TRANSFER ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error === 'INSUFFICIENT_STOCK') {
      handleHttpError(res, `INSUFFICIENT_STOCK for product ${result.product_id}`, 422);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ transfer: result });
  } catch (error) {
    handleHttpError(res, `ERROR_DISPATCH_RECORD -> ${error}`, 400);
  }
};

const receiveRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const result = await receiveTransfer(data.id, data.items, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `TRANSFER ${data.id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error === 'DETAIL_NOT_FOUND') {
      handleHttpError(res, `DETAIL ${result.detail_id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error === 'QTY_RECEIVED_EXCEEDS_QTY_SENT') {
      handleHttpError(res, `QTY_RECEIVED_EXCEEDS_QTY_SENT for detail ${result.detail_id}`, 422);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ transfer: result });
  } catch (error) {
    handleHttpError(res, `ERROR_RECEIVE_RECORD -> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const userId = req.user.id;

    const result = await deleteTransfer(id, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `TRANSFER ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 409);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error}`, 400);
  }
};

module.exports = {
  getRecords,
  getRecord,
  getRecordsByFromBranch,
  getRecordsByToBranch,
  addRecord,
  updateRecord,
  dispatchRecord,
  receiveRecord,
  deleteRecord
};
