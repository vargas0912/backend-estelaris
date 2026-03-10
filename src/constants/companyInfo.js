const COMPANY_INFO_VALIDATORS = Object.freeze({
  // company_name
  COMPANY_NAME_INVALID: 'El nombre de la empresa debe ser texto',
  COMPANY_NAME_IS_EMPTY: 'El nombre de la empresa no puede estar vacío',
  COMPANY_NAME_TOO_LONG: 'El nombre de la empresa no puede exceder 150 caracteres',

  // trade_name
  TRADE_NAME_INVALID: 'El nombre comercial debe ser texto',
  TRADE_NAME_TOO_LONG: 'El nombre comercial no puede exceder 150 caracteres',

  // rfc
  RFC_INVALID: 'El RFC debe ser texto',
  RFC_IS_EMPTY: 'El RFC no puede estar vacío',
  RFC_LENGTH: 'El RFC debe tener entre 12 y 13 caracteres',

  // fiscal_regime
  FISCAL_REGIME_INVALID: 'El régimen fiscal debe ser texto',
  FISCAL_REGIME_IS_EMPTY: 'El régimen fiscal no puede estar vacío',

  // fiscal_address
  FISCAL_ADDRESS_INVALID: 'El domicilio fiscal debe ser texto',
  FISCAL_ADDRESS_IS_EMPTY: 'El domicilio fiscal no puede estar vacío',

  // zip_code
  ZIP_CODE_INVALID: 'El código postal debe ser texto',
  ZIP_CODE_IS_EMPTY: 'El código postal no puede estar vacío',
  ZIP_CODE_TOO_LONG: 'El código postal no puede exceder 10 caracteres',

  // fiscal_email
  FISCAL_EMAIL_INVALID: 'El correo fiscal debe ser un email válido',

  // phone
  PHONE_INVALID: 'El teléfono debe ser texto',
  PHONE_TOO_LONG: 'El teléfono no puede exceder 20 caracteres',

  // logo_url
  LOGO_URL_INVALID: 'El logo debe ser una URL válida',

  // website
  WEBSITE_INVALID: 'El sitio web debe ser una URL válida'
});

module.exports = { COMPANY_INFO_VALIDATORS };
