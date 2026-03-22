const express = require('express');
const router = express.Router();

const { validateGetRecord, valiAddRecord, valiUpdateRecord } = require('../../validators/accountingAccounts');

const authMiddleware = require('../../middlewares/session');
const checkRol = require('../../middlewares/rol');
const { readLimiter, writeLimiter, deleteLimiter } = require('../../middlewares/rateLimiters');

const { getRecords, getTree, getRecord, addRecord, updateRecord, deleteRecord } = require('../../controllers/accountingAccounts');
const { ACCOUNTING_ACCOUNT } = require('../../constants/modules');
const { ROLE } = require('../../constants/roles');

/**
 * @openapi
 * /accounting/accounts/tree:
 *   get:
 *     tags:
 *       - accounting-accounts
 *     summary: Árbol jerárquico del catálogo de cuentas
 *     description: Retorna el catálogo de cuentas activas organizado en árbol anidado por nivel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Árbol de cuentas contables anidado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tree:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/accountingAccounts'
 *       '400':
 *         description: Error al obtener el árbol
 */
router.get('/tree', [
  readLimiter,
  authMiddleware,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.VIEW_TREE)
], getTree);

/**
 * @openapi
 * /accounting/accounts:
 *   get:
 *     tags:
 *       - accounting-accounts
 *     summary: Lista del catálogo de cuentas contables
 *     description: Obtener todas las cuentas contables con su cuenta padre
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Arreglo de cuentas contables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/accountingAccounts'
 *       '400':
 *         description: Error al obtener el catálogo
 */
router.get('/', [
  readLimiter,
  authMiddleware,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /accounting/accounts/{id}:
 *   get:
 *     tags:
 *       - accounting-accounts
 *     summary: Cuenta contable por id
 *     description: Consulta de cuenta contable mediante el id proporcionado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Identificador de la cuenta contable
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Retorna el objeto de la cuenta contable consultada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingAccounts'
 *       '404':
 *         description: Cuenta no encontrada
 *       '422':
 *         description: Error de validación
 */
router.get('/:id', [
  readLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /accounting/accounts:
 *   post:
 *     tags:
 *       - accounting-accounts
 *     summary: Crear cuenta contable
 *     description: Registrar una nueva cuenta en el catálogo contable. Si tiene parent_id, el level debe ser parent.level + 1.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - type
 *               - nature
 *               - level
 *             properties:
 *               code:
 *                 type: string
 *                 maxLength: 20
 *               name:
 *                 type: string
 *                 maxLength: 120
 *               type:
 *                 type: string
 *                 enum: [activo, pasivo, capital, ingreso, egreso, costo]
 *               nature:
 *                 type: string
 *                 enum: [deudora, acreedora]
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               parent_id:
 *                 type: integer
 *               allows_movements:
 *                 type: boolean
 *               is_system:
 *                 type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Cuenta contable creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingAccounts'
 *       '400':
 *         description: Error al crear la cuenta
 *       '404':
 *         description: Cuenta padre no encontrada
 *       '422':
 *         description: Código duplicado o level no coincide con parent.level + 1
 */
router.post('/', [
  writeLimiter,
  authMiddleware,
  valiAddRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.ADD)
], addRecord);

/**
 * @openapi
 * /accounting/accounts/{id}:
 *   put:
 *     tags:
 *       - accounting-accounts
 *     summary: Actualizar cuenta contable
 *     description: Modifica una cuenta contable existente. No se puede cambiar el tipo si tiene movimientos registrados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Identificador de la cuenta contable
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 maxLength: 20
 *               name:
 *                 type: string
 *                 maxLength: 120
 *               type:
 *                 type: string
 *                 enum: [activo, pasivo, capital, ingreso, egreso, costo]
 *               nature:
 *                 type: string
 *                 enum: [deudora, acreedora]
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               parent_id:
 *                 type: integer
 *               allows_movements:
 *                 type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Cuenta modificada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/accountingAccounts'
 *       '404':
 *         description: Cuenta no encontrada
 *       '422':
 *         description: Cambio de tipo no permitido con movimientos existentes
 */
router.put('/:id', [
  writeLimiter,
  authMiddleware,
  valiUpdateRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.UPDATE)
], updateRecord);

/**
 * @openapi
 * /accounting/accounts/{id}:
 *   delete:
 *     tags:
 *       - accounting-accounts
 *     summary: Desactivar cuenta contable
 *     description: Desactiva una cuenta contable (active = false). Solo cuentas no de sistema, sin hijos y sin movimientos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Identificador de la cuenta contable
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Cuenta desactivada correctamente
 *       '404':
 *         description: Cuenta no encontrada
 *       '422':
 *         description: Cuenta de sistema, con hijos activos o con movimientos no puede desactivarse
 */
router.delete('/:id', [
  deleteLimiter,
  authMiddleware,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], ACCOUNTING_ACCOUNT.DELETE)
], deleteRecord);

module.exports = router;
