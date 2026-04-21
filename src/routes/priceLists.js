const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../validators/priceLists');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecord, getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/priceLists');
const { PRICE_LIST } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /priceLists:
 *    get:
 *      tags:
 *        - priceLists
 *      summary: Lista de listas de precios
 *      description: Obtener todas las listas de precios ordenadas por prioridad
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Número de página
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *            default: 20
 *          description: Registros por página
 *      responses:
 *        '200':
 *          description: Lista de listas de precios paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  priceLists:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/priceLists'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], PRICE_LIST.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /priceLists/{id}:
 *    get:
 *      tags:
 *        - priceLists
 *      summary: Lista de precios por identificador
 *      description: Consulta de lista de precios mediante el id proporcionado
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        description: Identificador de la lista de precios
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Retorna el objecto de la lista de precios consultada
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/priceLists'
 *        '422':
 *          description: Error de validacion.
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRICE_LIST.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /priceLists:
 *      post:
 *          tags:
 *              - priceLists
 *          summary: Crear nueva lista de precios
 *          description: Crear nueva lista de precios (Público, Mayoreo, etc.)
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: Nombre de la lista (ej. Público, Mayoreo)
 *                              description:
 *                                  type: string
 *                                  description: Descripción de la lista
 *                              discount_percent:
 *                                  type: number
 *                                  format: decimal
 *                                  description: Descuento % sobre precio base
 *                              is_active:
 *                                  type: boolean
 *                                  description: Lista activa/inactiva
 *                              priority:
 *                                  type: number
 *                                  description: Prioridad (mayor = más prioritario)
 *          responses:
 *              '201':
 *                  description: Lista de precios creada correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/priceLists'
 *              '403':
 *                  description: Error al crear la lista de precios
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRICE_LIST.ADD)
], addRecord);

/**
 * @openapi
 * /priceLists/{id}:
 *      put:
 *          tags:
 *              - priceLists
 *          summary: Actualizar lista de precios
 *          description: Actualizar datos de lista de precios
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la lista de precios
 *            required: true
 *            schema:
 *              type: number
 *          requestBody:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - name
 *                          properties:
 *                              name:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              discount_percent:
 *                                  type: number
 *                                  format: decimal
 *                              is_active:
 *                                  type: boolean
 *                              priority:
 *                                  type: number
 *          responses:
 *              '201':
 *                  description: Lista de precios modificada correctamente
 *                  content:
 *                    application/json:
 *                      schema:
 *                        $ref: '#/components/schemas/priceLists'
 *              '403':
 *                  description: Error al actualizar la lista de precios
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRICE_LIST.UPDATE)
], updateRecord);

/**
 * @openapi
 * /priceLists/{id}:
 *      delete:
 *          tags:
 *              - priceLists
 *          summary: Eliminacion de lista de precios
 *          description: Eliminacion logica de una lista de precios
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *          - name: id
 *            in: path
 *            description: Identificador de la lista de precios
 *            required: true
 *            schema:
 *              type: number
 *          responses:
 *              '200':
 *                  description: La lista de precios se ha marcado como eliminada satisfactoriamente
 *              '400':
 *                  description: Id de lista de precios invalido
 *              '404':
 *                  description: Lista de precios no encontrada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PRICE_LIST.DELETE)
], deleteRecord);

module.exports = router;
