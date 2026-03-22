const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateGetByPurchase,
  valiAddRecord
} = require('../validators/purchasePayments');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecordsByPurchase,
  getRecord,
  addRecord,
  deleteRecord
} = require('../controllers/purchasePayments');

const { PURCH_PAYMENT } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /purch-payments:
 *    get:
 *      tags:
 *        - purch-payments
 *      summary: Lista de pagos de compra
 *      description: Obtener todos los pagos de compra registrados
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de pagos de compra.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/purchasePayments'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCH_PAYMENT.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /purch-payments/purchase/{purch_id}:
 *    get:
 *      tags:
 *        - purch-payments
 *      summary: Pagos por compra
 *      description: Obtener todos los pagos de una compra específica
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: purch_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de pagos de la compra
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/purchasePayments'
 */
router.get('/purchase/:purch_id', [
  searchLimiter,
  authMidleware,
  validateGetByPurchase,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCH_PAYMENT.VIEW_ALL)
], getRecordsByPurchase);

/**
 * @openapi
 * /purch-payments/{id}:
 *    get:
 *      tags:
 *        - purch-payments
 *      summary: Pago por id
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
 *          description: Objeto del pago
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchasePayments'
 *        '404':
 *          description: Pago no encontrado
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCH_PAYMENT.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /purch-payments:
 *    post:
 *      tags:
 *        - purch-payments
 *      summary: Registrar pago de compra
 *      description: |
 *        Registra un pago contra una compra. Reduce el `due_payment` de la compra.
 *        Si `due_payment` llega a 0, el status de la compra cambia a 'Pagado'.
 *        No se puede pagar una compra con status 'Cancelado' o 'Pagado'.
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - purch_id
 *                - payment_amount
 *                - payment_date
 *                - payment_method
 *              properties:
 *                purch_id:
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
 *          description: Pago registrado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchasePayments'
 *        '400':
 *          description: Error de validación
 *        '404':
 *          description: Compra no encontrada
 *        '422':
 *          description: La compra no es pagable o el monto excede el saldo pendiente
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCH_PAYMENT.ADD)
], addRecord);

/**
 * @openapi
 * /purch-payments/{id}:
 *    delete:
 *      tags:
 *        - purch-payments
 *      summary: Eliminar pago de compra
 *      description: |
 *        Soft delete del pago. Restaura el `due_payment` en la compra.
 *        Si la compra estaba en 'Pagado', revierte a 'Recibido' o 'Pendiente' según corresponda.
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
 *          description: Pago eliminado y saldo restaurado
 *        '404':
 *          description: Pago no encontrado
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCH_PAYMENT.DELETE)
], deleteRecord);

module.exports = router;
