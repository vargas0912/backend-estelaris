const { salePayments, sales, saleInstallments, users } = require('../models/index');
const { sequelize } = require('../models/index');

const paymentAttributes = [
  'id', 'sale_id', 'payment_amount', 'payment_date', 'payment_method',
  'reference_number', 'user_id', 'notes', 'created_at', 'updated_at'
];

const userAttributes = ['id', 'name', 'email'];

const saleAttributes = [
  'id', 'customer_id', 'sales_date', 'status', 'sales_total',
  'due_payment', 'sales_type'
];

const paymentIncludes = [
  { model: sales, as: 'sale', attributes: saleAttributes },
  { model: users, as: 'user', attributes: userAttributes }
];

const getAllPayments = async () => {
  return salePayments.findAll({
    attributes: paymentAttributes,
    include: paymentIncludes,
    order: [['payment_date', 'DESC']]
  });
};

const getPaymentsBySale = async (saleId) => {
  return salePayments.findAll({
    attributes: paymentAttributes,
    where: { sale_id: saleId },
    include: paymentIncludes,
    order: [['payment_date', 'DESC']]
  });
};

const getPayment = async (id) => {
  return salePayments.findOne({
    attributes: paymentAttributes,
    where: { id },
    include: paymentIncludes
  });
};

const applyPaymentToInstallments = async (saleId, amount, transaction) => {
  const pendingInstallments = await saleInstallments.findAll({
    where: { sale_id: saleId, status: 'Pendiente' },
    order: [['installment_number', 'ASC']],
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  let remaining = amount;
  const today = new Date().toISOString().split('T')[0];

  for (const installment of pendingInstallments) {
    if (remaining <= 0) break;

    const owed = parseFloat((parseFloat(installment.amount) - parseFloat(installment.paid_amount)).toFixed(2));
    const applied = Math.min(remaining, owed);

    installment.paid_amount = parseFloat((parseFloat(installment.paid_amount) + applied).toFixed(2));

    if (installment.paid_amount >= parseFloat(installment.amount)) {
      installment.status = 'Pagado';
      installment.paid_date = today;
    }

    await installment.save({ transaction });
    remaining = parseFloat((remaining - applied).toFixed(2));
  }
};

const revertPaymentFromInstallments = async (saleId, amount, transaction) => {
  // Revert from most recent paid installments first
  const installments = await saleInstallments.findAll({
    where: { sale_id: saleId },
    order: [['installment_number', 'DESC']],
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  let remaining = amount;

  for (const installment of installments) {
    if (remaining <= 0) break;

    const paidAmount = parseFloat(installment.paid_amount);
    if (paidAmount <= 0) continue;

    const toRevert = Math.min(remaining, paidAmount);

    installment.paid_amount = parseFloat((paidAmount - toRevert).toFixed(2));

    if (installment.paid_amount < parseFloat(installment.amount)) {
      installment.status = 'Pendiente';
      installment.paid_date = null;
    }

    await installment.save({ transaction });
    remaining = parseFloat((remaining - toRevert).toFixed(2));
  }
};

const createPayment = async (body, userId) => {
  const {
    sale_id: saleId,
    payment_amount: paymentAmount,
    payment_date: paymentDate,
    payment_method: paymentMethod,
    reference_number: referenceNumber,
    notes
  } = body;

  const sale = await sales.findByPk(saleId, { attributes: saleAttributes });
  if (!sale) return { error: 'NOT_FOUND' };

  if (sale.status === 'Cancelado' || sale.status === 'Pagado') {
    return { error: 'SALE_NOT_PAYABLE' };
  }

  const amount = parseFloat(paymentAmount);
  const currentDue = parseFloat(sale.due_payment);

  if (amount > currentDue) {
    return { error: 'PAYMENT_EXCEEDS_DUE' };
  }

  const transaction = await sequelize.transaction();

  try {
    const saleForUpdate = await sales.findByPk(saleId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const newDue = parseFloat((parseFloat(saleForUpdate.due_payment) - amount).toFixed(2));
    const newStatus = newDue === 0 ? 'Pagado' : saleForUpdate.status;

    const payment = await salePayments.create({
      sale_id: saleId,
      payment_amount: amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      user_id: userId,
      notes: notes || null
    }, { transaction });

    await saleForUpdate.update(
      { due_payment: newDue, status: newStatus },
      { transaction }
    );

    // Auto-apply to installments
    if (sale.sales_type === 'Credito') {
      await applyPaymentToInstallments(saleId, amount, transaction);
    }

    await transaction.commit();
    return getPayment(payment.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deletePayment = async (id) => {
  const payment = await salePayments.findOne({
    attributes: paymentAttributes,
    where: { id },
    include: [{ model: sales, as: 'sale', attributes: saleAttributes }]
  });

  if (!payment) return { error: 'NOT_FOUND' };

  const transaction = await sequelize.transaction();

  try {
    const saleForUpdate = await sales.findByPk(payment.sale_id, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    const restoredAmount = parseFloat(payment.payment_amount);
    const newDue = parseFloat((parseFloat(saleForUpdate.due_payment) + restoredAmount).toFixed(2));

    let newStatus = saleForUpdate.status;
    if (saleForUpdate.status === 'Pagado') {
      newStatus = 'Pendiente';
    }

    await payment.destroy({ transaction });

    await saleForUpdate.update(
      { due_payment: newDue, status: newStatus },
      { transaction }
    );

    // Revert installments
    if (saleForUpdate.sales_type === 'Credito') {
      await revertPaymentFromInstallments(payment.sale_id, restoredAmount, transaction);
    }

    await transaction.commit();
    return { deleted: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getAllPayments,
  getPaymentsBySale,
  getPayment,
  createPayment,
  deletePayment
};
