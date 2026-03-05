// salePaymentsData.js

const paymentCreate = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo',
  notes: 'Cobro parcial de prueba'
});

const paymentCreateFull = (saleId, amount) => ({
  sale_id: saleId,
  payment_amount: amount,
  payment_date: '2026-03-05',
  payment_method: 'Transferencia',
  reference_number: 'REF-SALE-001',
  notes: 'Cobro total de prueba'
});

const paymentNoSaleId = {
  payment_amount: 100.00,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo'
};

const paymentNoAmount = (saleId) => ({
  sale_id: saleId,
  payment_date: '2026-03-05',
  payment_method: 'Efectivo'
});

const paymentNoDate = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_method: 'Efectivo'
});

const paymentNoMethod = (saleId) => ({
  sale_id: saleId,
  payment_amount: 100.00,
  payment_date: '2026-03-05'
});

const paymentExceedsDue = (saleId, duePayment) => ({
  sale_id: saleId,
  payment_amount: parseFloat((duePayment + 0.01).toFixed(2)),
  payment_date: '2026-03-05',
  payment_method: 'Efectivo'
});

module.exports = {
  paymentCreate,
  paymentCreateFull,
  paymentNoSaleId,
  paymentNoAmount,
  paymentNoDate,
  paymentNoMethod,
  paymentExceedsDue
};
