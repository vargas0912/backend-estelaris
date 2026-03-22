const express = require('express');
const router = express.Router();

const {
  validateGetRecord,
  validateGetByBranch,
  valiAddRecord,
  valiUpdateRecord,
  validateDispatchRecord,
  validateReceiveRecord
} = require('../validators/transfers');

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const branchScope = require('../middlewares/branchScope');
const { readLimiter, writeLimiter, deleteLimiter, searchLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecord,
  getRecordsByFromBranch,
  getRecordsByToBranch,
  addRecord,
  updateRecord,
  dispatchRecord,
  receiveRecord,
  deleteRecord
} = require('../controllers/transfers');

const { TRANSFER } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /transfers:
 *    get:
 *      tags: [transfers]
 *      summary: Lista todas las transferencias
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Arreglo de transferencias
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/transfers'
 */
router.get('/', [
  readLimiter,
  authMidleware,
  branchScope,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /transfers/from-branch/{branch_id}:
 *    get:
 *      tags: [transfers]
 *      summary: Transferencias por sucursal origen
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: branch_id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Arreglo de transferencias de la sucursal origen
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/transfers'
 */
router.get('/from-branch/:branch_id', [
  searchLimiter,
  authMidleware,
  branchScope,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.VIEW_ALL)
], getRecordsByFromBranch);

/**
 * @openapi
 * /transfers/to-branch/{branch_id}:
 *    get:
 *      tags: [transfers]
 *      summary: Transferencias por sucursal destino
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: branch_id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Arreglo de transferencias de la sucursal destino
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/transfers'
 */
router.get('/to-branch/:branch_id', [
  searchLimiter,
  authMidleware,
  branchScope,
  validateGetByBranch,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.VIEW_ALL)
], getRecordsByToBranch);

/**
 * @openapi
 * /transfers/{id}:
 *    get:
 *      tags: [transfers]
 *      summary: Transferencia por id
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Objeto transferencia
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/transfers'
 *        '404':
 *          description: Transferencia no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /transfers:
 *    post:
 *      tags: [transfers]
 *      summary: Crear transferencia en Borrador
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200':
 *          description: Transferencia creada en estado Borrador
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/transfers'
 *        '400':
 *          description: Error de validación
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  branchScope,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.ADD)
], addRecord);

/**
 * @openapi
 * /transfers/{id}:
 *    put:
 *      tags: [transfers]
 *      summary: Actualizar transferencia (solo en Borrador)
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Transferencia actualizada
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/transfers'
 *        '409':
 *          description: La transferencia no puede modificarse en su estado actual
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  branchScope,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.UPDATE)
], updateRecord);

/**
 * @openapi
 * /transfers/{id}/dispatch:
 *    patch:
 *      tags: [transfers]
 *      summary: Despachar transferencia (Borrador → En_Transito)
 *      description: Descuenta stock en sucursal origen y registra movimiento de salida.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Transferencia despachada
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/transfers'
 *        '409':
 *          description: Estado incorrecto para despachar
 *        '422':
 *          description: Stock insuficiente en sucursal origen
 */
router.patch('/:id/dispatch', [
  writeLimiter,
  authMidleware,
  branchScope,
  validateDispatchRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.DISPATCH)
], dispatchRecord);

/**
 * @openapi
 * /transfers/{id}/receive:
 *    patch:
 *      tags: [transfers]
 *      summary: Recibir transferencia (En_Transito → Recibido)
 *      description: Registra cantidades recibidas por ítem e incrementa stock en sucursal destino.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required: [items]
 *              properties:
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required: [detail_id, qty_received]
 *                    properties:
 *                      detail_id:
 *                        type: integer
 *                      qty_received:
 *                        type: number
 *      responses:
 *        '200':
 *          description: Transferencia recibida e inventario actualizado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/transfers'
 *        '409':
 *          description: Estado incorrecto para recibir
 *        '422':
 *          description: qty_received excede qty enviado
 */
router.patch('/:id/receive', [
  writeLimiter,
  authMidleware,
  branchScope,
  validateReceiveRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.RECEIVE)
], receiveRecord);

/**
 * @openapi
 * /transfers/{id}:
 *    delete:
 *      tags: [transfers]
 *      summary: Eliminar/cancelar transferencia
 *      description: |
 *        Soft delete. Si estaba En_Transito, revierte el stock en la sucursal origen.
 *        Solo aplica a transferencias en Borrador o En_Transito.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: Transferencia cancelada
 *        '409':
 *          description: La transferencia no puede cancelarse en su estado actual
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], TRANSFER.DELETE)
], deleteRecord);

module.exports = router;
