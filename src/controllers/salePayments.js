const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllPayments,
  getPaymentsBySale,
  getPayment,
  createPayment,
  deletePayment
} = require('../services/salePayments');

const getRecords = async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.send({ payments });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecordsBySale = async (req, res) => {
  try {
    const { sale_id: saleId } = matchedData(req);
    const payments = await getPaymentsBySale(saleId);
    res.send({ payments });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_SALE -> ${error}`, 400);
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
    const branchId = req.branchId || parseInt(req.headers['x-branch-id'], 10);

    if (!branchId || isNaN(branchId)) {
      handleHttpError(res, 'BRANCH_ID_REQUIRED', 400);
      return;
    }

    const payment = await createPayment(data, userId, branchId);

    if (payment && payment.error === 'NOT_FOUND') {
      handleHttpError(res, `SALE ${data.sale_id} NOT EXISTS`, 404);
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
  getRecordsBySale,
  getRecord,
  addRecord,
  deleteRecord
};
