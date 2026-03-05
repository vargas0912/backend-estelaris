const SALE_DELIVERY_VALIDATORS = Object.freeze({
  // ID
  ID_NOT_EXISTS: 'El id es requerido',
  ID_IS_EMPTY: 'El id no puede estar vacío',
  ID_INVALID: 'El id debe ser un número entero',

  // sale_id
  SALE_ID_NOT_EXISTS: 'El id de venta es requerido',
  SALE_ID_IS_EMPTY: 'El id de venta no puede estar vacío',
  SALE_ID_INVALID: 'El id de venta debe ser un número entero',

  // customer_address_id
  CUSTOMER_ADDRESS_ID_NOT_EXISTS: 'La dirección de entrega es requerida',
  CUSTOMER_ADDRESS_ID_IS_EMPTY: 'La dirección de entrega no puede estar vacía',
  CUSTOMER_ADDRESS_ID_INVALID: 'La dirección de entrega debe ser un número entero',

  // driver_id
  DRIVER_ID_INVALID: 'El conductor debe ser un número entero',

  // transport_plate
  TRANSPORT_PLATE_INVALID: 'La placa debe ser texto',
  TRANSPORT_PLATE_TOO_LONG: 'La placa no puede exceder 20 caracteres',

  // estimated_date
  ESTIMATED_DATE_INVALID: 'La fecha estimada debe ser una fecha válida',

  // location
  LOCATION_INVALID: 'La ubicación debe ser texto',

  // notes
  NOTES_INVALID: 'Las observaciones deben ser texto'
});

module.exports = { SALE_DELIVERY_VALIDATORS };
