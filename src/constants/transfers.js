const TRANSFERS_VALIDATORS = Object.freeze({
  // ID
  ID_NOT_EXISTS: 'El id es requerido',
  ID_IS_EMPTY: 'El id no puede estar vacío',
  ID_INVALID: 'El id debe ser un número entero',

  // from_branch_id
  FROM_BRANCH_ID_NOT_EXISTS: 'La sucursal de origen es requerida',
  FROM_BRANCH_ID_IS_EMPTY: 'La sucursal de origen no puede estar vacía',
  FROM_BRANCH_ID_INVALID: 'La sucursal de origen debe ser un número entero',

  // to_branch_id
  TO_BRANCH_ID_NOT_EXISTS: 'La sucursal de destino es requerida',
  TO_BRANCH_ID_IS_EMPTY: 'La sucursal de destino no puede estar vacía',
  TO_BRANCH_ID_INVALID: 'La sucursal de destino debe ser un número entero',

  // branch_id (param genérico para filtros)
  BRANCH_ID_NOT_EXISTS: 'La sucursal es requerida',
  BRANCH_ID_IS_EMPTY: 'La sucursal no puede estar vacía',
  BRANCH_ID_INVALID: 'La sucursal debe ser un número entero',

  // transfer_date
  TRANSFER_DATE_NOT_EXISTS: 'La fecha de transferencia es requerida',
  TRANSFER_DATE_IS_EMPTY: 'La fecha de transferencia no puede estar vacía',
  TRANSFER_DATE_INVALID: 'La fecha de transferencia debe ser una fecha válida',

  // driver_id
  DRIVER_ID_INVALID: 'El conductor debe ser un número entero',

  // transport_plate
  TRANSPORT_PLATE_INVALID: 'La placa debe ser texto',
  TRANSPORT_PLATE_TOO_LONG: 'La placa no puede exceder 20 caracteres',

  // notes
  NOTES_INVALID: 'Las observaciones deben ser texto',

  // items
  ITEMS_NOT_EXISTS: 'Los artículos son requeridos',
  ITEMS_INVALID: 'Los artículos deben ser un arreglo con al menos un elemento',

  // items.*.product_id
  ITEM_PRODUCT_ID_INVALID: 'El id de producto es requerido y debe tener máximo 20 caracteres',

  // items.*.qty
  ITEM_QTY_INVALID: 'La cantidad debe ser un número decimal positivo',

  // items.*.unit_cost
  ITEM_UNIT_COST_INVALID: 'El costo unitario debe ser un número decimal positivo',

  // items.*.purch_id
  ITEM_PURCH_ID_INVALID: 'El id de compra de origen debe ser un número entero',

  // items.*.notes
  ITEM_NOTES_INVALID: 'Las observaciones del ítem deben ser texto',

  // qty_received (para receive)
  RECEIVED_ITEMS_NOT_EXISTS: 'Los artículos recibidos son requeridos',
  RECEIVED_ITEMS_INVALID: 'Los artículos recibidos deben ser un arreglo con al menos un elemento',
  RECEIVED_ITEM_ID_INVALID: 'El id del detalle debe ser un número entero',
  RECEIVED_ITEM_QTY_INVALID: 'La cantidad recibida debe ser un número decimal no negativo'
});

module.exports = { TRANSFERS_VALIDATORS };
