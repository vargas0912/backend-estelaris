const express = require('express');
const router = express.Router();

const { validateGetByProduct } = require('../validators/stockMovements');
const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { searchLimiter } = require('../middlewares/rateLimiters');
const { getMovementsByProductHandler } = require('../controllers/stockMovements');
const { STOCK_MOVEMENT } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /stockMovements/product/{product_id}:
 *   get:
 *     tags:
 *       - stockMovements
 *     summary: Movimientos de inventario por producto
 *     description: Obtener el historial paginado de movimientos de stock de un producto en todas las sucursales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: product_id
 *         in: path
 *         description: Identificador del producto
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Registros por página
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden por fecha de creación (ASC = más antiguo primero)
 *     responses:
 *       '200':
 *         description: Lista paginada de movimientos de inventario del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/stockMovements'
 *                 pagination:
 *                   $ref: '#/components/schemas/pagination'
 *       '400':
 *         description: Error al obtener los movimientos
 *       '422':
 *         description: Error de validación
 */
router.get('/product/:product_id', [
  searchLimiter,
  authMidleware,
  validateGetByProduct,
  checkRol([ROLE.USER, ROLE.ADMIN], STOCK_MOVEMENT.VIEW_BY_PRODUCT)
], getMovementsByProductHandler);

module.exports = router;
