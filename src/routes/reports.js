const express = require('express');
const router = express.Router();

const { validateDailyMovement } = require('../validators/reports');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter } = require('../middlewares/rateLimiters');
const { getDailyMovementReport } = require('../controllers/reports');
const { SALE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /reports/daily-movement:
 *   get:
 *     tags:
 *       - reports
 *     summary: Reporte de movimiento diario por sucursal
 *     description: |
 *       Consolida en una sola respuesta los movimientos del día para una sucursal:
 *       ventas a crédito, ventas de contado, gastos, abonos recibidos, transferencias
 *       enviadas y transferencias recibidas. Incluye totales pre-calculados.
 *       Requiere el privilegio `view_sales`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la sucursal a consultar
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-04-29"
 *         description: Fecha del reporte en formato YYYY-MM-DD
 *     responses:
 *       '200':
 *         description: Reporte de movimiento diario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   $ref: '#/components/schemas/dailyMovementReport'
 *       '400':
 *         description: Parámetros inválidos (branch_id o date faltante/incorrecto)
 *       '403':
 *         description: Sin privilegio view_sales
 */
router.get('/daily-movement', [
  readLimiter,
  authMiddleware,
  validateDailyMovement,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_ALL)
], getDailyMovementReport);

module.exports = router;
