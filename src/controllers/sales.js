const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const {
  getAllSales,
  getSale,
  getSalesByCustomer,
  getSalesByBranch,
  getOverdueSales,
  createSale,
  updateSale,
  cancelSale,
  deleteSale
} = require('../services/sales');

const getRecords = async (req, res) => {
  try {
    const salesList = await getAllSales(req.branchId);
    res.send({ sales: salesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const sale = await getSale(id);

    if (!sale) {
      handleHttpError(res, `SALE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ sale });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const getRecordsByCustomer = async (req, res) => {
  try {
    const { customer_id: customerId } = matchedData(req);
    const salesList = await getSalesByCustomer(customerId);
    res.send({ sales: salesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_CUSTOMER -> ${error}`, 400);
  }
};

const getRecordsByBranch = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const salesList = await getSalesByBranch(branchId);
    res.send({ sales: salesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

const getOverdueRecords = async (req, res) => {
  try {
    const salesList = await getOverdueSales();
    res.send({ sales: salesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_OVERDUE_RECORDS -> ${error}`);
  }
};

const addRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const userId = req.user.id;

    const sale = await createSale(data, userId);

    if (sale && sale.error) {
      const is422 = sale.error.startsWith('INSUFFICIENT_') || sale.error.startsWith('POINTS_');
      const status = is422 ? 422 : 400;
      handleHttpError(res, sale.error, status);
      return;
    }

    res.send({ sale });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const sale = await updateSale(data.id, data);

    if (sale && sale.error) {
      handleHttpError(res, sale.error, 400);
      return;
    }

    if (sale && sale.data && sale.data.msg === 'NOT_FOUND') {
      handleHttpError(res, `SALE ${data.id} NOT EXISTS`, 404);
      return;
    }

    res.send({ sale });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const cancelRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const userId = req.user.id;
    const result = await cancelSale(id, userId);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `SALE ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ sale: result });
  } catch (error) {
    handleHttpError(res, `ERROR_CANCEL_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteSale(id);

    if (result && result.error === 'NOT_FOUND') {
      handleHttpError(res, `SALE ${id} NOT EXISTS`, 404);
      return;
    }

    if (result && result.error) {
      handleHttpError(res, result.error, 422);
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
  getRecordsByCustomer,
  getRecordsByBranch,
  getOverdueRecords,
  addRecord,
  updateRecord,
  cancelRecord,
  deleteRecord
};
