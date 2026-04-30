const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getDailyMovement, getAccountsReceivable } = require('../services/reports');

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

module.exports = { getDailyMovementReport, getAccountsReceivableReport };
