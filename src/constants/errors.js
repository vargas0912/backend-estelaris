const ERR_SECURITY = Object.freeze({
  NOT_PERMISION: 'ERROR_NOT_PERMISSION',
  NOT_PRIVILEGE: 'NOT_PRIVILEGE',
  FORBIDDEN_ROLE_HIERARCHY: 'No tiene permisos para modificar usuarios con ese rol',
  FORBIDDEN_CANNOT_CREATE_SUPERADMIN: 'Solo un superadmin puede crear o elevar a superadmin',
  FORBIDDEN_CANNOT_MODIFY_SUPERADMIN_PRIVILEGES: 'Solo un superadmin puede modificar privilegios de superadmin'
});

const LOGIN = Object.freeze({
  USER_NOT_EXISTS: 'USER_NOT_EXISTS',
  PASSWORD_INVALID: 'PASSWORD_INVALID',
  ERR_LOGIN: 'ERROR_LOGIN_USER'
});

const USER = Object.freeze({
  ERROR_REGISTER_SUPER_USER: 'ERROR_REGISTER_SUPER_USER',
  ERROR_REGISTER_USER: 'ERROR_REGISTER_USER',
  ID_NOT_EXISTS: 'ID_NOT_EXISTS'
});

const SESSION = Object.freeze({
  NOT_SESION: 'NOT_SESION',
  NOT_TOKEN: 'NOT_TOKEN',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ERROR_ID_TOKEN: 'ERROR_ID_TOKEN',
  USER_ID_TOKEN_NOT_EXISTS: 'USER_ID_TOKEN_NOT_EXISTS'
});

const REGISTER = Object.freeze({
  NAME_NOT_EXISTS: 'NAME_NOT_EXISTS',
  NAME_IS_EMPTY: 'NAME_IS_EMPTY',
  NAME_LENGTH_ERROR: 'NAME_LENGTH_ERROR',
  EMAIL_NOT_EXISTS: 'EMAIL_NOT_EXISTS',
  EMAIL_EMPTY: 'EMAIL_EMPTY',
  EMAIL_INVALID: 'EMAIL_INVALID',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  PASSWORD_NOT_EXISTS: 'PASSWORD_NOT_EXISTS',
  PASSWORD_EMPTY: 'PASSWORD_EMPTY',
  PASSWORD_LENGTH_ERROR: 'PASSWORD_LENGTH_ERROR',
  ROLE_NOT_EXISTS: 'ROLE_NOT_EXISTS',
  ROLE_IS_EMPTY: 'ROLE_IS_EMPTY',
  ROLE_INVALID: 'ROLE_INVALID'
});

const CUSTOMERS_VALIDATORS = Object.freeze({
  NAME_REQUIRED: 'El nombre es obligatorio',
  NAME_LENGTH: 'El nombre debe tener entre 2 y 150 caracteres',
  EMAIL_REQUIRED: 'El email es obligatorio',
  EMAIL_INVALID: 'Email inválido',
  EMAIL_EXISTS: 'El email ya está registrado',
  PHONE_OR_MOBILE_REQUIRED: 'Debe proporcionar al menos un teléfono o móvil',
  TAX_ID_LENGTH: 'El RFC debe tener 13 caracteres',
  MUNICIPALITY_NOT_EXISTS: 'El municipio no existe',
  BRANCH_NOT_EXISTS: 'La sucursal no existe',
  INTERNATIONAL_NO_LOCATION: 'Clientes internacionales no pueden tener municipio o sucursal',
  COUNTRY_REQUIRED: 'El país es obligatorio',
  CUSTOMER_NOT_FOUND: 'Cliente no encontrado',
  USER_ID_ALREADY_EXISTS: 'Este cliente ya tiene portal activado',
  USER_ID_NOT_UNIQUE: 'Este usuario ya está vinculado a otro cliente'
});

const CUSTOMER_ADDRESSES_VALIDATORS = Object.freeze({
  CUSTOMER_REQUIRED: 'El ID del cliente es obligatorio',
  CUSTOMER_NOT_EXISTS: 'El cliente no existe',
  ADDRESS_TYPE_REQUIRED: 'El tipo de dirección es obligatorio',
  ADDRESS_TYPE_INVALID: 'Tipo de dirección inválido (billing o shipping)',
  STREET_REQUIRED: 'La calle es obligatoria',
  STREET_LENGTH: 'La calle debe tener entre 1 y 255 caracteres',
  POSTAL_CODE_REQUIRED: 'El código postal es obligatorio',
  POSTAL_CODE_LENGTH: 'El código postal debe tener entre 5 y 10 caracteres',
  CITY_REQUIRED: 'La ciudad es obligatoria',
  STATE_REQUIRED: 'El estado es obligatorio',
  COUNTRY_REQUIRED: 'El país es obligatorio',
  MUNICIPALITY_NOT_EXISTS: 'El municipio no existe',
  ADDRESS_NOT_FOUND: 'Dirección no encontrada'
});

const USER_BRANCHES_VALIDATORS = Object.freeze({
  USER_ID_REQUIRED: 'USER_ID_REQUIRED',
  USER_ID_INVALID: 'USER_ID_INVALID',
  BRANCH_ID_REQUIRED: 'BRANCH_ID_REQUIRED',
  BRANCH_ID_INVALID: 'BRANCH_ID_INVALID',
  ID_REQUIRED: 'ID_REQUIRED',
  ID_INVALID: 'ID_INVALID',
  ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',
  ASSIGNMENT_ALREADY_EXISTS: 'ASSIGNMENT_ALREADY_EXISTS'
});

const BRANCH_SCOPE = Object.freeze({
  BRANCH_ID_REQUIRED: 'BRANCH_ID_REQUIRED',
  BRANCH_ACCESS_DENIED: 'BRANCH_ACCESS_DENIED'
});

module.exports = { ERR_SECURITY, LOGIN, USER, SESSION, REGISTER, CUSTOMERS_VALIDATORS, CUSTOMER_ADDRESSES_VALIDATORS, USER_BRANCHES_VALIDATORS, BRANCH_SCOPE };
