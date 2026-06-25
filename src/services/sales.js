const {
  sales, saleDetails, saleInstallments, salePayments, saleDeliveries,
  customers, customerAddresses, employees, branches, users, products,
  productStocks, stockMovements, campaignProducts, accountingVouchers: avModel
} = require('../models/index');
const { sequelize } = require('../models/index');
const { Op } = require('sequelize');
const accountingEngine = require('./accountingEngine.service');
const { cancelVoucher } = require('./accountingVouchers');
const { TICKET_CONFIG, SORT_WHITELIST } = require('../constants/sales');
const {
  getActiveConfig,
  getOrCreateCustomerPoints,
  calculateEarnedPoints,
  validateRedeem,
  redeemPoints,
  earnPoints,
  voidRedeemPoints,
  voidEarnPoints
} = require('./loyaltyPoints');
const { LOYALTY_ERRORS } = require('../constants/loyaltyPoints');

const generateTicket = (branchId, branchTicketPrefix, salesDate, saleId) => {
  const yy = salesDate.substring(2, 4);
  const prefix = branchTicketPrefix
    ? branchTicketPrefix.toUpperCase()
    : String(branchId).padStart(TICKET_CONFIG.PREFIX_FALLBACK_PADDING, '0');
  const seq = String(saleId).padStart(TICKET_CONFIG.ID_PADDING, '0');
  return `${prefix}-${yy}-${seq}`;
};

const saleAttributes = [
  'id', 'branch_id', 'customer_id', 'customer_address_id', 'employee_id',
  'user_id', 'price_list_id', 'sales_date', 'sales_type', 'payment_periods',
  'total_days_term', 'ticket', 'invoice', 'subtotal', 'discount_amount', 'anticipo_amount',
  'points_redeemed', 'points_discount', 'points_earned',
  'tax_amount', 'sales_total', 'due_payment', 'due_date', 'status', 'delivery_status', 'notes',
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
    separate: true,
    attributes: detailAttributes,
    include: [{ model: products, as: 'product', attributes: productAttributes }]
  },
  { model: saleInstallments, as: 'installments', separate: true, attributes: installmentAttributes }
];

const PERIOD_DAYS = { Semanal: 7, Quincenal: 15, Mensual: 30 };

const sanitizeSort = (sortBy, sortOrder) => ({
  safeSortBy: SORT_WHITELIST.includes(sortBy) ? sortBy : 'id',
  safeSortOrder: sortOrder === 'ASC' ? 'ASC' : 'DESC'
});

const getAllSales = async (branchId, page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'DESC', salesType = null) => {
  const offset = (page - 1) * limit;
  const { safeSortBy, safeSortOrder } = sanitizeSort(sortBy, sortOrder);
  const where = branchId ? { branch_id: branchId } : {};
  if (search) where.ticket = { [Op.like]: `%${search}%` };
  if (salesType) where.sales_type = salesType;
  const { count, rows } = await sales.findAndCountAll({
    attributes: saleAttributes,
    where,
    include: saleIncludes,
    order: [[safeSortBy, safeSortOrder]],
    limit,
    offset
  });
  return { sales: rows, total: count };
};

const getSale = async (id) => {
  return sales.findOne({
    attributes: saleAttributes,
    where: { id },
    include: saleIncludes
  });
};

const getSalesByCustomer = async (customerId, page = 1, limit = 20, search = '', salesType = null) => {
  const offset = (page - 1) * limit;
  const where = { customer_id: customerId };
  if (search) where.ticket = { [Op.like]: `%${search}%` };
  if (salesType) where.sales_type = salesType;
  const { count, rows } = await sales.findAndCountAll({
    attributes: saleAttributes,
    where,
    include: saleIncludes,
    order: [['sales_date', 'DESC']],
    limit,
    offset
  });
  return { sales: rows, total: count };
};

const getSalesByBranch = async (branchId, page = 1, limit = 20, search = '', sortBy = 'id', sortOrder = 'DESC', salesType = null) => {
  const offset = (page - 1) * limit;
  const { safeSortBy, safeSortOrder } = sanitizeSort(sortBy, sortOrder);
  const where = { branch_id: branchId };
  if (search) where.ticket = { [Op.like]: `%${search}%` };
  if (salesType) where.sales_type = salesType;
  const { count, rows } = await sales.findAndCountAll({
    attributes: saleAttributes,
    where,
    include: saleIncludes,
    order: [[safeSortBy, safeSortOrder]],
    limit,
    offset
  });
  return { sales: rows, total: count };
};

const getOverdueSales = async (page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  const today = new Date().toISOString().split('T')[0];

  const overdueRows = await saleInstallments.findAll({
    where: { status: 'Pendiente', due_date: { [Op.lt]: today } },
    attributes: ['sale_id'],
    group: ['sale_id']
  });
  const overdueSaleIds = overdueRows.map(r => r.sale_id);
  if (overdueSaleIds.length === 0) return { sales: [], total: 0 };

  const where = {
    id: { [Op.in]: overdueSaleIds },
    sales_type: 'Credito',
    status: 'Pendiente'
  };
  if (search) where.ticket = { [Op.like]: `%${search}%` };

  const { count, rows } = await sales.findAndCountAll({
    attributes: saleAttributes,
    where,
    include: [
      { model: customers, as: 'customer', attributes: customerAttributes },
      { model: branches, as: 'branch', attributes: branchAttributes },
      {
        model: saleInstallments,
        as: 'installments',
        separate: true,
        attributes: installmentAttributes,
        where: { status: 'Pendiente', due_date: { [Op.lt]: today } }
      }
    ],
    order: [['due_date', 'ASC']],
    limit,
    offset
  });
  return { sales: rows, total: count };
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
    anticipo_amount: antizipoAmount = 0,
    anticipo_payment_method: antizipoPaymentMethod,
    delivery_status: deliveryStatus,
    items
  } = body;

  const pointsRedeemed = parseFloat(body.points_redeemed || 0);

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

  const branch = await branches.findByPk(branchId, { attributes: ['id', 'ticket_prefix'] });
  if (!branch) return { error: 'BRANCH_NOT_FOUND' };

  // Resolver bar_codes a product_id + purch_id y verificar que existan en la sucursal
  const barCodes = items.map(i => i.bar_code);
  const stockRefs = await productStocks.findAll({
    where: { bar_code: barCodes, branch_id: branchId },
    attributes: ['bar_code', 'product_id', 'purch_id']
  });
  if (stockRefs.length !== [...new Set(barCodes)].length) {
    return { error: 'SOME_PRODUCTS_NOT_FOUND_OR_INACTIVE' };
  }
  const stockRefMap = Object.fromEntries(stockRefs.map(s => [s.bar_code, s]));

  // Validar que los productos referenciados estén activos
  const productIds = [...new Set(stockRefs.map(s => s.product_id))];
  const foundProducts = await products.findAll({
    where: { id: productIds, is_active: true },
    attributes: ['id']
  });
  if (foundProducts.length !== productIds.length) {
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
      const { product_id: productId } = stockRefMap[item.bar_code];
      const qty = parseFloat(item.qty);
      const unitPrice = parseFloat(item.unit_price);
      const discount = parseFloat(item.discount || 0);
      const taxRate = parseFloat(item.tax_rate !== undefined ? item.tax_rate : 16);
      const lineSubtotal = parseFloat((qty * unitPrice * (1 - discount / 100)).toFixed(2));

      return {
        product_id: productId,
        bar_code: item.bar_code,
        qty,
        unit_price: unitPrice,
        discount,
        tax_rate: taxRate,
        subtotal: lineSubtotal,
        notes: item.notes || null,
        campaign_product_id: item.campaign_product_id || null
      };
    });

    // Calcular totales del header
    const subtotal = parseFloat(details.reduce((acc, d) => acc + d.subtotal, 0).toFixed(2));
    const taxAmount = parseFloat(details.reduce((acc, d) => {
      return acc + parseFloat((d.subtotal * d.tax_rate / 100).toFixed(2));
    }, 0).toFixed(2));
    const salesTotal = parseFloat((subtotal + taxAmount - parseFloat(discountAmount)).toFixed(2));

    // Lógica de lealtad: validar y calcular puntos
    const loyaltyConfig = await getActiveConfig(branchId);
    let pointsDiscount = 0;
    let pointsEarned = 0;

    if (pointsRedeemed > 0) {
      if (!loyaltyConfig) {
        await transaction.rollback();
        return { error: LOYALTY_ERRORS.LOYALTY_CONFIG_NOT_FOUND };
      }

      const customerPointsRecord = await getOrCreateCustomerPoints(customerId, transaction);
      const redeemResult = validateRedeem(loyaltyConfig, customerPointsRecord, pointsRedeemed, salesTotal);
      if (redeemResult.error) {
        await transaction.rollback();
        return { error: redeemResult.error };
      }

      pointsDiscount = redeemResult.pointsDiscount;
    }

    // Calcular puntos a ganar (si hay config activa)
    const isCredit = salesType === 'Credito';
    if (loyaltyConfig) {
      const shouldEarn = !isCredit || loyaltyConfig.earn_on_credit;

      if (shouldEarn) {
        pointsEarned = calculateEarnedPoints(loyaltyConfig, subtotal, taxAmount, parseFloat(discountAmount));
      }
    }

    // Validar anticipo
    const parsedAnticipo = parseFloat(antizipoAmount);
    if (parsedAnticipo > salesTotal) {
      await transaction.rollback();
      return { error: 'ANTICIPO_EXCEEDS_TOTAL' };
    }

    // Determinar due_payment y status
    const isContado = salesType === 'Contado';
    const remainingBalance = parseFloat((salesTotal - parsedAnticipo - pointsDiscount).toFixed(2));
    const duePayment = isContado ? 0 : remainingBalance;
    const status = (isContado || remainingBalance === 0) ? 'Pagado' : 'Pendiente';

    // Validar y decrementar stock
    for (const item of details) {
      const qty = parseFloat(item.qty);

      const stock = await productStocks.findOne({
        where: { bar_code: item.bar_code, branch_id: branchId },
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
      anticipo_amount: parsedAnticipo,
      points_redeemed: pointsRedeemed,
      points_discount: pointsDiscount,
      points_earned: pointsEarned,
      tax_amount: taxAmount,
      sales_total: salesTotal,
      due_payment: duePayment,
      due_date: calculatedDueDate,
      status,
      delivery_status: deliveryStatus || 'Pendiente',
      notes: notes || null
    }, { transaction });

    // Generar ticket usando el sale.id asignado por el DB
    const ticket = generateTicket(branchId, branch.ticket_prefix, salesDate, sale.id);
    await sale.update({ ticket }, { transaction });

    // Crear detalles
    const detailRecords = details.map(d => ({
      sale_id: sale.id,
      product_id: d.product_id,
      purch_id: stockRefMap[d.bar_code].purch_id,
      qty: d.qty,
      unit_price: d.unit_price,
      discount: d.discount,
      tax_rate: d.tax_rate,
      subtotal: d.subtotal,
      notes: d.notes,
      created_at: new Date(),
      updated_at: new Date()
    }));
    await saleDetails.bulkCreate(detailRecords, { transaction });

    for (const detail of details) {
      if (detail.campaign_product_id) {
        await campaignProducts.increment('sold_quantity', {
          by: detail.qty,
          where: { id: detail.campaign_product_id },
          transaction
        });
      }
    }

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

    // Procesar puntos de lealtad dentro de la transacción
    if (loyaltyConfig) {
      // Canjear puntos si el cliente eligió hacerlo
      if (pointsRedeemed > 0) {
        await redeemPoints(customerId, pointsRedeemed, pointsDiscount, sale.id, userId, transaction);
      }

      // Acreditar puntos ganados si aplica en este momento
      if (pointsEarned > 0) {
        const earnNow = !isCredit || loyaltyConfig.earn_on_credit_when === 'sale';

        if (earnNow) {
          await earnPoints(customerId, pointsEarned, sale.id, userId, loyaltyConfig.points_expiry_days, transaction);
        }
      }
    }

    // Generar installments si es crédito y queda saldo por financiar
    if (salesType === 'Credito' && paymentPeriods && totalDaysTerm && remainingBalance > 0) {
      const periodDays = PERIOD_DAYS[paymentPeriods];
      const numInstallments = Math.ceil(parseInt(totalDaysTerm) / periodDays);
      const baseAmount = parseFloat((remainingBalance / numInstallments).toFixed(2));
      const installments = [];

      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date(salesDate);
        dueDate.setDate(dueDate.getDate() + (periodDays * i));

        // Última cuota absorbe redondeo
        const amount = i === numInstallments
          ? parseFloat((remainingBalance - baseAmount * (numInstallments - 1)).toFixed(2))
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

    // Registrar pago del anticipo si aplica
    let anticipoPayment = null;
    if (parsedAnticipo > 0) {
      anticipoPayment = await salePayments.create({
        sale_id: sale.id,
        payment_amount: parsedAnticipo,
        payment_date: salesDate,
        payment_method: antizipoPaymentMethod,
        notes: 'Anticipo',
        payment_type: 'Anticipo',
        user_id: userId,
        branch_id: branchId
      }, { transaction });
    }

    await transaction.commit();
    const result = await getSale(sale.id);

    // Fire and forget — secuencial para evitar colisión de folios
    const anticipoPaymentId = anticipoPayment?.id || null;
    accountingEngine.generateFromSale(sale.id)
      .then(() => {
        if (anticipoPaymentId) {
          return accountingEngine.generateFromSalePayment(anticipoPaymentId);
        }
      })
      .catch(err =>
        console.error('[AccountingEngine] Error generando póliza:', err.message)
      );

    return result;
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
      const stock = await productStocks.findOne({
        where: { bar_code: `${detail.product_id}-${detail.purch_id}`, branch_id: sale.branch_id },
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

    // Revertir puntos de lealtad si aplica
    if (parseFloat(sale.points_redeemed) > 0) {
      await voidRedeemPoints(sale.customer_id, id, userId, transaction);
    }
    if (parseFloat(sale.points_earned) > 0) {
      await voidEarnPoints(sale.customer_id, id, userId, transaction);
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
    sale.modified_by = userId;
    await sale.save({ transaction });

    await transaction.commit();
    return getSale(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteSale = async (id, userId) => {
  const sale = await sales.findOne({
    where: { id },
    include: [{ model: saleDetails, as: 'details', attributes: detailAttributes }]
  });

  if (!sale) return { error: 'NOT_FOUND' };
  if (sale.sales_type !== 'Contado') return { error: 'SALE_DELETE_ONLY_CONTADO' };

  const activePayments = await salePayments.count({ where: { sale_id: id } });
  if (activePayments > 0) return { error: 'SALE_HAS_ACTIVE_PAYMENTS' };

  const voucher = await avModel.findOne({
    where: { reference_type: 'sale', reference_id: id },
    include: [{ association: 'period', attributes: ['status'] }]
  });
  if (voucher && voucher.period && voucher.period.status !== 'abierto') {
    return { error: 'SALE_PERIOD_CLOSED' };
  }

  const transaction = await sequelize.transaction();
  try {
    for (const detail of sale.details) {
      const qty = parseFloat(detail.qty);
      const stock = await productStocks.findOne({
        where: { bar_code: `${detail.product_id}-${detail.purch_id}`, branch_id: sale.branch_id },
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
        notes: `Reversal por eliminación de venta #${id}`,
        created_by: userId
      }, { transaction });
    }

    if (parseFloat(sale.points_redeemed) > 0) {
      await voidRedeemPoints(sale.customer_id, id, userId, transaction);
    }
    if (parseFloat(sale.points_earned) > 0) {
      await voidEarnPoints(sale.customer_id, id, userId, transaction);
    }

    await sale.update({ modified_by: userId }, { transaction });
    await sale.destroy({ transaction });

    await transaction.commit();

    if (voucher) {
      cancelVoucher(voucher.id)
        .catch(err =>
          console.error(`[AccountingEngine] Error revirtiendo póliza de venta #${id}:`, err.message)
        );
    }

    return { deleted: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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
  deleteSale,
  generateTicket
};
