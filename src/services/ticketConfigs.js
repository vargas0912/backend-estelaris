const { ticketConfigs } = require('../models/index');
const { getCompanyInfo } = require('./companyInfo');
const { TICKET_CONFIG_DEFAULTS } = require('../constants/ticketConfigs');

const configAttributes = [
  'id',
  'branch_id',
  'type',
  'title',
  'header_text',
  'footer_text',
  'show_logo',
  'show_iva',
  'show_barcode',
  'show_folio',
  'show_cashier',
  'show_branch_address',
  'paper_width',
  'created_at',
  'updated_at'
];

const editableFields = Object.keys(TICKET_CONFIG_DEFAULTS);

/**
 * Lista las configuraciones globales de ticket (branch_id NULL).
 * @returns {Array} Configuraciones globales, una por tipo.
 */
const getTicketConfigs = async () => {
  const rows = await ticketConfigs.findAll({
    attributes: configAttributes,
    where: { branch_id: null },
    order: [['type', 'ASC']]
  });

  return rows;
};

/**
 * Resuelve la configuración efectiva de un tipo de ticket.
 * Prioridad: configuración de la sucursal, global, constantes por defecto.
 * Incluye los datos de la empresa necesarios para imprimir (logo, razón social, etc).
 * @param {string} type Tipo de ticket (sale | payment).
 * @param {number|null} branchId Sucursal del request, si existe.
 * @returns {Object} { config, company }
 */
const resolveTicketConfig = async (type, branchId) => {
  let record = null;

  if (branchId) {
    record = await ticketConfigs.findOne({
      attributes: configAttributes,
      where: { type, branch_id: branchId }
    });
  }

  if (!record) {
    record = await ticketConfigs.findOne({
      attributes: configAttributes,
      where: { type, branch_id: null }
    });
  }

  const config = record
    ? record.toJSON()
    : { id: null, branch_id: null, type, ...TICKET_CONFIG_DEFAULTS };

  const company = await getCompanyInfo();

  return { config, company };
};

/**
 * Actualiza parcialmente la configuración global de un tipo de ticket.
 * Solo modifica los campos editables presentes en el objeto recibido.
 * @param {string} type Tipo de ticket (sale | payment).
 * @param {Object} body Campos a actualizar.
 * @returns {Object} Registro actualizado o señal de NOT_FOUND.
 */
const updateTicketConfig = async (type, body) => {
  const record = await ticketConfigs.findOne({ where: { type, branch_id: null } });

  if (!record) {
    return { data: { msg: 'NOT_FOUND' } };
  }

  editableFields.forEach((field) => {
    if (body[field] !== undefined) {
      record[field] = body[field];
    }
  });

  const result = await record.save();
  return result;
};

module.exports = { getTicketConfigs, resolveTicketConfig, updateTicketConfig };
