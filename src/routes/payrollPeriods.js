const express = require('express');
const router = express.Router();

const { validateGetAll, validateGetRecord, valiGeneratePeriod, valiUpdatePeriod } = require('../validators/payrollPeriods');

const authMidleware = require('../middlewares/session');
const branchScope = require('../middlewares/branchScope');
const checkRol = require('../middlewares/rol');
const payrollModuleGuard = require('../middlewares/payrollModuleGuard');
const { readLimiter, writeLimiter, deleteLimiter } = require('../middlewares/rateLimiters');

const { getRecords, getRecord, createRecord, updateRecord, approveRecord, deleteRecord } = require('../controllers/payrollPeriods');
const { PAYROLL } = require('../constants/modules');
const { ROLE } = require('../constants/roles');

/**
 * @openapi
 * /payrollPeriods:
 *    get:
 *      tags:
 *        - payrollPeriods
 *      summary: Lista de períodos de nómina
 *      description: Obtener todos los períodos de nómina de la sucursal activa (paginado)
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
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
 *        - in: query
 *          name: status
 *          schema:
 *            type: string
 *            enum:
 *              - Borrador
 *              - Aprobado
 *              - Pagado
 *          description: Filtra por estado del período de nómina
 *      responses:
 *        '200':
 *          description: Lista de períodos de nómina paginada
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  periods:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/payrollPeriods'
 *                  pagination:
 *                    $ref: '#/components/schemas/pagination'
 *        '401':
 *          description: No autorizado
 */
router.get('/', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetAll,
  checkRol([ROLE.USER, ROLE.ADMIN], PAYROLL.VIEW_ALL)
], getRecords);

/**
 * @openapi
 * /payrollPeriods/{id}:
 *    get:
 *      tags:
 *        - payrollPeriods
 *      summary: Período de nómina por ID
 *      description: Retorna el período con sus líneas de nómina incluidas
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *          description: Identificador del período de nómina
 *      responses:
 *        '200':
 *          description: Período de nómina con sus líneas
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  period:
 *                    $ref: '#/components/schemas/payrollPeriods'
 *        '404':
 *          description: Período de nómina no encontrado
 */
router.get('/:id', [
  readLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.USER, ROLE.ADMIN], PAYROLL.VIEW_ALL)
], getRecord);

/**
 * @openapi
 * /payrollPeriods:
 *    post:
 *      tags:
 *        - payrollPeriods
 *      summary: Generar período de nómina
 *      description: Crea un período de nómina en estado Borrador y genera una línea por cada empleado activo de la sucursal, aplicando descuentos de préstamos activos automáticamente
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - start_date
 *                - end_date
 *                - payment_date
 *                - frequency
 *              properties:
 *                name:
 *                  type: string
 *                start_date:
 *                  type: string
 *                  format: date
 *                end_date:
 *                  type: string
 *                  format: date
 *                payment_date:
 *                  type: string
 *                  format: date
 *                frequency:
 *                  type: string
 *                  enum:
 *                    - Quincenal
 *                    - Mensual
 *                    - Semanal
 *      responses:
 *        '201':
 *          description: Período de nómina generado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  period:
 *                    $ref: '#/components/schemas/payrollPeriods'
 *        '422':
 *          description: NO_ACTIVE_EMPLOYEES — No hay empleados activos en la sucursal
 */
router.post('/', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiGeneratePeriod,
  checkRol([ROLE.ADMIN], PAYROLL.ADD)
], createRecord);

/**
 * @openapi
 * /payrollPeriods/{id}/approve:
 *    post:
 *      tags:
 *        - payrollPeriods
 *      summary: Pagar período de nómina
 *      description: Aprueba el período, marca todas las líneas como Pagado, aplica abonos a préstamos y genera póliza contable (cuenta 611 Sueldos y Salarios)
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *          description: Identificador del período de nómina a aprobar
 *      responses:
 *        '200':
 *          description: Período aprobado y pagado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  period:
 *                    $ref: '#/components/schemas/payrollPeriods'
 *        '404':
 *          description: Período de nómina no encontrado
 *        '422':
 *          description: PERIOD_NOT_IN_DRAFT — El período no está en estado Borrador
 */
router.post('/:id/approve', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.ADMIN], PAYROLL.APPROVE)
], approveRecord);

/**
 * @openapi
 * /payrollPeriods/{id}:
 *    put:
 *      tags:
 *        - payrollPeriods
 *      summary: Actualizar período de nómina
 *      description: Permite modificar nombre, fecha de pago y frecuencia. Solo disponible en estado Borrador.
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *          description: Identificador del período de nómina a actualizar
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                payment_date:
 *                  type: string
 *                  format: date
 *                frequency:
 *                  type: string
 *                  enum:
 *                    - Quincenal
 *                    - Mensual
 *                    - Semanal
 *      responses:
 *        '200':
 *          description: Período de nómina actualizado correctamente
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  period:
 *                    $ref: '#/components/schemas/payrollPeriods'
 *        '404':
 *          description: Período de nómina no encontrado
 *        '422':
 *          description: PERIOD_NOT_EDITABLE — El período no está en estado Borrador
 */
router.put('/:id', [
  writeLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  valiUpdatePeriod,
  checkRol([ROLE.ADMIN], PAYROLL.ADD)
], updateRecord);

/**
 * @openapi
 * /payrollPeriods/{id}:
 *    delete:
 *      tags:
 *        - payrollPeriods
 *      summary: Eliminar período de nómina
 *      description: Eliminación lógica. Solo permitido en estado Borrador.
 *      security:
 *        - bearerAuth: []
 *          branchHeader: []
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: integer
 *          description: Identificador del período de nómina a eliminar
 *      responses:
 *        '200':
 *          description: Período de nómina eliminado correctamente
 *        '404':
 *          description: Período de nómina no encontrado
 *        '422':
 *          description: PERIOD_NOT_DELETABLE — El período no está en estado Borrador
 */
router.delete('/:id', [
  deleteLimiter,
  authMidleware,
  payrollModuleGuard,
  branchScope,
  validateGetRecord,
  checkRol([ROLE.ADMIN], PAYROLL.DELETE)
], deleteRecord);

module.exports = router;
