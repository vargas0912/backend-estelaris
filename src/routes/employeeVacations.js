const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, validateGetByEmployee, valiRequestVacation, valiApproveReject } = require('../validators/employeeVacations');

const authMidleware = require('../middlewares/session');
const branchScope = require('../middlewares/branchScope');
const checkRol = require('../middlewares/rol');
const payrollModuleGuard = require('../middlewares/payrollModuleGuard');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecords, getRecord, getRecordsByEmployee, createRecord, approveRecord, rejectRecord, deleteRecord } = require('../controllers/employeeVacations');
const { EMPLOYEE_VACATION } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /employeeVacations:
 *   get:
 *     tags:
 *       - employeeVacations
 *     summary: Lista de solicitudes de vacaciones
 *     description: Obtener todas las solicitudes de vacaciones de la sucursal (paginado)
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       '200':
 *         description: Lista paginada de solicitudes de vacaciones
 *       '422':
 *         description: Error de validación
 */
router.get('/', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_VACATION.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /employeeVacations/employee/{employee_id}:
 *   get:
 *     tags:
 *       - employeeVacations
 *     summary: Vacaciones por empleado
 *     description: Obtener solicitudes de vacaciones de un empleado específico
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: employee_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista paginada de vacaciones del empleado
 *       '422':
 *         description: Error de validación
 */
router.get('/employee/:employee_id', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetByEmployee,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_VACATION.VIEW_ALL)
], getRecordsByEmployee);

/**
 * @openapi
 * /employeeVacations/{id}:
 *   get:
 *     tags:
 *       - employeeVacations
 *     summary: Solicitud de vacaciones por id
 *     description: Obtener el detalle de una solicitud de vacaciones
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detalle de la solicitud de vacaciones
 *       '404':
 *         description: Solicitud no encontrada
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], EMPLOYEE_VACATION.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /employeeVacations:
 *   post:
 *     tags:
 *       - employeeVacations
 *     summary: Crear solicitud de vacaciones (admin)
 *     description: Registrar directamente una solicitud de vacaciones para un empleado. El campo `days` se calcula automáticamente en el backend a partir de `start_date` y `end_date`.
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
 *               - start_date
 *               - end_date
 *             properties:
 *               employee_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Solicitud creada correctamente
 *       '422':
 *         description: Error de validación
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiRequestVacation,
  checkRol([ROLE.ADMIN], EMPLOYEE_VACATION.ADD)
], createRecord);

/**
 * @openapi
 * /employeeVacations/{id}/approve:
 *   post:
 *     tags:
 *       - employeeVacations
 *     summary: Aprobar solicitud de vacaciones
 *     description: Cambiar estado de la solicitud a Aprobado
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Solicitud aprobada
 *       '404':
 *         description: Solicitud no encontrada
 *       '422':
 *         description: La solicitud no está en estado Pendiente
 */
router.post('/:id/approve', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiApproveReject,
  checkRol([ROLE.ADMIN], EMPLOYEE_VACATION.APPROVE)
], approveRecord);

/**
 * @openapi
 * /employeeVacations/{id}/reject:
 *   post:
 *     tags:
 *       - employeeVacations
 *     summary: Rechazar solicitud de vacaciones
 *     description: Cambiar estado de la solicitud a Rechazado
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Solicitud rechazada
 *       '404':
 *         description: Solicitud no encontrada
 *       '422':
 *         description: La solicitud no está en estado Pendiente
 */
router.post('/:id/reject', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiApproveReject,
  checkRol([ROLE.ADMIN], EMPLOYEE_VACATION.APPROVE)
], rejectRecord);

/**
 * @openapi
 * /employeeVacations/{id}:
 *   delete:
 *     tags:
 *       - employeeVacations
 *     summary: Eliminar solicitud de vacaciones
 *     description: Eliminación lógica de una solicitud de vacaciones
 *     security:
 *       - bearerAuth: []
 *         branchHeader: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Solicitud eliminada correctamente
 *       '422':
 *         description: Error de validación
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.ADMIN], EMPLOYEE_VACATION.DELETE)
], deleteRecord);

module.exports = router;
