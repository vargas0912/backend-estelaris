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

const productAttributes = ['id', 'name', 'cost_price', 'unit_of_measure'];
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
      where: { bar_code: barCode, branch_id: branchId },
      defaults: {
        product_id: productId,
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
      stock.quantity = parseFloat((parseFloat(stock.quantity) + qty).toFixed(3));
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

/**
 * Descuenta stock en origen (dispatch) e ingresa en destino (receive) para transferencias.
 *
 * @param {string} action  'dispatch' | 'receive'
 * @param {number} transferId
 * @param {Array}  details  transferDetails con product_id, qty, qty_received
 * @param {number} fromBranchId
 * @param {number} toBranchId
 * @param {number} userId
 * @param {object} transaction  Sequelize transaction
 */
const updateFromTransfer = async (action, transferId, details, fromBranchId, toBranchId, userId, transaction) => {
  const today = new Date();

  for (const detail of details) {
    const productId = detail.product_id;

    if (action === 'dispatch') {
      // Si el ítem tiene purch_id, operar por lote (bar_code); si no, fallback a product+branch
      const dispatchBarCode = detail.purch_id ? `${productId}-${detail.purch_id}` : null;
      const dispatchWhere = dispatchBarCode
        ? { bar_code: dispatchBarCode, branch_id: fromBranchId }
        : { product_id: productId, branch_id: fromBranchId };

      const originStock = await productStocks.findOne({
        where: dispatchWhere,
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      const qty = parseFloat(detail.qty);
      originStock.quantity = parseFloat((parseFloat(originStock.quantity) - qty).toFixed(3));
      originStock.last_count_date = today;
      await originStock.save({ transaction });

      await stockMovements.create({
        product_id: productId,
        branch_id: fromBranchId,
        reference_type: 'transfer',
        reference_id: transferId,
        qty_change: -qty,
        notes: `Salida por transferencia #${transferId}`,
        created_by: userId
      }, { transaction });
    }

    if (action === 'receive') {
      const qtyReceived = parseFloat(detail.qty_received);

      if (qtyReceived > 0) {
        const receiveBarCode = detail.purch_id ? `${productId}-${detail.purch_id}` : null;
        const receiveWhere = receiveBarCode
          ? { bar_code: receiveBarCode, branch_id: toBranchId }
          : { product_id: productId, branch_id: toBranchId };

        const [destStock, created] = await productStocks.findOrCreate({
          where: receiveWhere,
          defaults: {
            product_id: productId,
            quantity: qtyReceived,
            min_stock: parseFloat((qtyReceived * 0.25).toFixed(3)),
            max_stock: parseFloat((qtyReceived * 1.5).toFixed(3)),
            purch_id: detail.purch_id || null,
            bar_code: receiveBarCode,
            last_count_date: today
          },
          transaction
        });

        if (!created) {
          destStock.quantity = parseFloat((parseFloat(destStock.quantity) + qtyReceived).toFixed(3));
          destStock.last_count_date = today;
          await destStock.save({ transaction });
        }

        await stockMovements.create({
          product_id: productId,
          branch_id: toBranchId,
          reference_type: 'transfer',
          reference_id: transferId,
          qty_change: qtyReceived,
          notes: `Entrada por transferencia #${transferId}`,
          created_by: userId
        }, { transaction });
      }
    }
  }
};

/**
 * Revierte el descuento de stock en origen cuando se cancela una transferencia En_Transito.
 */
const revertFromTransfer = async (transferId, details, fromBranchId, userId, transaction) => {
  const today = new Date();

  for (const detail of details) {
    const productId = detail.product_id;
    const qty = parseFloat(detail.qty);

    const originStock = await productStocks.findOne({
      where: { product_id: productId, branch_id: fromBranchId },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (originStock) {
      originStock.quantity = parseFloat((parseFloat(originStock.quantity) + qty).toFixed(3));
      originStock.last_count_date = today;
      await originStock.save({ transaction });
    }

    await stockMovements.create({
      product_id: productId,
      branch_id: fromBranchId,
      reference_type: 'adjustment',
      reference_id: transferId,
      qty_change: qty,
      notes: `Reversal por cancelación de transferencia #${transferId}`,
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
  updateFromPurchase,
  updateFromTransfer,
  revertFromTransfer
};
