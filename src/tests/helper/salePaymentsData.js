// salePaymentsData.js

const paymentCreate = (saleId, branchId = 1) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo',
  branch_id: branchId,
  notes: 'Cobro parcial de prueba'
});

const paymentCreateFull = (saleId, amount, branchId = 1) => ({
  sale_id: saleId,
  payment_amount: amount,
  payment_date: '2026-03-05',
  payment_method: 'Transferencia',
  reference_number: 'REF-SALE-001',
  branch_id: branchId,
  notes: 'Cobro total de prueba'
});

const paymentNoBranchId = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo'
});

const paymentNoSaleId = {
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo',
  branch_id: 1
};

const paymentNoAmount = (saleId) => ({
  sale_id: saleId,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo',
  branch_id: 1
});

const paymentNoDate = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_method: 'Efectivo',
  branch_id: 1
});

const paymentNoMethod = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  branch_id: 1
});

const paymentExceedsDue = (saleId, duePayment) => ({
  sale_id: saleId,
  payment_amount: parseFloat((duePayment + 0.01).toFixed(2)),
  payment_date: '2026-03-05',
  payment_method: 'Efectivo',
  branch_id: 1
});

module.exports = {
  paymentCreate,
  paymentCreateFull,
  paymentNoBranchId,
  paymentNoSaleId,
  paymentNoAmount,
  paymentNoDate,
  paymentNoMethod,
  paymentExceedsDue
};
