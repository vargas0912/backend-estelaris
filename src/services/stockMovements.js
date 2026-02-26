const { stockMovements, products, branches } = require('../models/index');

const movementAttributes = [
  'id',
  'product_id',
  'branch_id',
  'reference_type',
  'reference_id',
  'qty_change',
  'notes',
  'created_by',
  'created_at'
];

const getAllMovements = async (filters = {}) => {
  const result = await stockMovements.findAll({
    attributes: movementAttributes,
    where: filters,
    order: [['created_at', 'DESC']]
  });

  return result;
};

const getMovementsByProduct = async (productId) => {
  const result = await stockMovements.findAll({
    attributes: movementAttributes,
    where: { product_id: productId },
    include: [
      {
        model: branches,
        as: 'branch',
        attributes: ['id', 'name']
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return result;
};

const getMovementsByBranch = async (branchId) => {
  const result = await stockMovements.findAll({
    attributes: movementAttributes,
    where: { branch_id: branchId },
    include: [
      {
        model: products,
        as: 'product',
        attributes: ['id', 'name']
      }
    ],
    order: [['created_at', 'DESC']]
  });

  return result;
};

const createMovement = async (data, transaction = null) => {
  const options = transaction ? { transaction } : {};
  const result = await stockMovements.create(data, options);
  return result;
};

module.exports = {
  getAllMovements,
  getMovementsByProduct,
  getMovementsByBranch,
  createMovement
};
