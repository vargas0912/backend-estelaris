const PURCHASES_VALIDATORS = Object.freeze({
  // ID
  ID_NOT_EXISTS: 'El id es requerido',
  ID_IS_EMPTY: 'El id no puede estar vacío',
  ID_INVALID: 'El id debe ser un número entero',

  // supplier_id
  SUPPLIER_ID_NOT_EXISTS: 'El proveedor es requerido',
  SUPPLIER_ID_IS_EMPTY: 'El proveedor no puede estar vacío',
  SUPPLIER_ID_INVALID: 'El proveedor debe ser un número entero',

  // branch_id
  BRANCH_ID_NOT_EXISTS: 'La sucursal es requerida',
  BRANCH_ID_IS_EMPTY: 'La sucursal no puede estar vacía',
  BRANCH_ID_INVALID: 'La sucursal debe ser un número entero',

  // purch_date
  PURCH_DATE_NOT_EXISTS: 'La fecha de compra es requerida',
  PURCH_DATE_IS_EMPTY: 'La fecha de compra no puede estar vacía',
  PURCH_DATE_INVALID: 'La fecha de compra debe ser una fecha válida',

  // purch_type
  PURCH_TYPE_INVALID: "El tipo de compra debe ser 'Contado' o 'Credito'",

  // payment_method
  PAYMENT_METHOD_INVALID: "El método de pago debe ser 'Efectivo', 'Transferencia', 'Vale despensa' o 'Tarjeta'",

  // status
  STATUS_INVALID: "El estatus debe ser 'Pendiente', 'Pagado' o 'Cancelado'",

  // items
  ITEMS_NOT_EXISTS: 'Los artículos son requeridos',
  ITEMS_IS_EMPTY: 'Debe incluir al menos un artículo',
  ITEMS_INVALID: 'Los artículos deben ser un arreglo con al menos un elemento',

  // items.*.product_id
  ITEM_PRODUCT_ID_INVALID: 'El id de producto debe ser un número entero',

  // items.*.qty
  ITEM_QTY_INVALID: 'La cantidad debe ser un número decimal positivo',

  // items.*.unit_price
  ITEM_UNIT_PRICE_INVALID: 'El precio unitario debe ser un número decimal positivo',

  // items.*.discount
  ITEM_DISCOUNT_INVALID: 'El descuento debe ser un número decimal entre 0 y 100',

  // items.*.tax_rate
  ITEM_TAX_RATE_INVALID: 'La tasa de impuesto debe ser un número decimal',

  // invoice_number
  INVOICE_NUMBER_INVALID: 'El folio de factura debe ser texto',
  INVOICE_NUMBER_TOO_LONG: 'El folio de factura no puede exceder 50 caracteres',

  // discount_amount
  DISCOUNT_AMOUNT_INVALID: 'El descuento global debe ser un número decimal positivo',

  // due_payment
  DUE_PAYMENT_INVALID: 'El importe pendiente de pago debe ser un número decimal positivo',

  // due_date
  DUE_DATE_INVALID: 'La fecha de vencimiento debe ser una fecha válida',

  // notes
  NOTES_INVALID: 'Las observaciones deben ser texto'
});

module.exports = { PURCHASES_VALIDATORS };
