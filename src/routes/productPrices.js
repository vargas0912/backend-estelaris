const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateGetByProduct,
  validateGetByPriceList,
  valiAddRecord,
  valiUpdateRecord
} = require('../validators/productPrices');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecord,
  getRecords,
  getRecordsByProduct,
  getRecordsByPriceList,
  addRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/productPrices');
const { PRODUCT_PRICE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /productPrices:
 *    get:
 *      tags:
 *        - productPrices
 *      summary: Lista de precios de productos
 *      description: Obtener todos los precios de productos con sus listas
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de precios de productos.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /productPrices/product/{product_id}:
 *    get:
 *      tags:
 *        - productPrices
 *      summary: Precios por producto
 *      description: Obtener todos los precios de un producto en todas las listas
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
 *          description: Arreglo de precios del producto
 *        '422':
 *          description: Error de validacion.
 */
router.get('/product/:product_id', [
  searchLimiter,
  authMidleware,
  validateGetByProduct,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.VIEW_ALL)
], getRecordsByProduct);

/**
 * @openapi
 * /productPrices/priceList/{price_list_id}:
 *    get:
 *      tags:
 *        - productPrices
 *      summary: Precios por lista de precios
 *      description: Obtener todos los productos con sus precios en una lista específica
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: price_list_id
 *        in: path
 *        description: Identificador de la lista de precios
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de precios de la lista
 *        '422':
 *          description: Error de validacion.
 */
router.get('/priceList/:price_list_id', [
  searchLimiter,
  authMidleware,
  validateGetByPriceList,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.VIEW_ALL)
], getRecordsByPriceList);

/**
 * @openapi
 * /productPrices/{id}:
 *    get:
 *      tags:
 *        - productPrices
 *      summary: Precio de producto por identificador
 *      description: Consulta de precio de producto mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del precio
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del precio consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /productPrices:
 *      post:
 *          tags:
 *              - productPrices
 *          summary: Crear nuevo precio de producto
 *          description: Asignar un precio específico a un producto en una lista de precios
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - product_id
 *                              - price_list_id
 *                              - price
 *                          properties:
 *                              product_id:
 *                                  type: number
 *                                  description: ID del producto
 *                              price_list_id:
 *                                  type: number
 *                                  description: ID de la lista de precios
 *                              price:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Precio del producto
 *                              min_quantity:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Cantidad mínima para aplicar precio (escalonado)
 *          responses:
 *              '201':
 *                  description: Precio creado correctamente
 *              '403':
 *                  description: Error al crear el precio
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.ADD)
], addRecord);

/**
 * @openapi
 * /productPrices/{id}:
 *      put:
 *          tags:
 *              - productPrices
 *          summary: Actualizar precio de producto
 *          description: Actualizar datos de precio de producto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del precio
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              price:
 *                                  type: number
 *                                  format: decimal
 *                              min_quantity:
 *                                  type: number
 *                                  format: decimal
 *          responses:
 *              '201':
 *                  description: Precio modificado correctamente
 *              '403':
 *                  description: Error al actualizar el precio
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /productPrices/{id}:
 *      delete:
 *          tags:
 *              - productPrices
 *          summary: Eliminacion de precio de producto
 *          description: Eliminacion logica de un precio de producto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del precio
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El precio se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de precio invalido
 *              '404':
 *                  description: Precio no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT_PRICE.DELETE)
], deleteRecord);

module.exports = router;
