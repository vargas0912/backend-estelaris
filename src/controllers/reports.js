const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getDailyMovement, getAccountsReceivable, getInventoryReport } = require('../services/reports');

const getDailyMovementReport = async (req, res) => {
  try {
    const { branch_id: branchId, date } = matchedData(req);
    const report = await getDailyMovement(branchId, date);
    res.send({ report });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_DAILY_MOVEMENT -> ${error}`);
  }
};

const getAccountsReceivableReport = async (req, res) => {
  try {
    const { branch_id: branchId } = matchedData(req);
    const report = await getAccountsReceivable(branchId);
    res.send({ report });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_ACCOUNTS_RECEIVABLE -> ${error}`);
  }
};

const getInventoryReportController = async (req, res) => {
  try {
    const { branch_id: branchId, start_date: startDate, end_date: endDate } = matchedData(req);
    const report = await getInventoryReport(branchId, startDate, endDate);
    res.send({ report });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_INVENTORY_REPORT -> ${error}`);
  }
};

module.exports = { getDailyMovementReport, getAccountsReceivableReport, getInventoryReportController };
