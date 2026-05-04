const express = require('express');
const router = express.Router();

const { validateDailyMovement, validateAccountsReceivable, validateInventoryReport } = require('../validators/reports');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter } = require('../middlewares/rateLimiters');
const { getDailyMovementReport, getAccountsReceivableReport, getInventoryReportController } = require('../controllers/reports');
const { REPORTS } = require('../constants/modules');
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
  checkRol([ROLE.USER, ROLE.ADMIN], REPORTS.VIEW_DAILY_MOVEMENT)
], getDailyMovementReport);

/**
 * @openapi
 * /reports/accounts-receivable:
 *   get:
 *     tags:
 *       - reports
 *     summary: Reporte de cartera de créditos activos por sucursal
 *     description: |
 *       Devuelve todas las ventas a crédito con status Pendiente de la sucursal,
 *       con cuotas (installments) y abonos (paymentsReceived) anidados.
 *       Calcula el estado de cada crédito usando la fecha actual en el timezone
 *       configurado en system_settings (default America/Mexico_City):
 *       - **vencido**: el plazo total de la venta (due_date) ya venció.
 *       - **atrasado**: hay cuotas pendientes con due_date pasado.
 *       - **abonan_hoy**: hay cuota pendiente con due_date = hoy.
 *       - **al_corriente**: sin cuotas vencidas ni vencimiento hoy.
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
 *     responses:
 *       '200':
 *         description: Reporte de cartera de créditos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   $ref: '#/components/schemas/accountsReceivableReport'
 *       '400':
 *         description: branch_id faltante o inválido
 *       '403':
 *         description: Sin privilegio view_sales
 */
router.get('/accounts-receivable', [
  readLimiter,
  authMiddleware,
  validateAccountsReceivable,
  checkRol([ROLE.USER, ROLE.ADMIN], REPORTS.VIEW_ACCOUNTS_RECEIVABLE)
], getAccountsReceivableReport);

/**
 * @openapi
 * /reports/inventory:
 *   get:
 *     tags:
 *       - reports
 *     summary: Reporte de inventario por sucursal y periodo
 *     description: |
 *       Devuelve un listado de productos activos de la sucursal con los movimientos
 *       de inventario ocurridos entre start_date y end_date (inclusive).
 *       Para cada producto calcula:
 *       - **inicio**: stock al inicio de start_date (stock actual menos movimientos del periodo en adelante).
 *       - **compro**: entradas por compras (reference_type = 'purchase').
 *       - **recibio**: entradas por transferencias recibidas (reference_type = 'transfer', qty > 0).
 *       - **cancelo**: reingresos por cancelación de venta (reference_type = 'reversal').
 *       - **envio**: salidas por transferencias despachadas (reference_type = 'transfer', qty < 0).
 *       - **contado**: unidades vendidas en ventas de contado no canceladas.
 *       - **credito**: unidades vendidas en ventas a crédito no canceladas.
 *       - **existencia**: inicio + compro + recibio + cancelo - envio - contado - credito.
 *       - **importe**: unitPrice × existencia.
 *       Requiere el privilegio `view_inventory`.
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
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-01-01"
 *         description: Fecha inicial del periodo en formato YYYY-MM-DD
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-04-30"
 *         description: Fecha final del periodo en formato YYYY-MM-DD (debe ser >= start_date)
 *     responses:
 *       '200':
 *         description: Reporte de inventario generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/inventoryReportItem'
 *       '400':
 *         description: Parámetros inválidos (branch_id, start_date o end_date faltante/incorrecto)
 *       '403':
 *         description: Sin privilegio view_inventory
 */
router.get('/inventory', [
  readLimiter,
  authMiddleware,
  validateInventoryReport,
  checkRol([ROLE.USER, ROLE.ADMIN], REPORTS.VIEW_INVENTORY)
], getInventoryReportController);

module.exports = router;
