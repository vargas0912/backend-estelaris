const express = require('express');
const router = express.Router();

const { validateGetRecord, validateListFilters, valiAddRecord, valiUpdateRecord } = require('../../validators/accountingVouchers');
const authMiddleware = require('../../middlewares/session');
const checkRol = require('../../middlewares/rol');
const { readLimiter, writeLimiter } = require('../../middlewares/rateLimiters');
const { getAll, getById, create, update, apply, cancel, remove } = require('../../controllers/accountingVouchers');
const { ACCOUNTING_VOUCHER } = require('../../constants/modules');
const { ROLE } = require('../../constants/roles');

/**
 * @openapi
 * /accounting/vouchers:
 *   get:
 *     tags:
 *       - accounting-vouchers
 *     summary: Lista de pólizas contables
 *     description: Retorna todas las pólizas con filtros opcionales. Ordenadas por fecha descendente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: branch_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ingreso, egreso, diario, ajuste]
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [borrador, aplicada, cancelada]
 *       - name: reference_type
 *         in: query
 *         schema:
 *           type: string
 *       - name: reference_id
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Arreglo de pólizas contables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/accountingVouchers'
 */
router.get('/', [
  readLimiter,
  authMiddleware,
  validateListFilters,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getAll);

/**
 * @openapi
 * /accounting/vouchers/{id}:
 *   get:
 *     tags:
 *       - accounting-vouchers
 *     summary: Póliza contable por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Objeto de la póliza contable con líneas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingVouchers'
 *       '404':
 *         description: Póliza no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.VIEW_ALL)
], getById);

/**
 * @openapi
 * /accounting/vouchers:
 *   post:
 *     tags:
 *       - accounting-vouchers
 *     summary: Crear póliza contable
 *     description: |
 *       Crea una nueva póliza en estado 'borrador'. Requiere mínimo 2 líneas contables.
 *       El período debe estar en estado 'abierto'. Las cuentas deben permitir movimientos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - period_id
 *               - date
 *               - description
 *               - lines
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ingreso, egreso, diario, ajuste]
 *               period_id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *                 nullable: true
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               reference_type:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               reference_id:
 *                 type: integer
 *                 nullable: true
 *               lines:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   $ref: '#/components/schemas/accountingVoucherLines'
 *     responses:
 *       '200':
 *         description: Póliza creada en estado borrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingVouchers'
 *       '404':
 *         description: Período o cuenta no encontrada
 *       '409':
 *         description: El período no está abierto
 *       '422':
 *         description: Mínimo 2 líneas o cuenta no permite movimientos
 */
router.post('/', [
  writeLimiter,
  authMiddleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.ADD)
], create);

/**
 * @openapi
 * /accounting/vouchers/{id}/apply:
 *   put:
 *     tags:
 *       - accounting-vouchers
 *     summary: Aplicar póliza contable
 *     description: |
 *       Cambia el estado de 'borrador' a 'aplicada'. Verifica que los cargos y abonos
 *       estén cuadrados (diferencia <= $0.01). El período debe seguir abierto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Póliza aplicada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingVouchers'
 *       '404':
 *         description: Póliza o período no encontrado
 *       '409':
 *         description: La póliza no está en borrador o el período no está abierto
 *       '422':
 *         description: La póliza no cuadra o tiene menos de 2 líneas
 */
router.put('/:id/apply', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.APPLY)
], apply);

/**
 * @openapi
 * /accounting/vouchers/{id}/cancel:
 *   put:
 *     tags:
 *       - accounting-vouchers
 *     summary: Cancelar póliza contable
 *     description: |
 *       Cancela la póliza. Si estaba 'borrador', solo cambia el status.
 *       Si estaba 'aplicada', genera automáticamente una póliza de reversión tipo 'ajuste'.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Póliza cancelada. Si estaba aplicada, se creó la reversión automáticamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingVouchers'
 *       '404':
 *         description: Póliza no encontrada
 *       '409':
 *         description: La póliza ya está cancelada
 */
router.put('/:id/cancel', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.CANCEL)
], cancel);

/**
 * @openapi
 * /accounting/vouchers/{id}:
 *   put:
 *     tags:
 *       - accounting-vouchers
 *     summary: Actualizar póliza contable
 *     description: |
 *       Actualiza los datos de una póliza en estado 'borrador'. Si se envía el arreglo
 *       'lines', reemplaza todas las líneas existentes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ingreso, egreso, diario, ajuste]
 *               period_id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *                 nullable: true
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               lines:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   $ref: '#/components/schemas/accountingVoucherLines'
 *     responses:
 *       '200':
 *         description: Póliza actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingVouchers'
 *       '404':
 *         description: Póliza no encontrada
 *       '409':
 *         description: La póliza no está en estado borrador
 */
router.put('/:id', [
  writeLimiter,
  authMiddleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.UPDATE)
], update);

/**
 * @openapi
 * /accounting/vouchers/{id}:
 *   delete:
 *     tags:
 *       - accounting-vouchers
 *     summary: Eliminar póliza contable
 *     description: |
 *       Elimina (soft delete) una póliza en estado 'borrador'. También elimina sus líneas.
 *       Las pólizas aplicadas o canceladas no pueden eliminarse.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Póliza eliminada
 *       '404':
 *         description: Póliza no encontrada
 *       '409':
 *         description: La póliza no está en estado borrador
 */
router.delete('/:id', [
  writeLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_VOUCHER.DELETE)
], remove);

module.exports = router;
