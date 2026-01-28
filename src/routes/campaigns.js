const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { CAMPAIGN } = require('../constants/modules');
const {
  getCampaigns,
  getActiveCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  activateCampaign,
  deactivateCampaign,
  deleteCampaign,
  getCampaignBranches,
  addCampaignBranches,
  removeCampaignBranch
} = require('../controllers/campaigns');
const {
  createCampaignValidator,
  updateCampaignValidator,
  getCampaignValidator,
  getCampaignsValidator,
  addCampaignBranchesValidator,
  removeCampaignBranchValidator
} = require('../validators/campaigns');

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
 *   name: Campaigns
 *   description: Gestión de campañas de ofertas temporales
 */

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Obtiene todas las campañas
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, upcoming, finished, inactive]
 *         description: Filtrar por estado de campaña
 *     responses:
 *       200:
 *         description: Lista de campañas obtenida correctamente
 *       401:
 *         description: No autorizado
 */
router.get(
  '/',
  authMiddleware,
  checkRol(CAMPAIGN.VIEW_ALL),
  getCampaignsValidator,
  handleValidationErrors,
  getCampaigns
);

/**
 * @swagger
 * /api/campaigns/active:
 *   get:
 *     summary: Obtiene solo las campañas activas y vigentes
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campañas activas obtenidas correctamente
 *       401:
 *         description: No autorizado
 */
router.get(
  '/active',
  authMiddleware,
  checkRol(CAMPAIGN.VIEW_ACTIVE),
  getActiveCampaigns
);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Obtiene una campaña por ID
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la campaña
 *     responses:
 *       200:
 *         description: Campaña obtenida correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN.VIEW),
  getCampaignValidator,
  handleValidationErrors,
  getCampaign
);

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Crea una nueva campaña
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_date
 *               - end_date
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *               priority:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Campaña creada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  authMiddleware,
  checkRol(CAMPAIGN.ADD),
  createCampaignValidator,
  handleValidationErrors,
  createCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Actualiza una campaña
 *     tags: [Campaigns]
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
 *         description: Campaña actualizada correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN.UPDATE),
  updateCampaignValidator,
  handleValidationErrors,
  updateCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}/activate:
 *   post:
 *     summary: Activa una campaña
 *     tags: [Campaigns]
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
 *         description: Campaña activada correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.post(
  '/:id/activate',
  authMiddleware,
  checkRol(CAMPAIGN.ACTIVATE),
  getCampaignValidator,
  handleValidationErrors,
  activateCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}/deactivate:
 *   post:
 *     summary: Desactiva una campaña
 *     tags: [Campaigns]
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
 *         description: Campaña desactivada correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.post(
  '/:id/deactivate',
  authMiddleware,
  checkRol(CAMPAIGN.DEACTIVATE),
  getCampaignValidator,
  handleValidationErrors,
  deactivateCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Elimina una campaña
 *     tags: [Campaigns]
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
 *         description: Campaña eliminada correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  checkRol(CAMPAIGN.DELETE),
  getCampaignValidator,
  handleValidationErrors,
  deleteCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}/branches:
 *   get:
 *     summary: Obtiene las sucursales de una campaña
 *     tags: [Campaigns]
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
 *         description: Sucursales obtenidas correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.get(
  '/:id/branches',
  authMiddleware,
  checkRol(CAMPAIGN.MANAGE_BRANCHES),
  getCampaignValidator,
  handleValidationErrors,
  getCampaignBranches
);

/**
 * @swagger
 * /api/campaigns/{id}/branches:
 *   post:
 *     summary: Agrega sucursales a una campaña
 *     tags: [Campaigns]
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
 *               - branch_ids
 *             properties:
 *               branch_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Sucursales agregadas correctamente
 *       404:
 *         description: Campaña no encontrada
 */
router.post(
  '/:id/branches',
  authMiddleware,
  checkRol(CAMPAIGN.MANAGE_BRANCHES),
  addCampaignBranchesValidator,
  handleValidationErrors,
  addCampaignBranches
);

/**
 * @swagger
 * /api/campaigns/{id}/branches/{branch_id}:
 *   delete:
 *     summary: Remueve una sucursal de una campaña
 *     tags: [Campaigns]
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
 *         description: Sucursal removida correctamente
 *       404:
 *         description: Sucursal no encontrada en la campaña
 */
router.delete(
  '/:id/branches/:branch_id',
  authMiddleware,
  checkRol(CAMPAIGN.MANAGE_BRANCHES),
  removeCampaignBranchValidator,
  handleValidationErrors,
  removeCampaignBranch
);

module.exports = router;
