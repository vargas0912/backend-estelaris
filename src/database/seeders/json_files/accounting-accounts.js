const fecha = new Date();

// nature map: activo/costo/egreso → deudora | pasivo/capital/ingreso → acreedora
const data = [
  // ─── NIVEL 1: Grupos principales ─────────────────────────────────────────
  { code: '100', name: 'Activo', type: 'activo', nature: 'deudora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '200', name: 'Pasivo', type: 'pasivo', nature: 'acreedora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '300', name: 'Capital', type: 'capital', nature: 'acreedora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '400', name: 'Ingresos', type: 'ingreso', nature: 'acreedora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '500', name: 'Costo de Ventas', type: 'costo', nature: 'deudora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '600', name: 'Gastos', type: 'egreso', nature: 'deudora', level: 1, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },

  // ─── NIVEL 2: Subcuentas ──────────────────────────────────────────────────
  // Activo
  { code: '110', name: 'Activo Circulante', type: 'activo', nature: 'deudora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '120', name: 'Activo Fijo', type: 'activo', nature: 'deudora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Pasivo
  { code: '210', name: 'Pasivo a Corto Plazo', type: 'pasivo', nature: 'acreedora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '220', name: 'Pasivo a Largo Plazo', type: 'pasivo', nature: 'acreedora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Capital
  { code: '310', name: 'Capital Social', type: 'capital', nature: 'acreedora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '320', name: 'Resultados', type: 'capital', nature: 'acreedora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Ingresos
  { code: '410', name: 'Ingresos por Ventas', type: 'ingreso', nature: 'acreedora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Costo
  { code: '510', name: 'Costo de Mercancía Vendida', type: 'costo', nature: 'deudora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Gastos
  { code: '610', name: 'Gastos de Operación', type: 'egreso', nature: 'deudora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '620', name: 'Gastos Financieros', type: 'egreso', nature: 'deudora', level: 2, parent_id: null, allows_movements: false, is_system: true, active: true, created_at: fecha, updated_at: fecha },

  // ─── NIVEL 3: Cuentas detalle (allows_movements = true) ──────────────────
  // Activo Circulante
  { code: '111', name: 'Caja', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '112', name: 'Bancos', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '113', name: 'Clientes', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '114', name: 'IVA Acreditable', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '115', name: 'Inventario de Mercancías', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Activo Fijo
  { code: '121', name: 'Mobiliario y Equipo', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '122', name: 'Equipo de Transporte', type: 'activo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Pasivo Corto Plazo
  { code: '211', name: 'Proveedores', type: 'pasivo', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '212', name: 'IVA por Pagar', type: 'pasivo', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '213', name: 'Acreedores Diversos', type: 'pasivo', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '214', name: 'Pasivo por Puntos de Lealtad', type: 'pasivo', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Pasivo Largo Plazo
  { code: '221', name: 'Préstamos Bancarios L.P.', type: 'pasivo', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Capital
  { code: '311', name: 'Capital Social Fijo', type: 'capital', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '321', name: 'Utilidad del Ejercicio', type: 'capital', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '322', name: 'Pérdida del Ejercicio', type: 'capital', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Ingresos
  { code: '411', name: 'Ventas', type: 'ingreso', nature: 'acreedora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '412', name: 'Descuentos sobre Ventas', type: 'ingreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Costo
  { code: '511', name: 'Costo de Ventas', type: 'costo', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Gastos de Operación
  { code: '611', name: 'Sueldos y Salarios', type: 'egreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '612', name: 'Renta de Local', type: 'egreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '613', name: 'Servicios (Luz, Agua, Tel)', type: 'egreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  { code: '614', name: 'Gastos Generales', type: 'egreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha },
  // Gastos Financieros
  { code: '621', name: 'Intereses Pagados', type: 'egreso', nature: 'deudora', level: 3, parent_id: null, allows_movements: true, is_system: true, active: true, created_at: fecha, updated_at: fecha }
];

// parent_id map: código → código padre
const parentCodeMap = {
  110: '100',
  120: '100',
  210: '200',
  220: '200',
  310: '300',
  320: '300',
  410: '400',
  510: '500',
  610: '600',
  620: '600',
  111: '110',
  112: '110',
  113: '110',
  114: '110',
  115: '110',
  121: '120',
  122: '120',
  211: '210',
  212: '210',
  213: '210',
  214: '210',
  221: '220',
  311: '310',
  321: '320',
  322: '320',
  411: '410',
  412: '410',
  511: '510',
  611: '610',
  612: '610',
  613: '610',
  614: '610',
  621: '620'
};

module.exports = { data, parentCodeMap };
