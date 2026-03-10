const { companyInfo } = require('../models/index');

const companyInfoAttributes = [
  'id',
  'company_name',
  'trade_name',
  'rfc',
  'fiscal_regime',
  'fiscal_address',
  'zip_code',
  'fiscal_email',
  'phone',
  'logo_url',
  'website',
  'created_at',
  'updated_at'
];

/**
 * Obtiene el registro singleton de información fiscal de la empresa.
 * @returns {Object|null} Registro de company_info o null si no existe.
 */
const getCompanyInfo = async () => {
  const result = await companyInfo.findOne({
    attributes: companyInfoAttributes
  });

  return result;
};

/**
 * Actualiza parcialmente los campos enviados en body.
 * Solo modifica los campos presentes en el objeto recibido.
 * @param {Object} body Campos a actualizar (todos opcionales).
 * @returns {Object} Registro actualizado o señal de NOT_FOUND.
 */
const updateCompanyInfo = async (body) => {
  const record = await companyInfo.findOne();

  if (!record) {
    return { data: { msg: 'NOT_FOUND' } };
  }

  const editableFields = [
    'company_name',
    'trade_name',
    'rfc',
    'fiscal_regime',
    'fiscal_address',
    'zip_code',
    'fiscal_email',
    'phone',
    'logo_url',
    'website'
  ];

  editableFields.forEach(field => {
    if (body[field] !== undefined) {
      record[field] = body[field];
    }
  });

  const result = await record.save();
  return result;
};

module.exports = { getCompanyInfo, updateCompanyInfo };
