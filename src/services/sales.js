const {
  sales, saleDetails, saleInstallments, salePayments, saleDeliveries,
  customers, customerAddresses, employees, branches, users, products,
  productStocks, stockMovements
} = require('../models/index');
const { sequelize } = require('../models/index');
const { Op } = require('sequelize');

const saleAttributes = [
  'id', 'branch_id', 'customer_id', 'customer_address_id', 'employee_id',
  'user_id', 'price_list_id', 'sales_date', 'sales_type', 'payment_periods',
  'total_days_term', 'invoice', 'subtotal', 'discount_amount', 'tax_amount',
  'sales_total', 'due_payment', 'due_date', 'status', 'notes',
  'created_at', 'updated_at'
];

const detailAttributes = [
  'id', 'sale_id', 'product_id', 'qty', 'unit_price', 'discount',
  'tax_rate', 'subtotal', 'purch_id', 'notes'
];

const installmentAttributes = [
  'id', 'sale_id', 'installment_number', 'due_date', 'amount',
  'paid_amount', 'status', 'paid_date'
];

const customerAttributes = ['id', 'name', 'email', 'phone', 'mobile'];
const addressAttributes = ['id', 'street', 'neighborhood', 'postal_code', 'address_type'];
const employeeAttributes = ['id', 'name'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];
const productAttributes = ['id', 'name'];

const saleIncludes = [
  { model: customers, as: 'customer', attributes: customerAttributes },
  { model: customerAddresses, as: 'customerAddress', attributes: addressAttributes },
  { model: employees, as: 'employee', attributes: employeeAttributes },
  { model: branches, as: 'branch', attributes: branchAttributes },
  { model: users, as: 'user', attributes: userAttributes },
  {
    model: saleDetails,
    as: 'details',
    attributes: detailAttributes,
    include: [{ model: products, as: 'product', attributes: productAttributes }]
  },
  { model: saleInstallments, as: 'installments', attributes: installmentAttributes }
];

const PERIOD_DAYS = { Semanal: 7, Quincenal: 15, Mensual: 30 };

const getAllSales = async (branchId) => {
  const where = branchId ? { branch_id: branchId } : {};
  return sales.findAll({
    attributes: saleAttributes,
    where,
    include: saleIncludes,
    order: [['sales_date', 'DESC']]
  });
};

const getSale = async (id) => {
  return sales.findOne({
    attributes: saleAttributes,
    where: { id },
    include: saleIncludes
  });
};

const getSalesByCustomer = async (customerId) => {
  return sales.findAll({
    attributes: saleAttributes,
    where: { customer_id: customerId },
    include: saleIncludes,
    order: [['sales_date', 'DESC']]
  });
};

const getSalesByBranch = async (branchId) => {
  return sales.findAll({
    attributes: saleAttributes,
    where: { branch_id: branchId },
    include: saleIncludes,
    order: [['sales_date', 'DESC']]
  });
};

const getOverdueSales = async () => {
  const today = new Date().toISOString().split('T')[0];

  return sales.findAll({
    attributes: saleAttributes,
    where: {
      sales_type: 'Credito',
      status: 'Pendiente',
      due_date: { [Op.lt]: today }
    },
    include: [
      { model: customers, as: 'customer', attributes: customerAttributes },
      { model: branches, as: 'branch', attributes: branchAttributes },
      {
        model: saleInstallments,
        as: 'installments',
        attributes: installmentAttributes,
        where: {
          status: 'Pendiente',
          due_date: { [Op.lt]: today }
        },
        required: false
      }
    ],
    order: [['due_date', 'ASC']]
  });
};

const createSale = async (body, userId) => {
  const {
    branch_id: branchId,
    customer_id: customerId,
    customer_address_id: customerAddressId,
    employee_id: employeeId,
    price_list_id: priceListId,
    sales_date: salesDate,
    sales_type: salesType = 'Contado',
    payment_periods: paymentPeriods,
    total_days_term: totalDaysTerm,
    invoice,
    notes,
    discount_amount: discountAmount = 0,
    items
  } = body;

  // Validar entidades
  const customer = await customers.findByPk(customerId, { attributes: ['id'] });
  if (!customer) return { error: 'CUSTOMER_NOT_FOUND' };

  const address = await customerAddresses.findOne({
    where: { id: customerAddressId, customer_id: customerId },
    attributes: ['id']
  });
  if (!address) return { error: 'ADDRESS_NOT_FOUND_OR_NOT_BELONGS_TO_CUSTOMER' };

  const employee = await employees.findByPk(employeeId, { attributes: ['id'] });
  if (!employee) return { error: 'EMPLOYEE_NOT_FOUND' };

  const branch = await branches.findByPk(branchId, { attributes: ['id'] });
  if (!branch) return { error: 'BRANCH_NOT_FOUND' };

  // Validar productos
  const productIds = items.map(i => i.product_id);
  const foundProducts = await products.findAll({
    where: { id: productIds, is_active: true },
    attributes: ['id']
  });
  if (foundProducts.length !== [...new Set(productIds)].length) {
    return { error: 'SOME_PRODUCTS_NOT_FOUND_OR_INACTIVE' };
  }

  // Calcular due_date para crédito
  let calculatedDueDate = null;
  if (salesType === 'Credito' && totalDaysTerm) {
    const base = new Date(salesDate);
    base.setDate(base.getDate() + parseInt(totalDaysTerm));
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
        subtotal: lineSubtotal,
        purch_id: item.purch_id || null,
        notes: item.notes || null
      };
    });

    // Calcular totales del header
    const subtotal = parseFloat(details.reduce((acc, d) => acc + d.subtotal, 0).toFixed(2));
    const taxAmount = parseFloat(details.reduce((acc, d) => {
      return acc + parseFloat((d.subtotal * d.tax_rate / 100).toFixed(2));
    }, 0).toFixed(2));
    const salesTotal = parseFloat((subtotal + taxAmount - parseFloat(discountAmount)).toFixed(2));

    // Determinar due_payment y status
    const isContado = salesType === 'Contado';
    const duePayment = isContado ? 0 : salesTotal;
    const status = isContado ? 'Pagado' : 'Pendiente';

    // Validar y decrementar stock
    for (const item of details) {
      const qty = parseFloat(item.qty);
      const barCode = item.purch_id ? `${item.product_id}-${item.purch_id}` : null;
      const stockWhere = barCode
        ? { bar_code: barCode, branch_id: branchId }
        : { product_id: item.product_id, branch_id: branchId };

      const stock = await productStocks.findOne({
        where: stockWhere,
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!stock || parseFloat(stock.quantity) < qty) {
        await transaction.rollback();
        return { error: `INSUFFICIENT_STOCK_FOR_PRODUCT_${item.product_id}` };
      }

      stock.quantity = parseFloat((parseFloat(stock.quantity) - qty).toFixed(3));
      stock.last_count_date = new Date();
      await stock.save({ transaction });
    }

    // Crear header
    const sale = await sales.create({
      branch_id: branchId,
      customer_id: customerId,
      customer_address_id: customerAddressId,
      employee_id: employeeId,
      user_id: userId,
      price_list_id: priceListId || null,
      sales_date: salesDate,
      sales_type: salesType,
      payment_periods: salesType === 'Credito' ? paymentPeriods : null,
      total_days_term: salesType === 'Credito' ? totalDaysTerm : null,
      invoice: invoice || null,
      subtotal,
      discount_amount: parseFloat(discountAmount),
      tax_amount: taxAmount,
      sales_total: salesTotal,
      due_payment: duePayment,
      due_date: calculatedDueDate,
      status,
      notes: notes || null
    }, { transaction });

    // Crear detalles
    const detailRecords = details.map(d => ({
      ...d,
      sale_id: sale.id,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await saleDetails.bulkCreate(detailRecords, { transaction });

    // Crear stockMovements
    for (const item of details) {
      await stockMovements.create({
        product_id: item.product_id,
        branch_id: branchId,
        reference_type: 'sale',
        reference_id: sale.id,
        qty_change: -parseFloat(item.qty),
        notes: `Venta #${sale.id}`,
        created_by: userId
      }, { transaction });
    }

    // Generar installments si es crédito
    if (salesType === 'Credito' && paymentPeriods && totalDaysTerm) {
      const periodDays = PERIOD_DAYS[paymentPeriods];
      const numInstallments = Math.ceil(parseInt(totalDaysTerm) / periodDays);
      const baseAmount = parseFloat((salesTotal / numInstallments).toFixed(2));
      const installments = [];

      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date(salesDate);
        dueDate.setDate(dueDate.getDate() + (periodDays * i));

        // Última cuota absorbe redondeo
        const amount = i === numInstallments
          ? parseFloat((salesTotal - baseAmount * (numInstallments - 1)).toFixed(2))
          : baseAmount;

        installments.push({
          sale_id: sale.id,
          installment_number: i,
          due_date: dueDate.toISOString().split('T')[0],
          amount,
          paid_amount: 0,
          status: 'Pendiente',
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      await saleInstallments.bulkCreate(installments, { transaction });
    }

    await transaction.commit();
    return getSale(sale.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateSale = async (id, body) => {
  const data = await sales.findByPk(id);
  if (!data) return { data: { msg: 'NOT_FOUND' } };

  if (data.status === 'Cancelado') {
    return { error: 'SALE_ALREADY_CANCELLED' };
  }

  const { invoice, notes } = body;
  data.invoice = invoice !== undefined ? invoice : data.invoice;
  data.notes = notes !== undefined ? notes : data.notes;

  const result = await data.save();
  return result;
};

const cancelSale = async (id, userId) => {
  const sale = await sales.findOne({
    where: { id },
    include: [
      { model: saleDetails, as: 'details', attributes: detailAttributes },
      { model: salePayments, as: 'payments', attributes: ['id'] },
      {
        model: saleDeliveries,
        as: 'deliveries',
        attributes: ['id', 'status'],
        where: { status: { [Op.in]: ['Recolectado', 'En_Transito', 'En_Ruta_Entrega'] } },
        required: false
      }
    ]
  });

  if (!sale) return { error: 'NOT_FOUND' };
  if (sale.status === 'Cancelado') return { error: 'SALE_ALREADY_CANCELLED' };

  // No cancelar si hay deliveries activos
  if (sale.deliveries && sale.deliveries.length > 0) {
    return { error: 'SALE_HAS_ACTIVE_DELIVERIES' };
  }

  // No cancelar si hay pagos activos
  const activePayments = await salePayments.count({ where: { sale_id: id } });
  if (activePayments > 0) {
    return { error: 'SALE_HAS_ACTIVE_PAYMENTS' };
  }

  const transaction = await sequelize.transaction();

  try {
    // Revertir stock
    for (const detail of sale.details) {
      const qty = parseFloat(detail.qty);
      const barCode = detail.purch_id ? `${detail.product_id}-${detail.purch_id}` : null;
      const stockWhere = barCode
        ? { bar_code: barCode, branch_id: sale.branch_id }
        : { product_id: detail.product_id, branch_id: sale.branch_id };

      const stock = await productStocks.findOne({
        where: stockWhere,
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (stock) {
        stock.quantity = parseFloat((parseFloat(stock.quantity) + qty).toFixed(3));
        stock.last_count_date = new Date();
        await stock.save({ transaction });
      }

      await stockMovements.create({
        product_id: detail.product_id,
        branch_id: sale.branch_id,
        reference_type: 'adjustment',
        reference_id: id,
        qty_change: qty,
        notes: `Reversal por cancelación de venta #${id}`,
        created_by: userId
      }, { transaction });
    }

    // Eliminar installments pendientes si es crédito
    if (sale.sales_type === 'Credito') {
      await saleInstallments.destroy({
        where: { sale_id: id, status: 'Pendiente' },
        transaction
      });
    }

    sale.status = 'Cancelado';
    sale.due_payment = 0;
    await sale.save({ transaction });

    await transaction.commit();
    return getSale(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteSale = async (id) => {
  const data = await sales.findByPk(id);
  if (!data) return { error: 'NOT_FOUND' };

  if (data.status !== 'Pendiente') {
    return { error: 'SALE_CANNOT_BE_DELETED' };
  }

  const activePayments = await salePayments.count({ where: { sale_id: id } });
  if (activePayments > 0) {
    return { error: 'SALE_HAS_ACTIVE_PAYMENTS' };
  }

  await sales.destroy({ where: { id } });
  return { deleted: true };
};

module.exports = {
  getAllSales,
  getSale,
  getSalesByCustomer,
  getSalesByBranch,
  getOverdueSales,
  createSale,
  updateSale,
  cancelSale,
  deleteSale
};
