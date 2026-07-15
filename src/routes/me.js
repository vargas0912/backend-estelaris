const express = require('express');
const router = express.Router();

const authMidleware = require('../middlewares/session');
const checkRol = require('../middlewares/rol');
const employeeScope = require('../middlewares/employeeScope');
const payrollModuleGuard = require('../middlewares/payrollModuleGuard');
const { readLimiter, writeLimiter } = require('../middlewares/rateLimiters');

const { valiMeRequestVacation } = require('../validators/employeeVacations');
const { valiMeRequestLoan } = require('../validators/employeeLoans');

const {
  getProfile,
  getPayroll,
  getPayrollLine,
  getVacations,
  createVacationRequest,
  getLoans,
  createLoanRequest
} = require('../controllers/me');

const { ME } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

const baseMiddleware = [authMidleware, employeeScope];

const payrollBase = (priv) => [readLimiter, ...baseMiddleware, payrollModuleGuard, checkRol([ROLE.USER], priv)];
const payrollPost = (priv, ...validators) => [writeLimiter, ...baseMiddleware, payrollModuleGuard, ...validators, checkRol([ROLE.USER], priv)];

/**
 * @openapi
 * /me/profile:
 *   get:
 *     tags:
 *       - me
 *     summary: Perfil del empleado autenticado
 *     description: Retorna los datos del empleado vinculado al usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Datos del empleado
 *       '403':
 *         description: Usuario sin empleado vinculado
 */
router.get('/profile', [
  readLimiter,
  ...baseMiddleware,
  checkRol([ROLE.USER], ME.VIEW_PROFILE)
], getProfile);

/**
 * @openapi
 * /me/payroll:
 *   get:
 *     tags:
 *       - me
 *     summary: Historial de nómina del empleado autenticado
 *     description: Retorna las líneas de nómina del empleado con información del período
 *     security:
 *       - bearerAuth: []
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
 *         description: Lista paginada de líneas de nómina
 */
router.get('/payroll', payrollBase(ME.VIEW_PAYROLL), getPayroll);

/**
 * @openapi
 * /me/payroll/{line_id}:
 *   get:
 *     tags:
 *       - me
 *     summary: Detalle de una línea de nómina
 *     description: Retorna una línea de nómina específica que pertenezca al empleado autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: line_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detalle de la línea de nómina
 *       '404':
 *         description: Línea no encontrada o no pertenece al empleado
 */
router.get('/payroll/:line_id', payrollBase(ME.VIEW_PAYROLL), getPayrollLine);

/**
 * @openapi
 * /me/vacations:
 *   get:
 *     tags:
 *       - me
 *     summary: Solicitudes de vacaciones del empleado autenticado
 *     security:
 *       - bearerAuth: []
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
 */
router.get('/vacations', payrollBase(ME.VIEW_VACATIONS), getVacations);

/**
 * @openapi
 * /me/vacations/request:
 *   post:
 *     tags:
 *       - me
 *     summary: Solicitar vacaciones
 *     description: El empleado autenticado solicita un período de vacaciones
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *         description: Solicitud registrada correctamente
 *       '422':
 *         description: Error de validación
 */
router.post('/vacations/request', payrollPost(ME.REQUEST_VACATION, ...valiMeRequestVacation), createVacationRequest);

/**
 * @openapi
 * /me/loans:
 *   get:
 *     tags:
 *       - me
 *     summary: Préstamos del empleado autenticado
 *     security:
 *       - bearerAuth: []
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
 *         description: Lista paginada de préstamos
 */
router.get('/loans', payrollBase(ME.VIEW_LOANS), getLoans);

/**
 * @openapi
 * /me/loans/request:
 *   post:
 *     tags:
 *       - me
 *     summary: Solicitar un préstamo
 *     description: El empleado autenticado solicita un préstamo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               reason:
 *                 type: string
 *               disbursement_date:
 *                 type: string
 *                 format: date
 *               installment_amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       '201':
 *         description: Solicitud de préstamo registrada correctamente
 *       '422':
 *         description: Error de validación
 */
router.post('/loans/request', payrollPost(ME.REQUEST_LOAN, ...valiMeRequestLoan), createLoanRequest);

module.exports = router;
