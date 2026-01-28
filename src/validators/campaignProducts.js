const { body, param } = require('express-validator');

const createCampaignProductValidator = [
  body('campaign_id')
    .exists().withMessage('El ID de la campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la campaña debe ser un número entero positivo')
    .toInt(),
  body('product_id')
    .exists().withMessage('El ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número entero positivo')
    .toInt(),
  body('discount_type')
    .exists().withMessage('El tipo de descuento es requerido')
    .notEmpty().withMessage('El tipo de descuento no puede estar vacío')
    .isIn(['percentage', 'fixed_price']).withMessage('El tipo de descuento debe ser percentage o fixed_price'),
  body('discount_value')
    .exists().withMessage('El valor del descuento es requerido')
    .isFloat({ min: 0.01 }).withMessage('El valor del descuento debe ser mayor a 0')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.discount_type === 'percentage' && value > 100) {
        throw new Error('El porcentaje de descuento no puede ser mayor a 100');
      }
      return true;
    }),
  body('max_quantity')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined) {
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('La cantidad máxima debe ser un número entero mayor a 0');
        }
      }
      return true;
    })
    .toInt(),
  body('sold_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('La cantidad vendida debe ser un número entero mayor o igual a 0')
    .toInt()
];

const updateCampaignProductValidator = [
  param('id')
    .exists().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  body('discount_type')
    .optional()
    .isIn(['percentage', 'fixed_price']).withMessage('El tipo de descuento debe ser percentage o fixed_price'),
  body('discount_value')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('El valor del descuento debe ser mayor a 0')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.discount_type === 'percentage' && value > 100) {
        throw new Error('El porcentaje de descuento no puede ser mayor a 100');
      }
      return true;
    }),
  body('max_quantity')
    .optional()
    .custom((value) => {
      if (value !== null && value !== undefined) {
        if (!Number.isInteger(Number(value)) || Number(value) < 1) {
          throw new Error('La cantidad máxima debe ser un número entero mayor a 0');
        }
      }
      return true;
    })
    .toInt(),
  body('sold_quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('La cantidad vendida debe ser un número entero mayor o igual a 0')
    .toInt()
];

const getCampaignProductValidator = [
  param('id')
    .exists().withMessage('El ID es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt()
];

const getProductsByCampaignValidator = [
  param('campaign_id')
    .exists().withMessage('El ID de la campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la campaña debe ser un número entero positivo')
    .toInt()
];

const createBranchOverrideValidator = [
  param('id')
    .exists().withMessage('El ID del producto de campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  body('branch_id')
    .exists().withMessage('El ID de la sucursal es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número entero positivo')
    .toInt(),
  body('discount_value_override')
    .exists().withMessage('El valor de override es requerido')
    .isFloat({ min: 0.01 }).withMessage('El valor de override debe ser mayor a 0')
    .toFloat()
];

const updateBranchOverrideValidator = [
  param('id')
    .exists().withMessage('El ID del producto de campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  param('branch_id')
    .exists().withMessage('El ID de la sucursal es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número entero positivo')
    .toInt(),
  body('discount_value_override')
    .exists().withMessage('El valor de override es requerido')
    .isFloat({ min: 0.01 }).withMessage('El valor de override debe ser mayor a 0')
    .toFloat()
];

const deleteBranchOverrideValidator = [
  param('id')
    .exists().withMessage('El ID del producto de campaña es requerido')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
    .toInt(),
  param('branch_id')
    .exists().withMessage('El ID de la sucursal es requerido')
    .isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número entero positivo')
    .toInt()
];

module.exports = {
  createCampaignProductValidator,
  updateCampaignProductValidator,
  getCampaignProductValidator,
  getProductsByCampaignValidator,
  createBranchOverrideValidator,
  updateBranchOverrideValidator,
  deleteBranchOverrideValidator
};
