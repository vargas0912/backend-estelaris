const { purchasePayments, purchases, users } = require('../models/index');
const { sequelize } = require('../models/index');
const accountingEngine = require('./accountingEngine.service');

const paymentAttributes = [
  'id',
  'purch_id',
  'payment_amount',
  'payment_date',
  'payment_method',
  'reference_number',
  'user_id',
  'notes',
  'created_at',
  'updated_at'
];

const userAttributes = ['id', 'name', 'email'];

const purchaseAttributes = [
  'id',
  'supplier_id',
  'purch_date',
  'status',
  'purch_total',
  'due_payment',
  'received_at'
];

const paymentIncludes = [
  {
    model: purchases,
    as: 'purchase',
    attributes: purchaseAttributes
  },
  {
    model: users,
    as: 'user',
    attributes: userAttributes
  }
];

const getAllPayments = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await purchasePayments.findAndCountAll({
    attributes: paymentAttributes,
    include: paymentIncludes,
    order: [['payment_date', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  return { payments: rows, total: count };
};

const getPaymentsByPurchase = async (purchId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await purchasePayments.findAndCountAll({
    attributes: paymentAttributes,
    where: { purch_id: purchId },
    include: paymentIncludes,
    order: [['payment_date', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  return { payments: rows, total: count };
};

const getPayment = async (id) => {
  const result = await purchasePayments.findOne({
    attributes: paymentAttributes,
    where: { id },
    include: paymentIncludes
  });

  return result;
};

const createPayment = async (body, userId) => {
  const {
    purch_id: purchId,
    payment_amount: paymentAmount,
    payment_date: paymentDate,
    payment_method: paymentMethod,
    reference_number: referenceNumber,
    notes
  } = body;

  const purchase = await purchases.findByPk(purchId, {
    attributes: purchaseAttributes
  });

  if (!purchase) {
    return { error: 'NOT_FOUND' };
  }

  if (purchase.status === 'Cancelado' || purchase.status === 'Pagado') {
    return { error: 'PURCHASE_NOT_PAYABLE' };
  }

  const amount = parseFloat(paymentAmount);
  const currentDue = parseFloat(purchase.due_payment);

  if (amount > currentDue) {
    return { error: 'PAYMENT_EXCEEDS_DUE' };
  }

  const transaction = await sequelize.transaction();

  try {
    const purchaseForUpdate = await purchases.findByPk(purchId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const newDue = parseFloat((parseFloat(purchaseForUpdate.due_payment) - amount).toFixed(2));
    const newStatus = newDue === 0 ? 'Pagado' : purchaseForUpdate.status;

    const payment = await purchasePayments.create({
      purch_id: purchId,
      payment_amount: amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      user_id: userId,
      notes: notes || null
    }, { transaction });

    await purchaseForUpdate.update(
      { due_payment: newDue, status: newStatus },
      { transaction }
    );

    await transaction.commit();

    const result = await getPayment(payment.id);

    // Fire and forget — no bloquea, no lanza si falla
    accountingEngine.generateFromPurchasePayment(payment.id).catch(err =>
      console.error('[AccountingEngine] Error generando póliza:', err.message)
    );

    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deletePayment = async (id) => {
  const payment = await purchasePayments.findOne({
    attributes: paymentAttributes,
    where: { id },
    include: [
      {
        model: purchases,
        as: 'purchase',
        attributes: purchaseAttributes
      }
    ]
  });

  if (!payment) {
    return { error: 'NOT_FOUND' };
  }

  const transaction = await sequelize.transaction();

  try {
    const purchaseForUpdate = await purchases.findByPk(payment.purch_id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const restoredAmount = parseFloat(payment.payment_amount);
    const newDue = parseFloat((parseFloat(purchaseForUpdate.due_payment) + restoredAmount).toFixed(2));

    let newStatus = purchaseForUpdate.status;
    if (purchaseForUpdate.status === 'Pagado') {
      newStatus = purchaseForUpdate.received_at ? 'Recibido' : 'Pendiente';
    }

    await payment.destroy({ transaction });

    await purchaseForUpdate.update(
      { due_payment: newDue, status: newStatus },
      { transaction }
    );

    await transaction.commit();

    return { deleted: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getAllPayments,
  getPaymentsByPurchase,
  getPayment,
  createPayment,
  deletePayment
};
