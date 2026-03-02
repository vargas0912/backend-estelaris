const { Op } = require('sequelize');
const { transfers, transferDetails, branches, users, employees, products, productStocks, sequelize } = require('../models/index');
const { updateFromTransfer, revertFromTransfer } = require('./productStocks');

const transferAttributes = [
  'id', 'from_branch_id', 'to_branch_id', 'transfer_date', 'status',
  'user_id', 'received_by', 'driver_id', 'transport_plate', 'notes',
  'received_at', 'created_at', 'updated_at'
];

const detailAttributes = [
  'id', 'transfer_id', 'product_id', 'qty', 'qty_received', 'unit_cost', 'purch_id', 'notes'
];

const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];
const employeeAttributes = ['id', 'name'];
const productAttributes = ['id', 'name'];

const transferIncludes = [
  { model: branches, as: 'fromBranch', attributes: branchAttributes },
  { model: branches, as: 'toBranch', attributes: branchAttributes },
  { model: users, as: 'user', attributes: userAttributes },
  { model: users, as: 'receiver', attributes: userAttributes },
  { model: employees, as: 'driver', attributes: employeeAttributes },
  {
    model: transferDetails,
    as: 'details',
    attributes: detailAttributes,
    include: [{ model: products, as: 'product', attributes: productAttributes }]
  }
];

const getTransfer = async (id, reqBranchId) => {
  const transfer = await transfers.findOne({
    attributes: transferAttributes,
    where: { id },
    include: transferIncludes
  });

  if (!transfer) return null;

  if (reqBranchId && transfer.from_branch_id !== reqBranchId && transfer.to_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  return transfer;
};

const getAllTransfers = async (reqBranchId) => {
  const where = reqBranchId
    ? { [Op.or]: [{ from_branch_id: reqBranchId }, { to_branch_id: reqBranchId }] }
    : {};

  return transfers.findAll({
    attributes: transferAttributes,
    where,
    include: transferIncludes,
    order: [['transfer_date', 'DESC']]
  });
};

const getTransfersByFromBranch = async (paramBranchId, reqBranchId) => {
  if (reqBranchId && reqBranchId !== paramBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  return transfers.findAll({
    attributes: transferAttributes,
    where: { from_branch_id: paramBranchId },
    include: transferIncludes,
    order: [['transfer_date', 'DESC']]
  });
};

const getTransfersByToBranch = async (paramBranchId, reqBranchId) => {
  if (reqBranchId && reqBranchId !== paramBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  return transfers.findAll({
    attributes: transferAttributes,
    where: { to_branch_id: paramBranchId },
    include: transferIncludes,
    order: [['transfer_date', 'DESC']]
  });
};

const createTransfer = async (body, userId, reqBranchId) => {
  if (reqBranchId && body.from_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  const {
    from_branch_id: fromBranchId,
    to_branch_id: toBranchId,
    transfer_date: transferDate,
    driver_id: driverId,
    transport_plate: transportPlate,
    notes,
    items
  } = body;

  if (fromBranchId === toBranchId) {
    return { error: 'SAME_BRANCH_NOT_ALLOWED' };
  }

  // Validar que todos los productos existen y están activos
  const productIds = items.map(i => i.product_id);
  const foundProducts = await products.findAll({
    where: { id: productIds, is_active: true },
    attributes: ['id']
  });

  if (foundProducts.length !== productIds.length) {
    return { error: 'SOME_PRODUCTS_NOT_FOUND_OR_INACTIVE' };
  }

  const transaction = await sequelize.transaction();

  try {
    const transfer = await transfers.create({
      from_branch_id: fromBranchId,
      to_branch_id: toBranchId,
      transfer_date: transferDate,
      status: 'Borrador',
      user_id: userId,
      driver_id: driverId || null,
      transport_plate: transportPlate || null,
      notes: notes || null
    }, { transaction });

    const detailRecords = items.map(item => ({
      transfer_id: transfer.id,
      product_id: item.product_id,
      qty: parseFloat(item.qty),
      unit_cost: parseFloat(item.unit_cost),
      purch_id: item.purch_id || null,
      notes: item.notes || null,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await transferDetails.bulkCreate(detailRecords, { transaction });

    await transaction.commit();

    return getTransfer(transfer.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateTransfer = async (id, body, reqBranchId) => {
  const transfer = await transfers.findByPk(id);

  if (!transfer) {
    return { error: 'NOT_FOUND' };
  }

  if (reqBranchId && transfer.from_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  if (transfer.status !== 'Borrador') {
    return { error: 'TRANSFER_CANNOT_BE_UPDATED' };
  }

  const {
    transfer_date: transferDate,
    driver_id: driverId,
    transport_plate: transportPlate,
    notes
  } = body;

  transfer.transfer_date = transferDate || transfer.transfer_date;
  transfer.driver_id = driverId !== undefined ? driverId : transfer.driver_id;
  transfer.transport_plate = transportPlate !== undefined ? transportPlate : transfer.transport_plate;
  transfer.notes = notes !== undefined ? notes : transfer.notes;

  await transfer.save();

  return getTransfer(id);
};

const dispatchTransfer = async (id, userId, reqBranchId) => {
  const transfer = await transfers.findOne({
    where: { id },
    include: [{ model: transferDetails, as: 'details', attributes: detailAttributes }]
  });

  if (!transfer) {
    return { error: 'NOT_FOUND' };
  }

  if (reqBranchId && transfer.from_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  if (transfer.status !== 'Borrador') {
    return { error: 'TRANSFER_CANNOT_BE_DISPATCHED' };
  }

  const transaction = await sequelize.transaction();

  try {
    // Verificar stock suficiente en origen (SELECT FOR UPDATE)
    for (const detail of transfer.details) {
      const stock = await productStocks.findOne({
        where: { product_id: detail.product_id, branch_id: transfer.from_branch_id },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!stock || parseFloat(stock.quantity) < parseFloat(detail.qty)) {
        await transaction.rollback();
        return { error: 'INSUFFICIENT_STOCK', product_id: detail.product_id };
      }
    }

    transfer.status = 'En_Transito';
    await transfer.save({ transaction });

    await updateFromTransfer('dispatch', id, transfer.details, transfer.from_branch_id, transfer.to_branch_id, userId, transaction);

    await transaction.commit();

    return getTransfer(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const receiveTransfer = async (id, receivedItems, userId, reqBranchId) => {
  const transfer = await transfers.findOne({
    where: { id },
    include: [{ model: transferDetails, as: 'details', attributes: detailAttributes }]
  });

  if (!transfer) {
    return { error: 'NOT_FOUND' };
  }

  if (reqBranchId && transfer.to_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  if (transfer.status !== 'En_Transito') {
    return { error: 'TRANSFER_CANNOT_BE_RECEIVED' };
  }

  // Validar que qty_received <= qty enviado por ítem
  for (const item of receivedItems) {
    const detail = transfer.details.find(d => d.id === item.detail_id);
    if (!detail) {
      return { error: 'DETAIL_NOT_FOUND', detail_id: item.detail_id };
    }
    if (parseFloat(item.qty_received) > parseFloat(detail.qty)) {
      return { error: 'QTY_RECEIVED_EXCEEDS_QTY_SENT', detail_id: item.detail_id };
    }
  }

  const transaction = await sequelize.transaction();

  try {
    // Actualizar qty_received por detalle
    for (const item of receivedItems) {
      await transferDetails.update(
        { qty_received: parseFloat(item.qty_received) },
        { where: { id: item.detail_id }, transaction }
      );
    }

    transfer.status = 'Recibido';
    transfer.received_by = userId;
    transfer.received_at = new Date().toISOString().slice(0, 10);
    await transfer.save({ transaction });

    // Refrescar details con qty_received actualizados
    const updatedDetails = receivedItems.map(item => {
      const detail = transfer.details.find(d => d.id === item.detail_id);
      return { ...detail.dataValues, qty_received: parseFloat(item.qty_received) };
    });

    await updateFromTransfer('receive', id, updatedDetails, transfer.from_branch_id, transfer.to_branch_id, userId, transaction);

    await transaction.commit();

    return getTransfer(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteTransfer = async (id, userId, reqBranchId) => {
  const transfer = await transfers.findOne({
    where: { id },
    include: [{ model: transferDetails, as: 'details', attributes: detailAttributes }]
  });

  if (!transfer) {
    return { error: 'NOT_FOUND' };
  }

  if (reqBranchId && transfer.from_branch_id !== reqBranchId) {
    return { error: 'BRANCH_ACCESS_DENIED' };
  }

  if (!['Borrador', 'En_Transito'].includes(transfer.status)) {
    return { error: 'TRANSFER_CANNOT_BE_DELETED' };
  }

  const transaction = await sequelize.transaction();

  try {
    if (transfer.status === 'En_Transito') {
      // Revertir stock en origen
      await revertFromTransfer(id, transfer.details, transfer.from_branch_id, userId, transaction);
    }

    transfer.status = 'Cancelado';
    await transfer.save({ transaction });

    await transfers.destroy({ where: { id }, transaction });

    await transaction.commit();

    return { deleted: 1 };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getAllTransfers,
  getTransfersByFromBranch,
  getTransfersByToBranch,
  getTransfer,
  createTransfer,
  updateTransfer,
  dispatchTransfer,
  receiveTransfer,
  deleteTransfer
};
