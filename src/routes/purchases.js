const express = require('express');
const router = express.Router();

const {
  validateGetAll,
  validateGetRecord,
  validateGetBySupplier,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord,
  validateReceiveRecord
} = require('../validators/purchases');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecord,
  getRecordsBySupplier,
  getRecordsByBranch,
  addRecord,
  updateRecord,
  cancelRecord,
  deleteRecord,
  receiveRecord
} = require('../controllers/purchases');

const { PURCHASE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');
const branchScope = require('../middlewares/branchScope');

/**
 * @openapi
 * /purchases:
 *    get:
 *      tags:
 *        - purchases
 *      summary: Lista de compras
 *      description: Obtener todas las compras con sus detalles
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de compras.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/purchases'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /purchases/supplier/{supplier_id}:
 *    get:
 *      tags:
 *        - purchases
 *      summary: Compras por proveedor
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: supplier_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de compras del proveedor
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/purchases'
 */
router.get('/supplier/:supplier_id', [
  searchLimiter,
  authMidleware,
  validateGetBySupplier,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.VIEW_ALL)
], getRecordsBySupplier);

/**
 * @openapi
 * /purchases/branch/{branch_id}:
 *    get:
 *      tags:
 *        - purchases
 *      summary: Compras por sucursal
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: branch_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de compras de la sucursal
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/purchases'
 */
router.get('/branch/:branch_id', [
  searchLimiter,
  authMidleware,
  branchScope,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.VIEW_ALL)
], getRecordsByBranch);

/**
 * @openapi
 * /purchases/{id}:
 *    get:
 *      tags:
 *        - purchases
 *      summary: Compra por id
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
 *          description: Objeto de la compra
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchases'
 *        '404':
 *          description: Compra no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /purchases:
 *    post:
 *      tags:
 *        - purchases
 *      summary: Crear compra
 *      description: |
 *        Crear compra con encabezado y detalle en una sola transacción atómica.
 *        El campo `due_date` se calcula automáticamente: si `purch_type` es `Credito`
 *        y el proveedor tiene `payment_days` configurado, se suma ese plazo a `purch_date`.
 *        Para `Contado` o si el proveedor no tiene `payment_days`, `due_date` queda en `null`.
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - supplier_id
 *                - branch_id
 *                - purch_date
 *                - items
 *              properties:
 *                supplier_id:
 *                  type: integer
 *                branch_id:
 *                  type: integer
 *                purch_date:
 *                  type: string
 *                  format: date
 *                purch_type:
 *                  type: string
 *                  enum: [Contado, Credito]
 *                  description: Si es Credito, el due_date se calcula automáticamente desde payment_days del proveedor
 *                payment_method:
 *                  type: string
 *                  enum: [Efectivo, Transferencia, Vale despensa, Tarjeta]
 *                discount_amount:
 *                  type: number
 *                  format: decimal
 *                  description: Descuento global sobre el total
 *                notes:
 *                  type: string
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - product_id
 *                      - qty
 *                      - unit_price
 *                    properties:
 *                      product_id:
 *                        type: string
 *                        maxLength: 20
 *                      qty:
 *                        type: number
 *                      unit_price:
 *                        type: number
 *                      discount:
 *                        type: number
 *                      tax_rate:
 *                        type: number
 *      responses:
 *        '200':
 *          description: Compra creada correctamente
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchases'
 *        '400':
 *          description: Error de validación o productos inválidos
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.ADD)
], addRecord);

/**
 * @openapi
 * /purchases/{id}:
 *    put:
 *      tags:
 *        - purchases
 *      summary: Actualizar compra
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
 *          description: Compra actualizada
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchases'
 *        '404':
 *          description: Compra no encontrada
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /purchases/{id}/cancel:
 *    put:
 *      tags:
 *        - purchases
 *      summary: Cancelar compra
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
 *          description: Compra cancelada
 *        '400':
 *          description: La compra ya está cancelada
 *        '404':
 *          description: Compra no encontrada
 */
router.put('/:id/cancel', [
  writeLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.CANCEL)
], cancelRecord);

/**
 * @openapi
 * /purchases/{id}:
 *    delete:
 *      tags:
 *        - purchases
 *      summary: Eliminar compra
 *      description: Soft delete, solo si status es Pendiente
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
 *          description: Compra eliminada
 *        '400':
 *          description: La compra no puede eliminarse en su estado actual
 *        '404':
 *          description: Compra no encontrada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.DELETE)
], deleteRecord);

/**
 * @openapi
 * /purchases/{id}/receive:
 *    patch:
 *      tags:
 *        - purchases
 *      summary: Recibir compra
 *      description: Confirma la recepción física de la mercadería, actualiza inventario y registra movimientos de stock. Solo aplica a compras en estado Pendiente.
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
 *          description: Compra recibida e inventario actualizado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/purchases'
 *        '404':
 *          description: Compra no encontrada
 *        '409':
 *          description: La compra no puede ser recibida en su estado actual
 */
router.patch('/:id/receive', [
  writeLimiter,
  authMidleware,
  branchScope,
  validateReceiveRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PURCHASE.RECEIVE)
], receiveRecord);

module.exports = router;
