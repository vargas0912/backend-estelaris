// purchPaymentsData.js
// Los fixtures usan purch_id dinámico: se setea antes de cada test desde la compra creada en beforeAll

const paymentCreate = (purchId) => ({
  purch_id: purchId,
  payment_amount: 100.00,
  payment_date: '2026-02-27',
  payment_method: 'Efectivo',
  notes: 'Pago parcial de prueba'
});

const paymentCreateFull = (purchId, amount) => ({
  purch_id: purchId,
  payment_amount: amount,
  payment_date: '2026-02-27',
  payment_method: 'Transferencia',
  reference_number: 'REF-12345',
  notes: 'Pago total de prueba'
});

const paymentNoPurchId = {
  payment_amount: 100.00,
  payment_date: '2026-02-27',
  payment_method: 'Efectivo'
};

const paymentNoAmount = (purchId) => ({
  purch_id: purchId,
  payment_date: '2026-02-27',
  payment_method: 'Efectivo'
});

const paymentNoDate = (purchId) => ({
  purch_id: purchId,
  payment_amount: 100.00,
  payment_method: 'Efectivo'
});

const paymentNoMethod = (purchId) => ({
  purch_id: purchId,
  payment_amount: 100.00,
  payment_date: '2026-02-27'
});

const paymentExceedsDue = (purchId, duePayment) => ({
  purch_id: purchId,
  payment_amount: parseFloat((duePayment + 0.01).toFixed(2)),
  payment_date: '2026-02-27',
  payment_method: 'Efectivo'
});

// Compra base para usar en los tests de pagos (Crédito para que no interfiera con otros tests)
const purchaseForPayments = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-27',
  purch_type: 'Credito',
  items: [
    {
      product_id: 'TEST-001',
      qty: 1,
      unit_price: 500.00,
      discount: 0,
      tax_rate: 0
    }
  ]
};

// Compra cancelada para test de error
const purchaseForCancel = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-27',
  purch_type: 'Contado',
  payment_method: 'Efectivo',
  items: [
    {
      product_id: 'TEST-001',
      qty: 1,
      unit_price: 100.00,
      discount: 0,
      tax_rate: 0
    }
  ]
};

module.exports = {
  paymentCreate,
  paymentCreateFull,
  paymentNoPurchId,
  paymentNoAmount,
  paymentNoDate,
  paymentNoMethod,
  paymentExceedsDue,
  purchaseForPayments,
  purchaseForCancel
};
