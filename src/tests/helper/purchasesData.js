const purchaseCreate = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-24',
  purch_type: 'Contado',
  payment_method: 'Efectivo',
  items: [
    {
      product_id: 'TEST-001',
      qty: 5,
      unit_price: 100.00,
      discount: 0,
      tax_rate: 16
    }
  ]
};

const purchaseCreateCredit = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-24',
  purch_type: 'Credito',
  due_date: '2026-03-24',
  notes: 'Compra a crédito de prueba',
  items: [
    {
      product_id: 'TEST-001',
      qty: 10,
      unit_price: 200.00,
      discount: 5,
      tax_rate: 16
    },
    {
      product_id: 'TEST-002',
      qty: 3,
      unit_price: 50.00
    }
  ]
};

const purchaseCreateNoSupplier = {
  branch_id: 1,
  purch_date: '2026-02-24',
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100 }]
};

const purchaseCreateNoBranch = {
  supplier_id: 1,
  purch_date: '2026-02-24',
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100 }]
};

const purchaseCreateNoDate = {
  supplier_id: 1,
  branch_id: 1,
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100 }]
};

const purchaseCreateNoItems = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-24'
};

const purchaseCreateEmptyItems = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-24',
  items: []
};

const purchaseCreateInvalidProduct = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-24',
  items: [{ product_id: 'NONEXISTENT-SKU', qty: 1, unit_price: 100 }]
};

const purchaseUpdate = {
  status: 'Pagado',
  payment_method: 'Transferencia',
  notes: 'Pago realizado'
};

const purchaseUpdateStatus = {
  status: 'Pagado'
};

const purchaseForReceive = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-02-25',
  purch_type: 'Contado',
  payment_method: 'Efectivo',
  items: [
    {
      product_id: 'TEST-001',
      qty: 10,
      unit_price: 50.00,
      discount: 0,
      tax_rate: 16
    },
    {
      product_id: 'TEST-002',
      qty: 5,
      unit_price: 30.00,
      discount: 0,
      tax_rate: 16
    }
  ]
};

module.exports = {
  purchaseCreate,
  purchaseCreateCredit,
  purchaseCreateNoSupplier,
  purchaseCreateNoBranch,
  purchaseCreateNoDate,
  purchaseCreateNoItems,
  purchaseCreateEmptyItems,
  purchaseCreateInvalidProduct,
  purchaseUpdate,
  purchaseUpdateStatus,
  purchaseForReceive
};
