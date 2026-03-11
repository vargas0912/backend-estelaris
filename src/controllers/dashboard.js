const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getDashboardKpis, getDashboardTrends, getTopProducts } = require('../services/dashboard');

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

module.exports = { getKpis, getTrends, getTopProductsHandler };
