// salesData.js
// Sales need stock to exist. Prior tests (purchases + receive) create stock for TEST-001 and TEST-002 in branch 1.
// Each test suite creates its own customer + address in beforeAll to avoid depending on soft-deleted records.
// Employee id=1 is created by prior tests (13_employees).

const saleCustomerCreate = {
  name: 'Cliente Ventas Test',
  email: 'cliente.ventas@test.com',
  mobile: '5559999999',
  is_international: false,
  country: 'México',
  municipality_id: 1
};

const saleAddressCreate = (customerId) => ({
  customer_id: customerId,
  street: 'Calle Ventas 123',
  neighborhood: 'Col. Test',
  postal_code: '06600',
  address_type: 'shipping',
  is_default: true,
  municipality_id: 1
});

// Helper: builds a sale purchase for receiving first (to create stock for the sale)
const purchaseForSaleStock = {
  supplier_id: 1,
  branch_id: 1,
  purch_date: '2026-03-01',
  purch_type: 'Contado',
  payment_method: 'Efectivo',
  items: [
    { product_id: 'TEST-001', qty: 100, unit_price: 50.00, discount: 0, tax_rate: 0 },
    { product_id: 'TEST-002', qty: 50, unit_price: 30.00, discount: 0, tax_rate: 0 }
  ]
};

const saleCreateContado = (customerId, addressId) => ({
  branch_id: 1,
  customer_id: customerId,
  customer_address_id: addressId,
  employee_id: 1,
  sales_date: '2026-03-04',
  sales_type: 'Contado',
  items: [
    { product_id: 'TEST-001', qty: 2, unit_price: 150.00, discount: 0, tax_rate: 16 }
  ]
});

const saleCreateCredito = (customerId, addressId) => ({
  branch_id: 1,
  customer_id: customerId,
  customer_address_id: addressId,
  employee_id: 1,
  sales_date: '2026-03-04',
  sales_type: 'Credito',
  payment_periods: 'Quincenal',
  total_days_term: 60,
  notes: 'Venta a crédito de prueba',
  items: [
    { product_id: 'TEST-001', qty: 3, unit_price: 200.00, discount: 5, tax_rate: 16 },
    { product_id: 'TEST-002', qty: 2, unit_price: 100.00, discount: 0, tax_rate: 16 }
  ]
});

const saleCreateNoCustomer = {
  branch_id: 1,
  customer_address_id: 1,
  employee_id: 1,
  sales_date: '2026-03-04',
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100.00 }]
};

const saleCreateNoAddress = {
  branch_id: 1,
  customer_id: 1,
  employee_id: 1,
  sales_date: '2026-03-04',
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100.00 }]
};

const saleCreateNoEmployee = {
  branch_id: 1,
  customer_id: 1,
  customer_address_id: 1,
  sales_date: '2026-03-04',
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100.00 }]
};

const saleCreateNoDate = {
  branch_id: 1,
  customer_id: 1,
  customer_address_id: 1,
  employee_id: 1,
  items: [{ product_id: 'TEST-001', qty: 1, unit_price: 100.00 }]
};

const saleCreateNoItems = {
  branch_id: 1,
  customer_id: 1,
  customer_address_id: 1,
  employee_id: 1,
  sales_date: '2026-03-04'
};

const saleUpdate = {
  invoice: 'FAC-001',
  notes: 'Nota actualizada'
};

module.exports = {
  saleCustomerCreate,
  saleAddressCreate,
  purchaseForSaleStock,
  saleCreateContado,
  saleCreateCredito,
  saleCreateNoCustomer,
  saleCreateNoAddress,
  saleCreateNoEmployee,
  saleCreateNoDate,
  saleCreateNoItems,
  saleUpdate
};
