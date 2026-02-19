const { productStocks, products, branches } = require('../models/index');

const attributes = [
  'id',
  'product_id',
  'branch_id',
  'quantity',
  'min_stock',
  'max_stock',
  'location',
  'last_count_date',
  'created_at',
  'updated_at'
];

const productAttributes = ['id', 'sku', 'name'];
const branchAttributes = ['id', 'name'];

const getAllProductStocks = async(branchId = null) => {
  const where = branchId !== null ? { branch_id: branchId } : {};

  const result = await productStocks.findAll({
    attributes,
    where,
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const getProductStock = async(id) => {
  const result = await productStocks.findOne({
    attributes,
    where: {
      id
    },
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      },
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const getStocksByProduct = async(productId) => {
  const result = await productStocks.findAll({
    attributes,
    where: {
      product_id: productId
    },
    include: [
      {
        model: branches,
        as: 'branch',
        attributes: branchAttributes
      }
    ]
  });

  return result;
};

const getStocksByBranch = async(branchId) => {
  const result = await productStocks.findAll({
    attributes,
    where: {
      branch_id: branchId
    },
    include: [
      {
        model: products,
        as: 'product',
        attributes: productAttributes
      }
    ]
  });

  return result;
};

const addNewProductStock = async(body) => {
  const result = await productStocks.create(body);

  return result;
};

const updateProductStock = async(id, req) => {
  const {
    product_id: productId,
    branch_id: branchId,
    quantity,
    min_stock: minStock,
    max_stock: maxStock,
    location,
    last_count_date: lastCountDate
  } = req;

  const data = await productStocks.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.product_id = productId || data.product_id;
  data.branch_id = branchId || data.branch_id;
  data.quantity = quantity !== undefined ? quantity : data.quantity;
  data.min_stock = minStock !== undefined ? minStock : data.min_stock;
  data.max_stock = maxStock !== undefined ? maxStock : data.max_stock;
  data.location = location !== undefined ? location : data.location;
  data.last_count_date = lastCountDate !== undefined ? lastCountDate : data.last_count_date;

  const result = await data.save();
  return result;
};

const deleteProductStock = async(id) => {
  const result = await productStocks.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = {
  getAllProductStocks,
  getProductStock,
  getStocksByProduct,
  getStocksByBranch,
  addNewProductStock,
  updateProductStock,
  deleteProductStock
};
