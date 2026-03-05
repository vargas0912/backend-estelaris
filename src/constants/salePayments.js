const SALE_PAYMENT_VALIDATORS = Object.freeze({
  // ID
  ID_NOT_EXISTS: 'El id es requerido',
  ID_IS_EMPTY: 'El id no puede estar vacío',
  ID_INVALID: 'El id debe ser un número entero',

  // sale_id
  SALE_ID_NOT_EXISTS: 'El id de venta es requerido',
  SALE_ID_IS_EMPTY: 'El id de venta no puede estar vacío',
  SALE_ID_INVALID: 'El id de venta debe ser un número entero',

  // payment_amount
  PAYMENT_AMOUNT_NOT_EXISTS: 'El importe del cobro es requerido',
  PAYMENT_AMOUNT_IS_EMPTY: 'El importe del cobro no puede estar vacío',
  PAYMENT_AMOUNT_INVALID: 'El importe del cobro debe ser un número decimal positivo mayor a cero',

  // payment_date
  PAYMENT_DATE_NOT_EXISTS: 'La fecha del cobro es requerida',
  PAYMENT_DATE_IS_EMPTY: 'La fecha del cobro no puede estar vacía',
  PAYMENT_DATE_INVALID: 'La fecha del cobro debe ser una fecha válida',

  // payment_method
  PAYMENT_METHOD_NOT_EXISTS: 'El método de pago es requerido',
  PAYMENT_METHOD_IS_EMPTY: 'El método de pago no puede estar vacío',
  PAYMENT_METHOD_INVALID: "El método de pago debe ser 'Efectivo', 'Transferencia', 'Vale despensa' o 'Tarjeta'",

  // reference_number
  REFERENCE_NUMBER_INVALID: 'El número de referencia debe ser texto',
  REFERENCE_NUMBER_TOO_LONG: 'El número de referencia no puede exceder 100 caracteres',

  // notes
  NOTES_INVALID: 'Las observaciones deben ser texto'
});

module.exports = { SALE_PAYMENT_VALIDATORS };
