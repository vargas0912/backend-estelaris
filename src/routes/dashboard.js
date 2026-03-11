const express = require('express');
const router = express.Router();

const { validateTrends, validateTopProducts } = require('../validators/dashboard');
const authMiddleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter } = require('../middlewares/rateLimiters');
const { getKpis, getTrends, getTopProductsHandler } = require('../controllers/dashboard');
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

module.exports = router;
