const { body, param, query } = require('express-validator');

const createCampaignValidator = [
  body('name')
    .exists().withMessage('El nombre es requerido')
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser texto')
    .trim(),
  body('start_date')
    .exists().withMessage('La fecha de inicio es requerida')
    .notEmpty().withMessage('La fecha de inicio no puede estar vacía')
    .isISO8601().withMessage('La fecha de inicio debe ser válida')
    .toDate(),
  body('end_date')
    .exists().withMessage('La fecha de fin es requerida')
    .notEmpty().withMessage('La fecha de fin no puede estar vacía')
    .isISO8601().withMessage('La fecha de fin debe ser válida')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser booleano')
    .toBoolean(),
  body('priority')
    .optional()
    .isInt({ min: 0 }).withMessage('La prioridad debe ser un número entero mayor o igual a 0')
    .toInt()
];

const updateCampaignValidator = [
  param('id')
    .exists().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  body('name')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser texto')
    .trim(),
  body('start_date')
    .optional()
    .isISO8601().withMessage('La fecha de inicio debe ser válida')
    .toDate(),
  body('end_date')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe ser válida')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active debe ser booleano')
    .toBoolean(),
  body('priority')
    .optional()
    .isInt({ min: 0 }).withMessage('La prioridad debe ser un número entero mayor o igual a 0')
    .toInt()
];

const getCampaignValidator = [
  param('id')
    .exists().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

const getCampaignsValidator = [
  query('status')
    .optional()
    .isIn(['active', 'upcoming', 'finished', 'inactive']).withMessage('El status debe ser: active, upcoming, finished o inactive')
];

const addCampaignBranchesValidator = [
  param('id')
    .exists().withMessage('El ID de la campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  body('branch_ids')
    .exists().withMessage('Los IDs de sucursales son requeridos')
    .isArray({ min: 1 }).withMessage('Debe proporcionar al menos un ID de sucursal')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs de sucursales deben ser números enteros positivos');
      }
      return true;
    })
];

const removeCampaignBranchValidator = [
  param('id')
    .exists().withMessage('El ID de la campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  param('branch_id')
    .exists().withMessage('El ID de la sucursal es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

module.exports = {
  createCampaignValidator,
  updateCampaignValidator,
  getCampaignValidator,
  getCampaignsValidator,
  addCampaignBranchesValidator,
  removeCampaignBranchValidator
};
