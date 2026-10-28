const TICKET_TYPES = Object.freeze({
  SALE: 'sale',
  PAYMENT: 'payment'
});

const PAPER_WIDTHS = Object.freeze({
  MM_58: '58mm',
  MM_80: '80mm'
});

const TICKET_CONFIG_DEFAULTS = Object.freeze({
  title: null,
  header_text: null,
  footer_text: null,
  show_logo: true,
  show_iva: true,
  show_barcode: true,
  show_folio: true,
  show_cashier: true,
  show_branch_address: true,
  paper_width: PAPER_WIDTHS.MM_80
});

const TICKET_CONFIG_VALIDATORS = Object.freeze({
  TYPE_INVALID: 'El tipo de ticket debe ser sale o payment',
  TITLE_INVALID: 'El título debe ser texto de máximo 100 caracteres',
  HEADER_TEXT_INVALID: 'El encabezado debe ser texto de máximo 255 caracteres',
  FOOTER_TEXT_INVALID: 'La leyenda final debe ser texto de máximo 255 caracteres',
  BOOLEAN_INVALID: 'El valor debe ser booleano',
  PAPER_WIDTH_INVALID: 'El ancho de papel debe ser 58mm o 80mm',
  NOTHING_TO_UPDATE: 'Debe enviar al menos un campo a actualizar'
});

module.exports = { TICKET_TYPES, PAPER_WIDTHS, TICKET_CONFIG_DEFAULTS, TICKET_CONFIG_VALIDATORS };
