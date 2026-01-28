const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { CAMPAIGN_PRODUCT } = require('../constants/modules');
const {
  getProductsByCampaign,
  getCampaignProduct,
  createCampaignProduct,
  updateCampaignProduct,
  deleteCampaignProduct,
  getBranchOverrides,
  createBranchOverride,
  updateBranchOverride,
  deleteBranchOverride
} = require('../controllers/campaignProducts');
const {
  createCampaignProductValidator,
  updateCampaignProductValidator,
  getCampaignProductValidator,
  getProductsByCampaignValidator,
  createBranchOverrideValidator,
  updateBranchOverrideValidator,
  deleteBranchOverrideValidator
} = require('../validators/campaignProducts');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: CampaignProducts
 *   description: Gestión de productos en campañas
 */

/**
 * @swagger
 * /api/campaignProducts/campaign/{campaign_id}:
 *   get:
 *     summary: Obtiene todos los productos de una campaña
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaign_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la campaña
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente
 *       401:
 *         description: No autorizado
 */
router.get(
  '/campaign/:campaign_id',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.VIEW_ALL),
  getProductsByCampaignValidator,
  handleValidationErrors,
  getProductsByCampaign
);

/**
 * @swagger
 * /api/campaignProducts/{id}:
 *   get:
 *     summary: Obtiene un producto de campaña por ID
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto de campaña
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.VIEW),
  getCampaignProductValidator,
  handleValidationErrors,
  getCampaignProduct
);

/**
 * @swagger
 * /api/campaignProducts:
 *   post:
 *     summary: Agrega un producto a una campaña
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - product_id
 *               - discount_type
 *               - discount_value
 *             properties:
 *               campaign_id:
 *                 type: integer
 *               product_id:
 *                 type: integer
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed_price]
 *               discount_value:
 *                 type: number
 *               max_quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto agregado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.ADD),
  createCampaignProductValidator,
  handleValidationErrors,
  createCampaignProduct
);

/**
 * @swagger
 * /api/campaignProducts/{id}:
 *   put:
 *     summary: Actualiza un producto de campaña
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.UPDATE),
  updateCampaignProductValidator,
  handleValidationErrors,
  updateCampaignProduct
);

/**
 * @swagger
 * /api/campaignProducts/{id}:
 *   delete:
 *     summary: Elimina un producto de una campaña
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.DELETE),
  getCampaignProductValidator,
  handleValidationErrors,
  deleteCampaignProduct
);

/**
 * @swagger
 * /api/campaignProducts/{id}/branches:
 *   get:
 *     summary: Obtiene los overrides de sucursal para un producto de campaña
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Overrides obtenidos correctamente
 */
router.get(
  '/:id/branches',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.MANAGE_OVERRIDES),
  getCampaignProductValidator,
  handleValidationErrors,
  getBranchOverrides
);

/**
 * @swagger
 * /api/campaignProducts/{id}/branches/override:
 *   post:
 *     summary: Crea un override de descuento para una sucursal
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branch_id
 *               - discount_value_override
 *             properties:
 *               branch_id:
 *                 type: integer
 *               discount_value_override:
 *                 type: number
 *     responses:
 *       201:
 *         description: Override creado correctamente
 *       400:
 *         description: Override ya existe
 */
router.post(
  '/:id/branches/override',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.MANAGE_OVERRIDES),
  createBranchOverrideValidator,
  handleValidationErrors,
  createBranchOverride
);

/**
 * @swagger
 * /api/campaignProducts/{id}/branches/{branch_id}/override:
 *   put:
 *     summary: Actualiza un override de sucursal
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discount_value_override
 *             properties:
 *               discount_value_override:
 *                 type: number
 *     responses:
 *       200:
 *         description: Override actualizado correctamente
 *       404:
 *         description: Override no encontrado
 */
router.put(
  '/:id/branches/:branch_id/override',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.MANAGE_OVERRIDES),
  updateBranchOverrideValidator,
  handleValidationErrors,
  updateBranchOverride
);

/**
 * @swagger
 * /api/campaignProducts/{id}/branches/{branch_id}/override:
 *   delete:
 *     summary: Elimina un override de sucursal
 *     tags: [CampaignProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Override eliminado correctamente
 *       404:
 *         description: Override no encontrado
 */
router.delete(
  '/:id/branches/:branch_id/override',
  authMiddleware,
  checkRol(CAMPAIGN_PRODUCT.MANAGE_OVERRIDES),
  deleteBranchOverrideValidator,
  handleValidationErrors,
  deleteBranchOverride
);

module.exports = router;
