const { systemSettings } = require('../models/index');

// Categorías que cualquier usuario autenticado puede leer: formato y feature-flags.
// NUNCA agregar 'pricing' (márgenes de precio y crédito) ni otra categoría sensible.
const PUBLIC_SETTING_CATEGORIES = Object.freeze(['formats', 'modules']);

const settingAttributes = [
  'id',
  'category',
  'key',
  'value',
  'label',
  'description',
  'data_type',
  'created_at',
  'updated_at'
];

/**
 * Lista todas las configuraciones del sistema.
 * @param {string|undefined} category Filtro opcional por categoría.
 * @returns {Array} Arreglo de configuraciones.
 */
const getSystemSettings = async (category) => {
  const where = category ? { category } : {};

  const rows = await systemSettings.findAll({
    attributes: settingAttributes,
    where,
    order: [['category', 'ASC'], ['key', 'ASC']]
  });

  return rows;
};

/**
 * Obtiene una configuración por su clave única.
 * @param {string} key Clave de la configuración.
 * @returns {Object|null} Configuración o null si no existe.
 */
const getSystemSetting = async (key) => {
  const result = await systemSettings.findOne({
    attributes: settingAttributes,
    where: { key }
  });

  return result;
};

/**
 * Actualiza el valor de una configuración por su clave.
 * @param {string} key Clave de la configuración.
 * @param {string} value Nuevo valor.
 * @returns {Object} Configuración actualizada o señal de NOT_FOUND.
 */
const updateSystemSetting = async (key, value) => {
  const record = await systemSettings.findOne({ where: { key } });

  if (!record) {
    return { data: { msg: 'NOT_FOUND' } };
  }

  record.value = value;
  const result = await record.save();
  return result;
};

/**
 * Lista solo los ajustes no sensibles (formato y módulos) que el frontend
 * necesita para operar, sin importar los privilegios del usuario.
 * @returns {Array} Arreglo de { key, value, data_type }.
 */
const getAppConfigSettings = async () => {
  const rows = await systemSettings.findAll({
    attributes: ['key', 'value', 'data_type'],
    where: { category: PUBLIC_SETTING_CATEGORIES },
    order: [['key', 'ASC']]
  });

  return rows;
};

module.exports = {
  PUBLIC_SETTING_CATEGORIES,
  getSystemSettings,
  getSystemSetting,
  getAppConfigSettings,
  updateSystemSetting
};
