const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const {
  getJournal: getJournalService,
  getLedger: getLedgerService,
  getTrialBalance: getTrialBalanceService,
  getBalanceSheet: getBalanceSheetService,
  getIncomeStatement: getIncomeStatementService
} = require('../services/accountingReports.service');

const getJournal = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    if (filters.period_id) filters.period_id = parseInt(filters.period_id);
    if (filters.branch_id) filters.branch_id = parseInt(filters.branch_id);
    const data = await getJournalService(filters);
    res.send({ vouchers: data });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_JOURNAL -> ${error}`, 400);
  }
};

const getLedger = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    if (filters.account_id) filters.account_id = parseInt(filters.account_id);
    if (filters.period_id) filters.period_id = parseInt(filters.period_id);
    const data = await getLedgerService(filters);
    res.send(data);
  } catch (error) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return handleHttpError(res, 'ACCOUNT_NOT_FOUND', 404);
    }
    handleHttpError(res, `ERROR_GET_LEDGER -> ${error}`, 400);
  }
};

const getTrialBalance = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    if (filters.period_id) filters.period_id = parseInt(filters.period_id);
    const data = await getTrialBalanceService(filters);
    res.send(data);
  } catch (error) {
    handleHttpError(res, `ERROR_GET_TRIAL_BALANCE -> ${error}`, 400);
  }
};

const getBalanceSheet = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    if (filters.period_id) filters.period_id = parseInt(filters.period_id);
    const data = await getBalanceSheetService(filters);
    res.send(data);
  } catch (error) {
    handleHttpError(res, `ERROR_GET_BALANCE_SHEET -> ${error}`, 400);
  }
};

const getIncomeStatement = async (req, res) => {
  try {
    const filters = matchedData(req, { locations: ['query'] });
    if (filters.period_id) filters.period_id = parseInt(filters.period_id);
    if (filters.branch_id) filters.branch_id = parseInt(filters.branch_id);
    const data = await getIncomeStatementService(filters);
    res.send(data);
  } catch (error) {
    handleHttpError(res, `ERROR_GET_INCOME_STATEMENT -> ${error}`, 400);
  }
};

module.exports = { getJournal, getLedger, getTrialBalance, getBalanceSheet, getIncomeStatement };
