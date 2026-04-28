const express = require('express');
const router = express.Router();

const {
  validateGetAll,
  validateGetRecord,
  validateGetBySale,
  valiAddRecord
} = require('../validators/salePayments');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecordsBySale,
  getRecord,
  addRecord,
  deleteRecord
} = require('../controllers/salePayments');

const branchScope = require('../middlewares/branchScope');

const { SALE_PAYMENT } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /sale-payments:
 *    get:
 *      tags:
 *        - sale-payments
 *      summary: Lista de cobros de venta
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
 *          description: Lista de cobros paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  payments:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/salePayments'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_PAYMENT.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /sale-payments/sale/{sale_id}:
 *    get:
 *      tags:
 *        - sale-payments
 *      summary: Cobros por venta
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: sale_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: Número de página
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 20
 *        description: Registros por página
 *      responses:
 *        '200':
 *          description: Lista de cobros de la venta paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  payments:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/salePayments'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 */
router.get('/sale/:sale_id', [
  searchLimiter,
  authMidleware,
  validateGetBySale,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_PAYMENT.VIEW_ALL)
], getRecordsBySale);

/**
 * @openapi
 * /sale-payments/{id}:
 *    get:
 *      tags:
 *        - sale-payments
 *      summary: Cobro por id
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
 *          description: Objeto del cobro
 *        '404':
 *          description: Cobro no encontrado
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_PAYMENT.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /sale-payments:
 *    post:
 *      tags:
 *        - sale-payments
 *      summary: Registrar cobro de venta
 *      description: |
 *        Registra un cobro contra una venta a crédito. Reduce el `due_payment`.
 *        Auto-aplica a las cuotas pendientes más antiguas.
 *        Si `due_payment` llega a 0, status cambia a 'Pagado'.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: X-Branch-ID
 *          in: header
 *          required: true
 *          schema:
 *            type: integer
 *          description: ID de la sucursal que recibe el pago
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - sale_id
 *                - payment_amount
 *                - payment_date
 *                - payment_method
 *              properties:
 *                sale_id:
 *                  type: integer
 *                payment_amount:
 *                  type: number
 *                  format: decimal
 *                payment_date:
 *                  type: string
 *                  format: date
 *                payment_method:
 *                  type: string
 *                  enum: [Efectivo, Transferencia, Vale despensa, Tarjeta]
 *                reference_number:
 *                  type: string
 *                  maxLength: 100
 *                notes:
 *                  type: string
 *      responses:
 *        '200':
 *          description: Cobro registrado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  payment:
 *                    $ref: '#/components/schemas/salePayments'
 *        '422':
 *          description: La venta no es cobrable o el monto excede el saldo
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  branchScope,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_PAYMENT.ADD)
], addRecord);

/**
 * @openapi
 * /sale-payments/{id}:
 *    delete:
 *      tags:
 *        - sale-payments
 *      summary: Eliminar cobro de venta
 *      description: Soft delete. Restaura due_payment y revierte cuotas afectadas.
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
 *          description: Cobro eliminado y saldo restaurado
 *        '404':
 *          description: Cobro no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE_PAYMENT.DELETE)
], deleteRecord);

module.exports = router;
