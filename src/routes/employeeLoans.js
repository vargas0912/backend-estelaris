const express = require('express');
const router = express.Router();

const {
  validateGetAll,
  validateGetRecord,
  validateGetByEmployee,
  valiRequestLoan,
  valiApproveLoan
} = require('../validators/employeeLoans');

const authMidleware = require('../middlewares/session');
const branchScope = require('../middlewares/branchScope');
const checkRol = require('../middlewares/rol');
const payrollModuleGuard = require('../middlewares/payrollModuleGuard');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const {
  getRecords,
  getRecord,
  getRecordsByEmployee,
  createRecord,
  approveRecord,
  cancelRecord,
  deleteRecord
} = require('../controllers/employeeLoans');

const { EMPLOYEE_LOAN } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /employeeLoans:
 *   get:
 *     tags:
 *       - employeeLoans
 *     summary: Lista de préstamos de empleados
 *     description: Obtener la lista paginada de préstamos de empleados de la sucursal activa
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Registros por página
 *     responses:
 *       '200':
 *         description: Lista paginada de préstamos
 *       '401':
 *         description: No autorizado
 *       '422':
 *         description: Error de validación
 */
router.get('/', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_LOAN.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /employeeLoans/employee/{employee_id}:
 *   get:
 *     tags:
 *       - employeeLoans
 *     summary: Préstamos por empleado
 *     description: Obtener lista paginada de préstamos de un empleado específico
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: employee_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       '200':
 *         description: Lista paginada de préstamos del empleado
 *       '401':
 *         description: No autorizado
 *       '422':
 *         description: Error de validación
 */
router.get('/employee/:employee_id', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetByEmployee,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_LOAN.VIEW_ALL)
], getRecordsByEmployee);

/**
 * @openapi
 * /employeeLoans/{id}:
 *   get:
 *     tags:
 *       - employeeLoans
 *     summary: Préstamo por identificador
 *     description: Consultar el detalle de un préstamo por su id
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Detalle del préstamo
 *       '404':
 *         description: Préstamo no encontrado
 *       '422':
 *         description: Error de validación
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_LOAN.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /employeeLoans:
 *   post:
 *     tags:
 *       - employeeLoans
 *     summary: Solicitar préstamo
 *     description: Registrar una nueva solicitud de préstamo para un empleado
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - amount
 *               - disbursement_date
 *             properties:
 *               employee_id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *               reason:
 *                 type: string
 *               disbursement_date:
 *                 type: string
 *                 format: date
 *               installment_amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       '201':
 *         description: Préstamo registrado exitosamente
 *       '400':
 *         description: Error al registrar el préstamo
 *       '422':
 *         description: Error de validación
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiRequestLoan,
  checkRol([ROLE.ADMIN], EMPLOYEE_LOAN.ADD)
], createRecord);

/**
 * @openapi
 * /employeeLoans/{id}/approve:
 *   post:
 *     tags:
 *       - employeeLoans
 *     summary: Aprobar préstamo
 *     description: Aprobar una solicitud de préstamo pendiente y establecer el monto de cuota
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - installment_amount
 *             properties:
 *               installment_amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       '200':
 *         description: Préstamo aprobado exitosamente
 *       '404':
 *         description: Préstamo no encontrado
 *       '422':
 *         description: LOAN_NOT_PENDING — el préstamo no está en estado pendiente
 */
router.post('/:id/approve', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiApproveLoan,
  checkRol([ROLE.ADMIN], EMPLOYEE_LOAN.APPROVE)
], approveRecord);

/**
 * @openapi
 * /employeeLoans/{id}/cancel:
 *   post:
 *     tags:
 *       - employeeLoans
 *     summary: Cancelar préstamo
 *     description: Cancelar un préstamo que aún puede ser cancelado
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Préstamo cancelado exitosamente
 *       '404':
 *         description: Préstamo no encontrado
 *       '422':
 *         description: LOAN_NOT_CANCELLABLE — el préstamo no puede cancelarse en su estado actual
 */
router.post('/:id/cancel', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.ADMIN], EMPLOYEE_LOAN.DELETE)
], cancelRecord);

/**
 * @openapi
 * /employeeLoans/{id}:
 *   delete:
 *     tags:
 *       - employeeLoans
 *     summary: Eliminar préstamo
 *     description: Eliminación lógica de un préstamo de empleado
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: Préstamo eliminado exitosamente
 *       '400':
 *         description: Id inválido
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.ADMIN], EMPLOYEE_LOAN.DELETE)
], deleteRecord);

module.exports = router;
