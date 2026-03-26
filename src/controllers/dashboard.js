const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getDashboardKpis, getDashboardTrends, getTopProducts, getExpensesByMonth, getExpensesByBranch, getRecentSales, getSalesByBranch } = require('../services/dashboard');

const getKpis = async (req, res) => {
  try {
    const kpis = await getDashboardKpis();
    res.send({ kpis });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_DASHBOARD_KPIS -> ${error}`);
  }
};

const getTrends = async (req, res) => {
  try {
    const { months = 6 } = matchedData(req);
    const trends = await getDashboardTrends(months);
    res.send({ trends });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_DASHBOARD_TRENDS -> ${error}`);
  }
};

const getTopProductsHandler = async (req, res) => {
  try {
    const { limit = 10, months = 3 } = matchedData(req);
    const products = await getTopProducts(limit, months);
    res.send({ products });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_TOP_PRODUCTS -> ${error}`);
  }
};

const getExpensesByMonthHandler = async (req, res) => {
  try {
    const { months = 6 } = matchedData(req);
    const expensesByMonth = await getExpensesByMonth(months);
    res.send({ expensesByMonth });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_EXPENSES_BY_MONTH -> ${error}`);
  }
};

const getExpensesByBranchHandler = async (req, res) => {
  try {
    const { months = 6 } = matchedData(req);
    const expensesByBranch = await getExpensesByBranch(months);
    res.send({ expensesByBranch });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_EXPENSES_BY_BRANCH -> ${error}`);
  }
};

const getRecentSalesHandler = async (req, res) => {
  try {
    const { limit = 25 } = matchedData(req);
    const recentSales = await getRecentSales(limit);
    res.send({ recentSales });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECENT_SALES -> ${error}`);
  }
};

const getSalesByBranchHandler = async (req, res) => {
  try {
    const { months = 6 } = matchedData(req);
    const salesByBranch = await getSalesByBranch(months);
    res.send({ salesByBranch });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_SALES_BY_BRANCH -> ${error}`);
  }
};

module.exports = { getKpis, getTrends, getTopProductsHandler, getExpensesByMonthHandler, getExpensesByBranchHandler, getRecentSalesHandler, getSalesByBranchHandler };
