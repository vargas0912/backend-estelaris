const SALES_VALIDATORS = Object.freeze({
  // ID
  ID_NOT_EXISTS: 'El id es requerido',
  ID_IS_EMPTY: 'El id no puede estar vacío',
  ID_INVALID: 'El id debe ser un número entero',

  // branch_id
  BRANCH_ID_NOT_EXISTS: 'La sucursal es requerida',
  BRANCH_ID_IS_EMPTY: 'La sucursal no puede estar vacía',
  BRANCH_ID_INVALID: 'La sucursal debe ser un número entero',

  // customer_id
  CUSTOMER_ID_NOT_EXISTS: 'El cliente es requerido',
  CUSTOMER_ID_IS_EMPTY: 'El cliente no puede estar vacío',
  CUSTOMER_ID_INVALID: 'El cliente debe ser un número entero',

  // customer_address_id
  CUSTOMER_ADDRESS_ID_NOT_EXISTS: 'La dirección de entrega es requerida',
  CUSTOMER_ADDRESS_ID_IS_EMPTY: 'La dirección de entrega no puede estar vacía',
  CUSTOMER_ADDRESS_ID_INVALID: 'La dirección de entrega debe ser un número entero',

  // employee_id
  EMPLOYEE_ID_NOT_EXISTS: 'El vendedor es requerido',
  EMPLOYEE_ID_IS_EMPTY: 'El vendedor no puede estar vacío',
  EMPLOYEE_ID_INVALID: 'El vendedor debe ser un número entero',

  // price_list_id
  PRICE_LIST_ID_INVALID: 'La lista de precios debe ser un número entero',

  // sales_date
  SALES_DATE_NOT_EXISTS: 'La fecha de venta es requerida',
  SALES_DATE_IS_EMPTY: 'La fecha de venta no puede estar vacía',
  SALES_DATE_INVALID: 'La fecha de venta debe ser una fecha válida',

  // sales_type
  SALES_TYPE_INVALID: "El tipo de venta debe ser 'Contado' o 'Credito'",

  // payment_periods
  PAYMENT_PERIODS_INVALID: "El periodo de pago debe ser 'Semanal', 'Quincenal' o 'Mensual'",

  // total_days_term
  TOTAL_DAYS_TERM_INVALID: 'El plazo en días debe ser un número entero positivo',

  // invoice
  INVOICE_INVALID: 'El folio de factura debe ser texto',
  INVOICE_TOO_LONG: 'El folio de factura no puede exceder 50 caracteres',

  // discount_amount
  DISCOUNT_AMOUNT_INVALID: 'El descuento global debe ser un número decimal positivo',

  // notes
  NOTES_INVALID: 'Las observaciones deben ser texto',

  // items
  ITEMS_NOT_EXISTS: 'Los artículos son requeridos',
  ITEMS_INVALID: 'Los artículos deben ser un arreglo con al menos un elemento',

  // items.*.product_id
  ITEM_PRODUCT_ID_INVALID: 'El id de producto es requerido y debe tener máximo 20 caracteres',

  // items.*.qty
  ITEM_QTY_INVALID: 'La cantidad debe ser un número decimal positivo',

  // items.*.unit_price
  ITEM_UNIT_PRICE_INVALID: 'El precio unitario debe ser un número decimal positivo',

  // items.*.discount
  ITEM_DISCOUNT_INVALID: 'El descuento debe ser un número decimal entre 0 y 100',

  // items.*.tax_rate
  ITEM_TAX_RATE_INVALID: 'La tasa de impuesto debe ser un número decimal',

  // items.*.purch_id
  ITEM_PURCH_ID_INVALID: 'El id de compra de origen debe ser un número entero',

  // items.*.notes
  ITEM_NOTES_INVALID: 'Las observaciones del ítem deben ser texto',

  // delivery_status
  DELIVERY_STATUS_INVALID: 'Estado de entrega inválido. Use: Entregado o Pendiente',

  // anticipo
  ANTICIPO_AMOUNT_INVALID: 'El anticipo debe ser un número decimal mayor o igual a 0',
  ANTICIPO_EXCEEDS_TOTAL: 'El anticipo no puede ser mayor al total de la venta',
  ANTICIPO_PAYMENT_METHOD_REQUIRED: 'El método de pago del anticipo es requerido cuando el anticipo es mayor a 0',
  ANTICIPO_PAYMENT_METHOD_INVALID: "El método de pago del anticipo debe ser: 'Efectivo', 'Transferencia', 'Vale despensa' o 'Tarjeta'"
});

const TICKET_CONFIG = Object.freeze({
  ID_PADDING: 6,
  PREFIX_FALLBACK_PADDING: 3
});

module.exports = { SALES_VALIDATORS, TICKET_CONFIG };
