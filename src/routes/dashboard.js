const express = require('express');
const router = express.Router();

const { validateTrends, validateTopProducts, validateExpensesByMonth, validateRecentSales, validateSalesByBranch } = require('../validators/dashboard');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter } = require('../middlewares/rateLimiters');
const { getKpis, getTrends, getTopProductsHandler, getExpensesByMonthHandler, getExpensesByBranchHandler, getRecentSalesHandler, getSalesByBranchHandler } = require('../controllers/dashboard');
const { DASHBOARD } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /dashboard/kpis:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: KPIs generales de ventas
 *     description: |
 *       Retorna métricas globales calculadas sobre todas las sucursales:
 *       conteos por status, ingreso total, cartera pendiente, ventas morosas y clientes activos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: KPIs calculados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kpis:
 *                   $ref: '#/components/schemas/dashboardKpis'
 *       '500':
 *         description: Error interno al calcular los KPIs
 */
router.get('/kpis',
  readLimiter,
  authMiddleware,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getKpis
);

/**
 * @openapi
 * /dashboard/trends:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Tendencias mensuales de ventas
 *     description: Retorna totales agrupados por mes para los últimos N meses (default 6).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: months
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 6
 *         description: Cantidad de meses hacia atrás a incluir
 *     responses:
 *       '200':
 *         description: Arreglo de totales mensuales ordenado por mes ASC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/dashboardTrend'
 *       '422':
 *         description: Parámetro months inválido
 */
router.get('/trends',
  readLimiter,
  authMiddleware,
  validateTrends,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getTrends
);

/**
 * @openapi
 * /dashboard/top-products:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Top productos por ingreso
 *     description: |
 *       Retorna los N productos con mayor ingreso total en los últimos M meses,
 *       calculado sobre ventas no canceladas. Ordenado por ingreso_total DESC.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Cantidad máxima de productos a retornar
 *       - name: months
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 3
 *         description: Cantidad de meses hacia atrás a considerar
 *     responses:
 *       '200':
 *         description: Arreglo de productos ordenado por ingreso DESC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/dashboardTopProduct'
 *       '422':
 *         description: Parámetros inválidos
 */
router.get('/top-products',
  readLimiter,
  authMiddleware,
  validateTopProducts,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getTopProductsHandler
);

/**
 * @openapi
 * /dashboard/expenses-by-month:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Gastos totales por mes
 *     description: Retorna el total de gastos agrupados por mes para los últimos N meses (default 12).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: months
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 60
 *           default: 12
 *         description: Cantidad de meses hacia atrás a incluir
 *     responses:
 *       '200':
 *         description: Arreglo de totales de gastos por mes ordenado por mes ASC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expensesByMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes:
 *                         type: string
 *                         example: "2026-01"
 *                       total_gastos:
 *                         type: number
 *                       cantidad_gastos:
 *                         type: integer
 *       '422':
 *         description: Parámetro months inválido
 */
router.get('/expenses-by-month',
  readLimiter,
  authMiddleware,
  validateExpensesByMonth,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getExpensesByMonthHandler
);

/**
 * @openapi
 * /dashboard/expenses-by-branch:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Gastos totales por sucursal
 *     description: Retorna el total de gastos agrupados por sucursal con nombre y monto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: months
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 60
 *           default: 12
 *         description: Cantidad de meses hacia atrás a incluir
 *     responses:
 *       '200':
 *         description: Arreglo de totales de gastos por sucursal ordenado por monto DESC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expensesByBranch:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branch_id:
 *                         type: integer
 *                       sucursal:
 *                         type: string
 *                       total_gastos:
 *                         type: number
 *                       cantidad_gastos:
 *                         type: integer
 */
router.get('/expenses-by-branch',
  readLimiter,
  authMiddleware,
  validateExpensesByMonth,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getExpensesByBranchHandler
);

/**
 * @openapi
 * /dashboard/recent-sales:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Últimas ventas del sistema
 *     description: Retorna las N ventas más recientes con datos clave para KPIs de ventas (id, fecha, sucursal, total, status).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Cantidad de ventas a retornar
 *     responses:
 *       '200':
 *         description: Arreglo de ventas recientes ordenado por fecha DESC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recentSales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/dashboardRecentSale'
 *       '422':
 *         description: Parámetro limit inválido
 */
router.get('/recent-sales',
  readLimiter,
  authMiddleware,
  validateRecentSales,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getRecentSalesHandler
);

/**
 * @openapi
 * /dashboard/sales-by-branch:
 *   get:
 *     tags:
 *       - dashboard
 *     summary: Sumatoria de ventas por sucursal
 *     description: Retorna el resumen de ventas agrupado por sucursal para los últimos N meses, ordenado por ingreso total DESC.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: months
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 6
 *         description: Cantidad de meses hacia atrás a incluir
 *     responses:
 *       '200':
 *         description: Arreglo de sucursales con sus totales de ventas ordenado por ingreso DESC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesByBranch:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/dashboardSalesByBranch'
 *       '422':
 *         description: Parámetro months inválido
 */
router.get('/sales-by-branch',
  readLimiter,
  authMiddleware,
  validateSalesByBranch,
  checkRol([ROLE.ADMIN], DASHBOARD.VIEW),
  getSalesByBranchHandler
);

module.exports = router;
