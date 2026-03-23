const db = require('../models/index');

const {
  accountingVouchers,
  accountingVoucherLines,
  accountingPeriods,
  accountingAccounts,
  sales,
  purchases,
  expenses,
  salePayments,
  purchasePayments,
  branches,
  users,
  sequelize
} = db;

// El modelo expense_types usa underscore en su nombre (modelName definido así en el archivo)
// eslint-disable-next-line camelcase
const expenseTypes = db.expense_types;

// ─── Includes reutilizables ───────────────────────────────────────────────────

const periodAttributes = ['id', 'name', 'year', 'month', 'status'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];
const accountAttributes = ['id', 'code', 'name', 'type', 'nature'];

const voucherWithLinesInclude = [
  { model: accountingPeriods, as: 'period', attributes: periodAttributes },
  { model: branches, as: 'branch', attributes: branchAttributes },
  { model: users, as: 'createdBy', attributes: userAttributes },
  {
    model: accountingVoucherLines,
    as: 'lines',
    include: [{ model: accountingAccounts, as: 'account', attributes: accountAttributes }]
  }
];

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Busca el período contable abierto que corresponde al año y mes de una fecha dada.
 * Lanza Error('NO_OPEN_PERIOD_FOR_DATE') si no existe.
 */
const findOpenPeriod = async (date) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  // getUTCMonth() es 0-based
  const month = d.getUTCMonth() + 1;

  const period = await accountingPeriods.findOne({
    where: { year, month, status: 'abierto' }
  });

  if (!period) {
    throw new Error('NO_OPEN_PERIOD_FOR_DATE');
  }

  return period;
};

/**
 * Busca una cuenta contable por código.
 * Lanza Error si no existe o no permite movimientos.
 */
const findAccount = async (code) => {
  const account = await accountingAccounts.findOne({ where: { code } });

  if (!account) {
    throw new Error(`ACCOUNT_NOT_FOUND: ${code}`);
  }

  if (!account.allows_movements) {
    throw new Error(`ACCOUNT_NOT_ALLOWS_MOVEMENTS: ${code}`);
  }

  return account;
};

/**
 * Genera el folio de la póliza dentro de una transacción activa.
 * Formato: POL-{year}-{month:02d}-{count+1:03d}
 */
const generateFolio = async (periodId, t) => {
  const count = await accountingVouchers.count({
    where: { period_id: periodId },
    paranoid: false,
    transaction: t
  });

  const period = await accountingPeriods.findByPk(periodId, { transaction: t });
  const month = String(period.month).padStart(2, '0');
  const seq = String(count + 1).padStart(3, '0');

  return `POL-${period.year}-${month}-${seq}`;
};

/**
 * Retorna la cuenta de efectivo/banco según el método de pago.
 * '111' → Caja (efectivo)
 * '112' → Bancos (transferencia, tarjeta, etc.)
 */
const getPaymentAccount = (paymentMethod) => {
  if (!paymentMethod) return '111';

  const normalized = paymentMethod.toLowerCase();

  if (normalized === 'efectivo' || normalized === 'cash') {
    return '111';
  }

  return '112';
};

/**
 * Crea una póliza con sus líneas dentro de una transacción.
 * La póliza generada automáticamente nace en estado 'aplicada'.
 */
const createVoucherWithLines = async ({
  type,
  period,
  branchId,
  date,
  description,
  referenceType,
  referenceId,
  userId,
  lines
}, t) => {
  const folio = await generateFolio(period.id, t);

  const voucher = await accountingVouchers.create({
    folio,
    type,
    period_id: period.id,
    branch_id: branchId || null,
    date,
    description,
    status: 'aplicada',
    applied_at: new Date(),
    reference_type: referenceType || null,
    reference_id: referenceId || null,
    created_by_user_id: userId
  }, { transaction: t });

  const lineRecords = lines.map((l, i) => ({
    voucher_id: voucher.id,
    account_id: l.account_id,
    debit: l.debit ?? 0,
    credit: l.credit ?? 0,
    description: l.description || null,
    order: i,
    created_at: new Date(),
    updated_at: new Date()
  }));

  await accountingVoucherLines.bulkCreate(lineRecords, { transaction: t });

  // Retornar la póliza completa con relaciones
  return accountingVouchers.findByPk(voucher.id, {
    include: voucherWithLinesInclude,
    order: [[{ model: accountingVoucherLines, as: 'lines' }, 'order', 'ASC']],
    transaction: t
  });
};

// ─── Generadores por tipo de documento ───────────────────────────────────────

/**
 * Genera póliza contable a partir de una venta.
 *
 * Asientos:
 *   Cargo  113 (Clientes)             → sale.sales_total
 *   Abono  411 (Ventas)               → sale.subtotal
 *   Abono  212 (IVA por Pagar)        → sale.tax_amount
 *   Cargo  412 (Descuentos s/Ventas)  → sale.discount_amount  [si > 0]
 */
const generateFromSale = async (saleId) => {
  const existing = await accountingVouchers.findOne({
    where: { reference_type: 'sale', reference_id: saleId }
  });
  if (existing) return existing;

  const sale = await sales.findByPk(saleId);

  if (!sale) {
    throw new Error('NOT_FOUND');
  }

  const date = sale.sales_date;
  const period = await findOpenPeriod(date);

  // Validar cuentas necesarias
  const [acc113, acc411, acc212] = await Promise.all([
    findAccount('113'),
    findAccount('411'),
    findAccount('212')
  ]);

  const total = parseFloat(sale.sales_total);
  const subtotal = parseFloat(sale.subtotal);
  const taxAmount = parseFloat(sale.tax_amount);
  const discountAmount = parseFloat(sale.discount_amount || 0);

  const lines = [
    // Cargo: Clientes por el total de la venta
    { account_id: acc113.id, debit: total, credit: 0, description: 'Clientes' },
    // Abono: Ventas por el subtotal
    { account_id: acc411.id, debit: 0, credit: subtotal, description: 'Ventas' },
    // Abono: IVA por pagar
    { account_id: acc212.id, debit: 0, credit: taxAmount, description: 'IVA por Pagar' }
  ];

  // Si hay descuento, agregar línea de cargo
  if (discountAmount > 0) {
    const acc412 = await findAccount('412');
    lines.push({
      account_id: acc412.id,
      debit: discountAmount,
      credit: 0,
      description: 'Descuentos sobre Ventas'
    });
  }

  const t = await sequelize.transaction();

  try {
    const voucher = await createVoucherWithLines({
      type: 'ingreso',
      period,
      branchId: sale.branch_id,
      date,
      description: `Venta folio ${sale.invoice || sale.id}`,
      referenceType: 'sale',
      referenceId: saleId,
      userId: sale.user_id,
      lines
    }, t);

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Genera póliza contable a partir de una compra.
 * Solo procede si el status de la compra es 'Recibido'.
 *
 * Asientos:
 *   Cargo  115 (Inventario Mercancías) → purchase.subtotal
 *   Cargo  114 (IVA Acreditable)       → purchase.tax_amount
 *   Abono  211 (Proveedores)           → purchase.purch_total
 */
const generateFromPurchase = async (purchaseId) => {
  const existing = await accountingVouchers.findOne({
    where: { reference_type: 'purchase', reference_id: purchaseId }
  });
  if (existing) return existing;

  const purchase = await purchases.findByPk(purchaseId);

  if (!purchase) {
    throw new Error('NOT_FOUND');
  }

  if (purchase.status !== 'Recibido') {
    throw new Error('PURCHASE_NOT_RECEIVED');
  }

  const date = purchase.purch_date;
  const period = await findOpenPeriod(date);

  const [acc115, acc114, acc211] = await Promise.all([
    findAccount('115'),
    findAccount('114'),
    findAccount('211')
  ]);

  const subtotal = parseFloat(purchase.subtotal);
  const taxAmount = parseFloat(purchase.tax_amount);
  const purchTotal = parseFloat(purchase.purch_total);

  const lines = [
    // Cargo: Inventario de Mercancías
    { account_id: acc115.id, debit: subtotal, credit: 0, description: 'Inventario de Mercancías' },
    // Cargo: IVA Acreditable
    { account_id: acc114.id, debit: taxAmount, credit: 0, description: 'IVA Acreditable' },
    // Abono: Proveedores por el total
    { account_id: acc211.id, debit: 0, credit: purchTotal, description: 'Proveedores' }
  ];

  const t = await sequelize.transaction();

  try {
    const voucher = await createVoucherWithLines({
      type: 'egreso',
      period,
      branchId: purchase.branch_id,
      date,
      description: `Compra ${purchase.invoice_number || purchase.id}`,
      referenceType: 'purchase',
      referenceId: purchaseId,
      userId: purchase.user_id,
      lines
    }, t);

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Genera póliza contable a partir de un gasto.
 *
 * Nota: el modelo expenses no tiene tax_amount ni payment_method.
 * Se asume que el gasto ya incluye IVA en expense_amount y se registra neto.
 * La cuenta destino de abono es siempre '213' (Acreedores Diversos)
 * ya que no hay método de pago en el modelo.
 *
 * Asientos:
 *   Cargo  [expense_account_code || '614'] → expense.expense_amount
 *   Abono  '213' (Acreedores Diversos)     → expense.expense_amount
 */
const generateFromExpense = async (expenseId) => {
  const existing = await accountingVouchers.findOne({
    where: { reference_type: 'expense', reference_id: expenseId }
  });
  if (existing) return existing;

  const expense = await expenses.findOne({
    where: { id: expenseId },
    include: [
      { model: expenseTypes, as: 'expenseType', attributes: ['id', 'name', 'accounting_account_code'] }
    ]
  });

  if (!expense) {
    throw new Error('NOT_FOUND');
  }

  const date = expense.trans_date;
  const period = await findOpenPeriod(date);

  // Código de cuenta del tipo de gasto, fallback a Gastos Generales (614)
  const expenseAccountCode = expense.expenseType?.accounting_account_code || '614';

  const [expenseAcc, acc213] = await Promise.all([
    findAccount(expenseAccountCode),
    findAccount('213')
  ]);

  const expenseAmount = parseFloat(expense.expense_amount);

  const lines = [
    // Cargo: cuenta del tipo de gasto por el monto total
    { account_id: expenseAcc.id, debit: expenseAmount, credit: 0, description: expense.expenseType?.name || 'Gasto' },
    // Abono: Acreedores Diversos
    { account_id: acc213.id, debit: 0, credit: expenseAmount, description: 'Acreedores Diversos' }
  ];

  const t = await sequelize.transaction();

  try {
    const voucher = await createVoucherWithLines({
      type: 'egreso',
      period,
      branchId: expense.branch_id,
      date,
      description: `Gasto ${expense.expenseType?.name || expense.id}`,
      referenceType: 'expense',
      referenceId: expenseId,
      userId: expense.user_id,
      lines
    }, t);

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Genera póliza contable a partir de un cobro de venta.
 *
 * Asientos:
 *   Cargo  [111 Caja | 112 Bancos]  → payment.payment_amount
 *   Abono  113 (Clientes)           → payment.payment_amount
 */
const generateFromSalePayment = async (paymentId) => {
  const existing = await accountingVouchers.findOne({
    where: { reference_type: 'sale-payment', reference_id: paymentId }
  });
  if (existing) return existing;

  const payment = await salePayments.findOne({
    where: { id: paymentId },
    include: [
      { model: sales, as: 'sale', attributes: ['id', 'branch_id', 'sales_date'] }
    ]
  });

  if (!payment) {
    throw new Error('NOT_FOUND');
  }

  const date = payment.payment_date;
  const period = await findOpenPeriod(date);

  const paymentAccountCode = getPaymentAccount(payment.payment_method);
  const [paymentAcc, acc113] = await Promise.all([
    findAccount(paymentAccountCode),
    findAccount('113')
  ]);

  const amount = parseFloat(payment.payment_amount);

  const lines = [
    // Cargo: cuenta de efectivo o banco
    { account_id: paymentAcc.id, debit: amount, credit: 0, description: payment.payment_method || 'Cobro' },
    // Abono: Clientes (reduce la cuenta por cobrar)
    { account_id: acc113.id, debit: 0, credit: amount, description: 'Clientes' }
  ];

  const branchId = payment.sale?.branch_id || null;

  const t = await sequelize.transaction();

  try {
    const voucher = await createVoucherWithLines({
      type: 'ingreso',
      period,
      branchId,
      date,
      description: `Cobro venta #${payment.sale_id}`,
      referenceType: 'sale-payment',
      referenceId: paymentId,
      userId: payment.user_id,
      lines
    }, t);

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Genera póliza contable a partir de un pago de compra.
 *
 * Asientos:
 *   Cargo  211 (Proveedores)             → payment.payment_amount
 *   Abono  [111 Caja | 112 Bancos]       → payment.payment_amount
 */
const generateFromPurchasePayment = async (paymentId) => {
  const existing = await accountingVouchers.findOne({
    where: { reference_type: 'purch-payment', reference_id: paymentId }
  });
  if (existing) return existing;

  const payment = await purchasePayments.findOne({
    where: { id: paymentId },
    include: [
      { model: purchases, as: 'purchase', attributes: ['id', 'branch_id'] }
    ]
  });

  if (!payment) {
    throw new Error('NOT_FOUND');
  }

  const date = payment.payment_date;
  const period = await findOpenPeriod(date);

  const paymentAccountCode = getPaymentAccount(payment.payment_method);
  const [acc211, paymentAcc] = await Promise.all([
    findAccount('211'),
    findAccount(paymentAccountCode)
  ]);

  const amount = parseFloat(payment.payment_amount);

  const lines = [
    // Cargo: Proveedores (reduce la cuenta por pagar)
    { account_id: acc211.id, debit: amount, credit: 0, description: 'Proveedores' },
    // Abono: cuenta de efectivo o banco
    { account_id: paymentAcc.id, debit: 0, credit: amount, description: payment.payment_method || 'Pago' }
  ];

  const branchId = payment.purchase?.branch_id || null;

  const t = await sequelize.transaction();

  try {
    const voucher = await createVoucherWithLines({
      type: 'egreso',
      period,
      branchId,
      date,
      description: `Pago compra #${payment.purch_id}`,
      referenceType: 'purch-payment',
      referenceId: paymentId,
      userId: payment.user_id,
      lines
    }, t);

    await t.commit();
    return voucher;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  generateFromSale,
  generateFromPurchase,
  generateFromExpense,
  generateFromSalePayment,
  generateFromPurchasePayment
};
