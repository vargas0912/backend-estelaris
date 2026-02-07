const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateGetByProduct,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord
} = require('../validators/productStocks');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecord,
  getRecords,
  getRecordsByProduct,
  getRecordsByBranch,
  addRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/productStocks');
const { PRODUCT_STOCK } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /productStocks:
 *    get:
 *      tags:
 *        - productStocks
 *      summary: Lista de inventarios
 *      description: Obtener toda la lista de inventarios por producto y sucursal
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los inventarios.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /productStocks/product/{product_id}:
 *    get:
 *      tags:
 *        - productStocks
 *      summary: Inventarios por producto
 *      description: Obtener inventarios de un producto en todas las sucursales
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: product_id
 *        in: path
 *        description: Identificador del producto
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de inventarios del producto
 *        '422':
 *          description: Error de validacion.
 */
router.get('/product/:product_id', [
  searchLimiter,
  authMidleware,
  validateGetByProduct,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.VIEW_ALL)
], getRecordsByProduct);

/**
 * @openapi
 * /productStocks/branch/{branch_id}:
 *    get:
 *      tags:
 *        - productStocks
 *      summary: Inventarios por sucursal
 *      description: Obtener inventarios de todos los productos en una sucursal
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branch_id
 *        in: path
 *        description: Identificador de la sucursal
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de inventarios de la sucursal
 *        '422':
 *          description: Error de validacion.
 */
router.get('/branch/:branch_id', [
  searchLimiter,
  authMidleware,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.VIEW_ALL)
], getRecordsByBranch);

/**
 * @openapi
 * /productStocks/{id}:
 *    get:
 *      tags:
 *        - productStocks
 *      summary: Inventario por identificador
 *      description: Consulta de inventario mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del inventario
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del inventario consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /productStocks:
 *      post:
 *          tags:
 *              - productStocks
 *          summary: Crear nuevo inventario
 *          description: Crear nuevo registro de inventario para producto en sucursal
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - product_id
 *                              - branch_id
 *                          properties:
 *                              product_id:
 *                                  type: number
 *                                  description: ID del producto
 *                              branch_id:
 *                                  type: number
 *                                  description: ID de la sucursal
 *                              quantity:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Cantidad en inventario
 *                              min_stock:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Stock mínimo para alerta
 *                              max_stock:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Stock máximo
 *                              location:
 *                                  type: string
 *                                  description: Ubicación en almacén (ej A-01-03)
 *                              last_count_date:
 *                                  type: string
 *                                  format: date
 *                                  description: Fecha del último conteo físico
 *          responses:
 *              '201':
 *                  description: Inventario creado correctamente
 *              '403':
 *                  description: Error al crear el inventario
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.ADD)
], addRecord);

/**
 * @openapi
 * /productStocks/{id}:
 *      put:
 *          tags:
 *              - productStocks
 *          summary: Actualizar inventario
 *          description: Actualizar datos de inventario
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del inventario
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              quantity:
 *                                  type: number
 *                                  format: decimal
 *                              min_stock:
 *                                  type: number
 *                                  format: decimal
 *                              max_stock:
 *                                  type: number
 *                                  format: decimal
 *                              location:
 *                                  type: string
 *                              last_count_date:
 *                                  type: string
 *                                  format: date
 *          responses:
 *              '201':
 *                  description: Inventario modificado correctamente
 *              '403':
 *                  description: Error al actualizar el inventario
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.UPDATE)
], updateRecord);

/**
 * @openapi
 * /productStocks/{id}:
 *      delete:
 *          tags:
 *              - productStocks
 *          summary: Eliminacion de inventario
 *          description: Eliminacion logica de un registro de inventario
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del inventario
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El inventario se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de inventario invalido
 *              '404':
 *                  description: Inventario no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_STOCK.DELETE)
], deleteRecord);

module.exports = router;
