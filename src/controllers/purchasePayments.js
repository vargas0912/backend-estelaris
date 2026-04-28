const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const {
  getAllPayments,
  getPaymentsByPurchase,
  getPayment,
  createPayment,
  deletePayment
} = require('../services/purchasePayments');

const getRecords = async (req, res) => {
  try {
    const { page, limit } = getPaginationParams(matchedData(req));
    const { payments, total } = await getAllPayments(page, limit);
    res.send(buildPaginationResponse('payments', payments, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecordsByPurchase = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { payments, total } = await getPaymentsByPurchase(data.purch_id, page, limit);
    res.send(buildPaginationResponse('payments', payments, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_PURCHASE -> ${error}`, 400);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const payment = await getPayment(id);

    if (!payment) {
      handleHttpError(res, `PAYMENT ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ payment });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const payment = await createPayment(data, userId);

    if (payment && payment.error === 'NOT_FOUND') {
      handleHttpError(res, `PURCHASE ${data.purch_id} NOT EXISTS`, 404);
      return;
    }

    if (payment && payment.error) {
      handleHttpError(res, payment.error, 422);
      return;
    }

    res.send({ payment });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deletePayment(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `PAYMENT ${id} NOT EXISTS`, 404);
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
  getRecordsByPurchase,
  getRecord,
  addRecord,
  deleteRecord
};
