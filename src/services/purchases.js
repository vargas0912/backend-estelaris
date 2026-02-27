const { purchases, purchaseDetails, suppliers, branches, users, products } = require('../models/index');
const { sequelize } = require('../models/index');
const { updateFromPurchase } = require('./productStocks');

const purchaseAttributes = [
  'id',
  'supplier_id',
  'branch_id',
  'user_id',
  'purch_date',
  'invoice_number',
  'purch_type',
  'payment_method',
  'status',
  'subtotal',
  'discount_amount',
  'tax_amount',
  'purch_total',
  'due_payment',
  'due_date',
  'notes',
  'received_at',
  'created_at',
  'updated_at'
];

const detailAttributes = [
  'id',
  'purch_id',
  'product_id',
  'qty',
  'unit_price',
  'discount',
  'tax_rate',
  'subtotal'
];

const supplierAttributes = ['id', 'name', 'trade_name', 'tax_id', 'payment_days'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];
const productAttributes = ['id', 'name'];

const detailIncludes = [
  {
    model: products,
    as: 'product',
    attributes: productAttributes
  }
];

const purchaseIncludes = [
  {
    model: suppliers,
    as: 'supplier',
    attributes: supplierAttributes
  },
  {
    model: branches,
    as: 'branch',
    attributes: branchAttributes
  },
  {
    model: users,
    as: 'user',
    attributes: userAttributes
  },
  {
    model: purchaseDetails,
    as: 'details',
    attributes: detailAttributes,
    include: detailIncludes
  }
];

const getAllPurchases = async (branchId) => {
  const where = branchId ? { branch_id: branchId } : {};
  const result = await purchases.findAll({
    attributes: purchaseAttributes,
    where,
    include: purchaseIncludes,
    order: [['purch_date', 'DESC']]
  });

  return result;
};

const getPurchase = async (id) => {
  const result = await purchases.findOne({
    attributes: purchaseAttributes,
    where: { id },
    include: purchaseIncludes
  });

  return result;
};

const getPurchasesBySupplier = async (supplierId) => {
  const result = await purchases.findAll({
    attributes: purchaseAttributes,
    where: { supplier_id: supplierId },
    include: purchaseIncludes,
    order: [['purch_date', 'DESC']]
  });

  return result;
};

const getPurchasesByBranch = async (branchId) => {
  const result = await purchases.findAll({
    attributes: purchaseAttributes,
    where: { branch_id: branchId },
    include: purchaseIncludes,
    order: [['purch_date', 'DESC']]
  });

  return result;
};

const createPurchase = async (body, userId) => {
  const {
    supplier_id: supplierId,
    branch_id: branchId,
    purch_date: purchDate,
    invoice_number: invoiceNumber,
    purch_type: purchType,
    payment_method: paymentMethod,
    notes,
    discount_amount: discountAmount = 0,
    items
  } = body;

  // Validar que todos los productos existen y están activos
  const productIds = items.map(i => i.product_id);
  const foundProducts = await products.findAll({
    where: { id: productIds, is_active: true },
    attributes: ['id']
  });

  if (foundProducts.length !== productIds.length) {
    return { error: 'SOME_PRODUCTS_NOT_FOUND_OR_INACTIVE' };
  }

  // Calcular due_date desde payment_days del proveedor
  const supplier = await suppliers.findByPk(supplierId, {
    attributes: ['id', 'payment_days']
  });

  let calculatedDueDate = null;
  const effectivePurchType = purchType || 'Contado';
  if (effectivePurchType === 'Credito' && supplier?.payment_days) {
    const base = new Date(purchDate);
    base.setDate(base.getDate() + supplier.payment_days);
    calculatedDueDate = base.toISOString().split('T')[0];
  }

  const transaction = await sequelize.transaction();

  try {
    // Calcular subtotales por línea
    const details = items.map(item => {
      const qty = parseFloat(item.qty);
      const unitPrice = parseFloat(item.unit_price);
      const discount = parseFloat(item.discount || 0);
      const taxRate = parseFloat(item.tax_rate !== undefined ? item.tax_rate : 16);
      const lineSubtotal = parseFloat((qty * unitPrice * (1 - discount / 100)).toFixed(2));

      return {
        product_id: item.product_id,
        qty,
        unit_price: unitPrice,
        discount,
        tax_rate: taxRate,
        subtotal: lineSubtotal
      };
    });

    // Calcular totales del encabezado
    const subtotal = parseFloat(details.reduce((acc, d) => acc + d.subtotal, 0).toFixed(2));
    const taxAmount = parseFloat(details.reduce((acc, d) => {
      return acc + parseFloat((d.subtotal * d.tax_rate / 100).toFixed(2));
    }, 0).toFixed(2));
    const purchTotal = parseFloat((subtotal + taxAmount - parseFloat(discountAmount)).toFixed(2));

    // Crear encabezado
    const purchase = await purchases.create({
      supplier_id: supplierId,
      branch_id: branchId,
      user_id: userId,
      purch_date: purchDate,
      invoice_number: invoiceNumber || null,
      purch_type: purchType || 'Contado',
      payment_method: paymentMethod || null,
      status: 'Pendiente',
      subtotal,
      discount_amount: parseFloat(discountAmount),
      tax_amount: taxAmount,
      purch_total: purchTotal,
      due_payment: purchTotal,
      due_date: calculatedDueDate,
      notes: notes || null
    }, { transaction });

    // Crear detalles
    const detailRecords = details.map(d => ({
      ...d,
      purch_id: purchase.id,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await purchaseDetails.bulkCreate(detailRecords, { transaction });

    await transaction.commit();

    const result = await getPurchase(purchase.id);
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updatePurchase = async (id, body) => {
  const data = await purchases.findByPk(id);

  if (!data) {
    return { data: { msg: 'NOT_FOUND' } };
  }

  if (data.status === 'Cancelado') {
    return { error: 'PURCHASE_ALREADY_CANCELLED' };
  }

  const {
    status,
    payment_method: paymentMethod,
    notes,
    due_date: dueDate,
    due_payment: duePayment,
    invoice_number: invoiceNumber
  } = body;

  data.status = status || data.status;
  data.payment_method = paymentMethod !== undefined ? paymentMethod : data.payment_method;
  data.notes = notes !== undefined ? notes : data.notes;
  data.due_date = dueDate !== undefined ? dueDate : data.due_date;
  data.due_payment = duePayment !== undefined ? duePayment : data.due_payment;
  data.invoice_number = invoiceNumber !== undefined ? invoiceNumber : data.invoice_number;

  const result = await data.save();
  return result;
};

const cancelPurchase = async (id) => {
  const data = await purchases.findByPk(id);

  if (!data) {
    return { error: 'NOT_FOUND' };
  }

  if (data.status === 'Cancelado') {
    return { error: 'PURCHASE_ALREADY_CANCELLED' };
  }

  data.status = 'Cancelado';
  const result = await data.save();
  return result;
};

const deletePurchase = async (id) => {
  const data = await purchases.findByPk(id);

  if (!data) {
    return { error: 'NOT_FOUND' };
  }

  if (data.status !== 'Pendiente') {
    return { error: 'PURCHASE_CANNOT_BE_DELETED' };
  }

  const result = await purchases.destroy({ where: { id } });
  return result;
};

const receivePurchase = async (id, userId) => {
  const purchase = await purchases.findOne({
    where: { id },
    include: [
      {
        model: purchaseDetails,
        as: 'details',
        attributes: detailAttributes
      }
    ]
  });

  if (!purchase) {
    return { error: 'NOT_FOUND' };
  }

  if (purchase.status !== 'Pendiente') {
    return { error: 'PURCHASE_CANNOT_BE_RECEIVED' };
  }

  const transaction = await sequelize.transaction();

  try {
    purchase.status = 'Recibido';
    purchase.received_at = new Date().toISOString().slice(0, 10);
    await purchase.save({ transaction });

    await updateFromPurchase(id, purchase.details, purchase.branch_id, userId, transaction);

    await transaction.commit();

    const result = await getPurchase(id);
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getAllPurchases,
  getPurchase,
  getPurchasesBySupplier,
  getPurchasesByBranch,
  createPurchase,
  updatePurchase,
  cancelPurchase,
  deletePurchase,
  receivePurchase
};
