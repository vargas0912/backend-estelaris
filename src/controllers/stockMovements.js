const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');
const { getMovementsByProduct } = require('../services/stockMovements');

const getMovementsByProductHandler = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const sortOrder = data.sortOrder ?? 'ASC';
    const { movements, total } = await getMovementsByProduct(data.product_id, page, limit, sortOrder);
    res.send(buildPaginationResponse('movements', movements, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_MOVEMENTS_BY_PRODUCT -> ${error}`, 400);
  }
};

module.exports = { getMovementsByProductHandler };
