const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/products');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/products');
const { PRODUCT } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /products:
 *    get:
 *      tags:
 *        - products
 *      summary: Lista de productos
 *      description: Obtener toda la lista de productos activos
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de objetos de todos los productos.
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /products/{id}:
 *    get:
 *      tags:
 *        - products
 *      summary: Producto por identificador
 *      description: Consulta de producto mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador del producto
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto del producto consultado
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT.VIEW)
], getRecord);

/**
 * @openapi
 * /products:
 *      post:
 *          tags:
 *              - products
 *          summary: Crear nuevo producto
 *          description: Crear nuevo producto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - sku
 *                              - name
 *                              - base_price
 *                          properties:
 *                              sku:
 *                                  type: string
 *                                  description: Codigo unico del producto
 *                              barcode:
 *                                  type: string
 *                                  description: Codigo de barras (opcional)
 *                              name:
 *                                  type: string
 *                                  description: Nombre del producto
 *                              description:
 *                                  type: string
 *                                  description: Descripcion detallada
 *                              short_description:
 *                                  type: string
 *                                  description: Descripcion corta
 *                              category_id:
 *                                  type: number
 *                                  description: ID de la categoria
 *                              unit_of_measure:
 *                                  type: string
 *                                  enum: [piece, kg, lt, mt, box]
 *                                  description: Unidad de medida
 *                              cost_price:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Precio de costo
 *                              base_price:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Precio base de venta
 *                              weight:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Peso del producto
 *                              dimensions:
 *                                  type: object
 *                                  description: Dimensiones del producto (JSON)
 *                              images:
 *                                  type: array
 *                                  description: URLs de imagenes del producto
 *                              is_active:
 *                                  type: boolean
 *                                  description: Estado activo/inactivo
 *                              is_featured:
 *                                  type: boolean
 *                                  description: Producto destacado para e-commerce
 *                              seo_title:
 *                                  type: string
 *                                  description: Titulo SEO
 *                              seo_description:
 *                                  type: string
 *                                  description: Descripcion SEO
 *                              seo_keywords:
 *                                  type: string
 *                                  description: Palabras clave SEO
 *          responses:
 *              '201':
 *                  description: Producto creado correctamente
 *              '403':
 *                  description: Error al crear el nuevo producto
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT.ADD)
], addRecord);

/**
 * @openapi
 * /products/{id}:
 *      put:
 *          tags:
 *              - products
 *          summary: Actualizar producto
 *          description: Actualizar datos de producto previo inicio de sesion
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del producto
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - sku
 *                              - name
 *                              - base_price
 *                          properties:
 *                              sku:
 *                                  type: string
 *                              barcode:
 *                                  type: string
 *                              name:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              short_description:
 *                                  type: string
 *                              category_id:
 *                                  type: number
 *                              unit_of_measure:
 *                                  type: string
 *                                  enum: [piece, kg, lt, mt, box]
 *                              cost_price:
 *                                  type: number
 *                                  format: decimal
 *                              base_price:
 *                                  type: number
 *                                  format: decimal
 *                              weight:
 *                                  type: number
 *                                  format: decimal
 *                              dimensions:
 *                                  type: object
 *                              images:
 *                                  type: array
 *                              is_active:
 *                                  type: boolean
 *                              is_featured:
 *                                  type: boolean
 *                              seo_title:
 *                                  type: string
 *                              seo_description:
 *                                  type: string
 *                              seo_keywords:
 *                                  type: string
 *          responses:
 *              '201':
 *                  description: Producto modificado correctamente
 *              '403':
 *                  description: Error al actualizar el producto
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT.UPDATE)
], updateRecord);

/**
 * @openapi
 * /products/{id}:
 *      delete:
 *          tags:
 *              - products
 *          summary: Eliminacion de producto
 *          description: Eliminacion logica de un producto
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador del producto
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: El producto se ha marcado como eliminado satisfactoriamente
 *              '400':
 *                  description: Id de producto invalido
 *              '404':
 *                  description: Producto no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRODUCT.DELETE)
], deleteRecord);

module.exports = router;
