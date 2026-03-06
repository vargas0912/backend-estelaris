const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateGetBySale,
  valiAddRecord,
  valiTransition
} = require('../validators/saleDeliveries');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecord,
  getRecordsBySale,
  getAssignedToMe,
  addRecord,
  pickupRecord,
  shipRecord,
  outRecord,
  deliverRecord,
  returnRecord,
  deleteRecord
} = require('../controllers/saleDeliveries');

const { checkDeliveryTransitionAccess } = require('../middlewares/deliveryAccess');

const { SALE_DELIVERY, DRIVER } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /sale-deliveries/sale/{sale_id}:
 *    get:
 *      tags:
 *        - sale-deliveries
 *      summary: Entregas por venta
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: sale_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de entregas de la venta
 */
router.get('/sale/:sale_id', [
  searchLimiter,
  authMidleware,
  validateGetBySale,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_DELIVERY.VIEW_ALL)
], getRecordsBySale);

/**
 * @openapi
 * /sale-deliveries/assigned-to-me:
 *    get:
 *      tags:
 *        - sale-deliveries
 *      summary: Entregas asignadas al repartidor autenticado
 *      description: Devuelve entregas donde driver_id = employee vinculado al usuario. Excluye Entregado y Devuelto.
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Lista de entregas activas del repartidor (excluye Entregado y Devuelto)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  deliveries:
 *                    type: array
 *                    items:
 *                      allOf:
 *                        - $ref: '#/components/schemas/saleDeliveries'
 *                        - type: object
 *                          properties:
 *                            customerAddress:
 *                              $ref: '#/components/schemas/customerAddresses'
 *                            sale:
 *                              type: object
 *                              properties:
 *                                id:
 *                                  type: integer
 *                                customer:
 *                                  type: object
 *                                  properties:
 *                                    id:
 *                                      type: integer
 *                                    name:
 *                                      type: string
 *                            logs:
 *                              type: array
 *                              items:
 *                                $ref: '#/components/schemas/saleDeliveryLogs'
 *        '403':
 *          description: Sin privilege view_driver_deliveries
 *        '404':
 *          description: No hay employee vinculado al usuario autenticado
 */
router.get('/assigned-to-me', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], DRIVER.VIEW_DELIVERIES)
], getAssignedToMe);

/**
 * @openapi
 * /sale-deliveries/{id}:
 *    get:
 *      tags:
 *        - sale-deliveries
 *      summary: Entrega por id (incluye logs de tracking)
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Objeto de la entrega con logs
 *        '404':
 *          description: Entrega no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_DELIVERY.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /sale-deliveries:
 *    post:
 *      tags:
 *        - sale-deliveries
 *      summary: Crear entrega
 *      description: Crea una entrega en status Preparando y registra log inicial.
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - sale_id
 *                - customer_address_id
 *              properties:
 *                sale_id:
 *                  type: integer
 *                customer_address_id:
 *                  type: integer
 *                driver_id:
 *                  type: integer
 *                  nullable: true
 *                transport_plate:
 *                  type: string
 *                  maxLength: 20
 *                estimated_date:
 *                  type: string
 *                  format: date
 *                notes:
 *                  type: string
 *      responses:
 *        '200':
 *          description: Entrega creada en status Preparando
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  delivery:
 *                    $ref: '#/components/schemas/saleDeliveries'
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_DELIVERY.ADD)
], addRecord);

/**
 * @openapi
 * /sale-deliveries/{id}/pickup:
 *    patch:
 *      tags:
 *        - sale-deliveries
 *      summary: "Transición: Preparando → Recolectado"
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/deliveryTransition'
 *      responses:
 *        '200':
 *          description: Transición exitosa
 *        '422':
 *          description: Transición inválida para el estado actual
 */
router.patch('/:id/pickup', [
  writeLimiter,
  authMidleware,
  valiTransition,
  checkDeliveryTransitionAccess
], pickupRecord);

/**
 * @openapi
 * /sale-deliveries/{id}/ship:
 *    patch:
 *      tags:
 *        - sale-deliveries
 *      summary: "Transición: Recolectado → En_Transito"
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/deliveryTransition'
 *      responses:
 *        '200':
 *          description: Transición exitosa
 *        '422':
 *          description: Transición inválida para el estado actual
 */
router.patch('/:id/ship', [
  writeLimiter,
  authMidleware,
  valiTransition,
  checkDeliveryTransitionAccess
], shipRecord);

/**
 * @openapi
 * /sale-deliveries/{id}/out:
 *    patch:
 *      tags:
 *        - sale-deliveries
 *      summary: "Transición: En_Transito → En_Ruta_Entrega"
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/deliveryTransition'
 *      responses:
 *        '200':
 *          description: Transición exitosa
 *        '422':
 *          description: Transición inválida para el estado actual
 */
router.patch('/:id/out', [
  writeLimiter,
  authMidleware,
  valiTransition,
  checkDeliveryTransitionAccess
], outRecord);

/**
 * @openapi
 * /sale-deliveries/{id}/deliver:
 *    patch:
 *      tags:
 *        - sale-deliveries
 *      summary: "Transición: En_Ruta_Entrega → Entregado"
 *      description: Establece delivered_at automáticamente.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/deliveryTransition'
 *      responses:
 *        '200':
 *          description: Entregado exitosamente
 *        '422':
 *          description: Transición inválida para el estado actual
 */
router.patch('/:id/deliver', [
  writeLimiter,
  authMidleware,
  valiTransition,
  checkDeliveryTransitionAccess
], deliverRecord);

/**
 * @openapi
 * /sale-deliveries/{id}/return:
 *    patch:
 *      tags:
 *        - sale-deliveries
 *      summary: "Transición: Cualquier estado no-final → Devuelto"
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/deliveryTransition'
 *      responses:
 *        '200':
 *          description: Devuelto exitosamente
 *        '422':
 *          description: Transición inválida para el estado actual
 */
router.patch('/:id/return', [
  writeLimiter,
  authMidleware,
  valiTransition,
  checkDeliveryTransitionAccess
], returnRecord);

/**
 * @openapi
 * /sale-deliveries/{id}:
 *    delete:
 *      tags:
 *        - sale-deliveries
 *      summary: Eliminar entrega
 *      description: Soft delete. No se puede eliminar si ya fue Entregado.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Entrega eliminada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_DELIVERY.DELETE)
], deleteRecord);

module.exports = router;
