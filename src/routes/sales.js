const express = require('express');
const router = express.Router();

const {
  validateGetAll,
  validateGetRecord,
  validateGetByCustomer,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord
} = require('../validators/sales');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecord,
  getRecordsByCustomer,
  getRecordsByBranch,
  getOverdueRecords,
  addRecord,
  updateRecord,
  cancelRecord,
  deleteRecord
} = require('../controllers/sales');

const { SALE } = require('../constants/modules');
const { ROLE } = require('../constants/roles');
const branchScope = require('../middlewares/branchScope');

/**
 * @openapi
 * /sales:
 *    get:
 *      tags:
 *        - sales
 *      summary: Lista de ventas
 *      description: Filtrada por sucursal activa (branchScope). Incluye customer, detalles e installments.
 *      security:
 *        - bearerAuth: []
 *        - branchHeader: []
 *      responses:
 *        '200':
 *          description: Arreglo de ventas
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  sales:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/sales'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /sales/customer/{customer_id}:
 *    get:
 *      tags:
 *        - sales
 *      summary: Ventas por cliente
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *      - name: customer_id
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *      responses:
 *        '200':
 *          description: Arreglo de ventas del cliente
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/sales'
 */
router.get('/customer/:customer_id', [
  searchLimiter,
  authMidleware,
  validateGetByCustomer,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_ALL)
], getRecordsByCustomer);

/**
 * @openapi
 * /sales/branch/{branch_id}:
 *    get:
 *      tags:
 *        - sales
 *      summary: Ventas por sucursal
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
 *          description: Arreglo de ventas de la sucursal
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/sales'
 */
router.get('/branch/:branch_id', [
  searchLimiter,
  authMidleware,
  branchScope,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_ALL)
], getRecordsByBranch);

/**
 * @openapi
 * /sales/overdue:
 *    get:
 *      tags:
 *        - sales
 *      summary: Ventas morosas
 *      description: Ventas a crédito con fecha de vencimiento pasada y status Pendiente
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de ventas morosas con cuotas vencidas
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/sales'
 */
router.get('/overdue', [
  readLimiter,
  authMidleware,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_OVERDUE)
], getOverdueRecords);

/**
 * @openapi
 * /sales/{id}:
 *    get:
 *      tags:
 *        - sales
 *      summary: Venta por id
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
 *          description: Objeto de la venta con detalles e installments
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/sales'
 *        '404':
 *          description: Venta no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /sales:
 *    post:
 *      tags:
 *        - sales
 *      summary: Crear venta
 *      description: |
 *        Crea venta con encabezado y detalle en transacción atómica.
 *        Contado: status=Pagado, due_payment=0.
 *        Crédito: genera installments automáticamente sobre el saldo remanente (total - anticipo_amount).
 *        Si anticipo_amount > 0 se registra automáticamente un pago con notes='Anticipo'.
 *        Si anticipo_amount = total, la venta queda como status=Pagado sin cuotas.
 *        Decrementa stock y genera stockMovements.
 *        El campo `ticket` es auto-generado con formato {PREFIX}-{YY}-{SALE_ID} (ej. MTY-26-000042) y no se envía en el request.
 *      security:
 *        - bearerAuth: []
 *        - branchHeader: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - branch_id
 *                - customer_id
 *                - customer_address_id
 *                - employee_id
 *                - sales_date
 *                - items
 *              properties:
 *                branch_id:
 *                  type: integer
 *                customer_id:
 *                  type: integer
 *                customer_address_id:
 *                  type: integer
 *                employee_id:
 *                  type: integer
 *                price_list_id:
 *                  type: integer
 *                  nullable: true
 *                sales_date:
 *                  type: string
 *                  format: date
 *                sales_type:
 *                  type: string
 *                  enum: [Contado, Credito]
 *                  default: Contado
 *                payment_periods:
 *                  type: string
 *                  enum: [Semanal, Quincenal, Mensual]
 *                  description: Solo para crédito
 *                total_days_term:
 *                  type: integer
 *                  description: Plazo total en días (solo crédito)
 *                discount_amount:
 *                  type: number
 *                  format: decimal
 *                  default: 0
 *                anticipo_amount:
 *                  type: number
 *                  format: decimal
 *                  default: 0
 *                  description: Pago inicial al crear venta a crédito. Reduce el saldo financiado. Puede ser 0.
 *                anticipo_payment_method:
 *                  type: string
 *                  enum: [Efectivo, Transferencia, Vale despensa, Tarjeta]
 *                  description: Requerido cuando anticipo_amount > 0.
 *                invoice:
 *                  type: string
 *                  maxLength: 50
 *                notes:
 *                  type: string
 *                delivery_status:
 *                  type: string
 *                  enum: [Entregado, Pendiente]
 *                  default: Pendiente
 *                  description: Entregado=cliente retira en tienda. Pendiente=requiere envío posterior via saleDeliveries.
 *                items:
 *                  type: array
 *                  minItems: 1
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
 *                        default: 0
 *                      tax_rate:
 *                        type: number
 *                        default: 16
 *                      purch_id:
 *                        type: integer
 *                        nullable: true
 *                      notes:
 *                        type: string
 *      responses:
 *        '200':
 *          description: Venta creada correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  sale:
 *                    $ref: '#/components/schemas/sales'
 *        '400':
 *          description: Datos inválidos o entidad no encontrada
 *        '422':
 *          description: Stock insuficiente
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  branchScope,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.ADD)
], addRecord);

/**
 * @openapi
 * /sales/{id}:
 *    put:
 *      tags:
 *        - sales
 *      summary: Actualizar venta (solo invoice y notes). El campo ticket es de solo lectura.
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
 *          description: Venta actualizada
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/sales'
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.UPDATE)
], updateRecord);

/**
 * @openapi
 * /sales/{id}/cancel:
 *    put:
 *      tags:
 *        - sales
 *      summary: Cancelar venta
 *      description: Revierte stock y cancela installments pendientes
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
 *          description: Venta cancelada
 */
router.put('/:id/cancel', [
  writeLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.CANCEL)
], cancelRecord);

/**
 * @openapi
 * /sales/{id}:
 *    delete:
 *      tags:
 *        - sales
 *      summary: Eliminar venta
 *      description: Soft delete, solo si status es Pendiente y sin pagos activos
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
 *          description: Venta eliminada
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], SALE.DELETE)
], deleteRecord);

module.exports = router;
