const SYSTEM_SETTINGS_VALIDATORS = Object.freeze({
  // key (param)
  KEY_NOT_EXISTS: 'La clave de configuración es requerida',
  KEY_IS_EMPTY: 'La clave de configuración no puede estar vacía',
  KEY_INVALID: 'La clave de configuración debe ser texto',

  // value (body en PUT)
  VALUE_NOT_EXISTS: 'El valor es requerido',
  VALUE_IS_EMPTY: 'El valor no puede estar vacío',
  VALUE_INVALID: 'El valor debe ser texto'
});

module.exports = { SYSTEM_SETTINGS_VALIDATORS };
