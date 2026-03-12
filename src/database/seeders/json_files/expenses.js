const fecha = new Date();

const data = [
  { branch_id: 1, user_id: 1, expense_type_id: 1, trans_date: '2026-01-05', expense_amount: 15000.00, notes: 'Nómina primera quincena', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 2, trans_date: '2026-01-10', expense_amount: 8500.00, notes: null, created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 3, trans_date: '2026-01-15', expense_amount: 650.00, notes: 'Servicio telefónico enero', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 4, trans_date: '2026-01-20', expense_amount: 899.00, notes: 'Internet fibra óptica', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 5, trans_date: '2026-02-01', expense_amount: 320.50, notes: null, created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 6, trans_date: '2026-02-08', expense_amount: 450.00, notes: 'Artículos limpieza febrero', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 9, trans_date: '2026-02-14', expense_amount: 1200.00, notes: 'Servicio de mantenimiento', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 18, trans_date: '2026-02-20', expense_amount: 3500.00, notes: 'Diésel para camioneta de reparto', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 20, trans_date: '2026-03-01', expense_amount: 2800.00, notes: 'Recibo de luz febrero', created_at: fecha, updated_at: fecha },
  { branch_id: 1, user_id: 1, expense_type_id: 7, trans_date: '2026-03-05', expense_amount: 750.00, notes: 'Comisión vendedor externo', created_at: fecha, updated_at: fecha }
];

module.exports = { data };
