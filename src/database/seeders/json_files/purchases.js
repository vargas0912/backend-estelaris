const data = [
  {
    supplier_id: 1,
    branch_id: 1,
    user_id: 1,
    purch_date: '2026-01-15',
    invoice_number: 'FAC-001-2026',
    purch_type: 'Contado',
    payment_method: 'Transferencia',
    status: 'Pagado',
    subtotal: 1000.00,
    discount_amount: 0.00,
    tax_amount: 160.00,
    purch_total: 1160.00,
    due_date: null,
    notes: 'Primera compra de prueba'
  },
  {
    supplier_id: 1,
    branch_id: 1,
    user_id: 1,
    purch_date: '2026-02-01',
    invoice_number: 'FAC-002-2026',
    purch_type: 'Credito',
    payment_method: null,
    status: 'Pendiente',
    subtotal: 2500.00,
    discount_amount: 0.00,
    tax_amount: 400.00,
    purch_total: 2900.00,
    due_date: '2026-03-01',
    notes: 'Compra a crédito, pago en 30 días'
  }
];

module.exports = { data };
