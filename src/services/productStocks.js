const { productStocks, stockMovements, products, branches } = require('../models/index');

const attributes = [
  'id',
  'product_id',
  'branch_id',
  'quantity',
  'min_stock',
  'max_stock',
  'location',
  'last_count_date',
  'purch_id',
  'bar_code',
  'created_at',
  'updated_at'
];

const productAttributes = ['id', 'name'];
const branchAttributes = ['id', 'name'];

const getAllProductStocks = async (branchId = null) => {
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

const getProductStock = async (purchId) => {
  const result = await productStocks.findAll({
    attributes,
    where: {
      purch_id: purchId
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

const getStocksByProduct = async (productId) => {
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

const getStocksByBranch = async (branchId) => {
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

const addNewProductStock = async (body) => {
  const result = await productStocks.create(body);

  return result;
};

const updateProductStock = async (id, req) => {
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

const deleteProductStock = async (id) => {
  const result = await productStocks.destroy({
    where: {
      id
    }
  });

  return result;
};

const updateFromPurchase = async (purchaseId, details, branchId, userId, transaction) => {
  // Agrupar detalles por product_id sumando qty si hay duplicados
  const grouped = {};
  for (const detail of details) {
    const pid = detail.product_id;
    const qty = parseFloat(detail.qty);
    grouped[pid] = (grouped[pid] || 0) + qty;
  }

  const today = new Date();

  for (const [productId, qty] of Object.entries(grouped)) {
    const barCode = `${productId}-${purchaseId}`;
    const minStock = parseFloat((qty * 0.25).toFixed(3));
    const maxStock = parseFloat((qty * 1.5).toFixed(3));

    const [stock, created] = await productStocks.findOrCreate({
      where: { product_id: productId, branch_id: branchId },
      defaults: {
        quantity: qty,
        min_stock: minStock,
        max_stock: maxStock,
        purch_id: purchaseId,
        bar_code: barCode,
        last_count_date: today
      },
      transaction
    });

    if (!created) {
      stock.quantity = qty;
      stock.purch_id = purchaseId;
      stock.bar_code = barCode;
      stock.last_count_date = today;
      await stock.save({ transaction });
    }

    await stockMovements.create({
      product_id: productId,
      branch_id: branchId,
      reference_type: 'purchase',
      reference_id: purchaseId,
      qty_change: qty,
      notes: `Recepción de compra #${purchaseId}`,
      created_by: userId
    }, { transaction });
  }
};

module.exports = {
  getAllProductStocks,
  getProductStock,
  getStocksByProduct,
  getStocksByBranch,
  addNewProductStock,
  updateProductStock,
  deleteProductStock,
  updateFromPurchase
};
